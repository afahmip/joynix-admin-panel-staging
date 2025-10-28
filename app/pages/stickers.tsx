import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { apiClient } from '../lib/api-client'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Switch } from '../components/ui/switch'
import { Textarea } from '../components/ui/textarea'
import type { Sticker, StickerResponse } from '../../types/app/+types/stickers'
import type { StickerPack } from '../../types/app/+types/sticker-packs'

// URL validation function
const isValidUrl = (url: string): boolean => {
  if (!url.trim()) return true // Allow empty URLs
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

async function fetchStickers(packId: number, page: number, pageSize: number): Promise<StickerResponse> {
  return apiClient.get<StickerResponse>(`stickers/packs/${packId}/stickers?page=${page}&limit=${pageSize}`)
}

async function fetchStickerPack(packId: number): Promise<StickerPack> {
  return apiClient.get<StickerPack>(`stickers/packs/${packId}`)
}

export function StickersPage() {
  const { packId } = useParams<{ packId: string }>()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [selectedSticker, setSelectedSticker] = useState<Sticker | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [stickerToDelete, setStickerToDelete] = useState<Sticker | null>(null)
  const [editData, setEditData] = useState<Partial<Omit<Sticker, 'tags'> & { tags: string }>>({})
  const [createData, setCreateData] = useState({
    name: '',
    description: '',
    tags: '',
    is_animated: false,
    sort_order: 1,
    sticker_url: '',
  })

  const queryClient = useQueryClient()
  
  // Fetch sticker pack info
  const { data: packData } = useQuery({
    queryKey: ['sticker-pack', packId],
    queryFn: () => fetchStickerPack(Number(packId)),
    enabled: !!packId,
  })

  // Fetch stickers
  const { data, isLoading, error } = useQuery({
    queryKey: ['stickers', packId, page, pageSize],
    queryFn: () => fetchStickers(Number(packId), page, pageSize),
    enabled: !!packId,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Omit<Sticker, 'tags'> & { tags: string[] }> }) => 
      apiClient.put(`stickers/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stickers', packId] })
      setIsModalOpen(false)
      setSelectedSticker(null)
    },
  })

  const createMutation = useMutation({
    mutationFn: (data: Omit<typeof createData, 'tags'> & { tags: string[]; sticker_pack_id: number }) => 
      apiClient.post('stickers', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stickers', packId] })
      setIsCreateModalOpen(false)
      setCreateData({
        name: '',
        description: '',
        tags: '',
        is_animated: false,
        sort_order: 1,
        sticker_url: '',
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`stickers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stickers', packId] })
      setIsDeleteModalOpen(false)
      setStickerToDelete(null)
    },
  })

  const handleRowClick = (sticker: Sticker) => {
    setSelectedSticker(sticker)
    setEditData({
      name: sticker.name,
      description: sticker.description,
      tags: Array.isArray(sticker.tags) ? sticker.tags.join(',') : sticker.tags || '',
      is_animated: sticker.is_animated,
      sort_order: sticker.sort_order,
      sticker_url: sticker.sticker_url,
    })
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (selectedSticker && isValidUrl(editData.sticker_url || '')) {
      const dataToSave = {
        ...editData,
        tags: editData.tags ? editData.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag) : []
      }
      updateMutation.mutate({
        id: selectedSticker.id!,
        data: dataToSave,
      })
    }
  }

  const handleCancel = () => {
    setIsModalOpen(false)
    setSelectedSticker(null)
    setEditData({})
  }

  const handleCreateClick = () => {
    setIsCreateModalOpen(true)
  }

  const handleCreateSave = () => {
    if (isValidUrl(createData.sticker_url) && packId) {
      const dataToSave = {
        ...createData,
        tags: createData.tags ? createData.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag) : [],
        sticker_pack_id: Number(packId),
      }
      createMutation.mutate(dataToSave)
    }
  }

  const handleCreateCancel = () => {
    setIsCreateModalOpen(false)
    setCreateData({
      name: '',
      description: '',
      tags: '',
      is_animated: false,
      sort_order: 1,
      sticker_url: '',
    })
  }

  const handleDeleteClick = (sticker: Sticker, e: React.MouseEvent) => {
    e.stopPropagation()
    setStickerToDelete(sticker)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (stickerToDelete) {
      deleteMutation.mutate(stickerToDelete.id!)
    }
  }

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false)
    setStickerToDelete(null)
  }

  const handleBackToPacks = () => {
    navigate('/sticker-packs')
  }

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={handleBackToPacks}
            className="px-3 py-1 text-sm font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 cursor-pointer"
          >
            ← Back to Sticker Packs
          </button>
          <h1 className="text-2xl font-bold">Stickers</h1>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Loading stickers...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={handleBackToPacks}
            className="px-3 py-1 text-sm font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 cursor-pointer"
          >
            ← Back to Sticker Packs
          </button>
          <h1 className="text-2xl font-bold">Stickers</h1>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-center py-8">
            <div className="text-red-500">Error loading stickers: {(error as Error).message}</div>
          </div>
        </div>
      </div>
    )
  }

  const stickers: Sticker[] = (data as any)?.data?.stickers || []
  const pagination = (data as any)?.data?.pagination
  const pack = (packData as any)?.data || {}

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBackToPacks}
            className="px-3 py-1 text-sm font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 cursor-pointer"
          >
            ← Back to Sticker Packs
          </button>
          <div>
            <h1 className="text-2xl font-bold">Stickers</h1>
            {pack.name && (
              <p className="text-sm text-gray-600">Pack: {pack.name}</p>
            )}
          </div>
        </div>
        <button
          onClick={handleCreateClick}
          className="px-4 py-2 cursor-pointer bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Create Sticker
        </button>
      </div>

      <div className="mt-4">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sort Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tags
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stickers.map((sticker) => (
                <tr key={sticker.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleRowClick(sticker)}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {sticker.thumbnail_url && (
                        <img src={sticker.thumbnail_url} alt={sticker.name} className="h-8 w-8 rounded mr-3" />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{sticker.name}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{sticker.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      sticker.is_animated ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {sticker.is_animated ? 'Animated' : 'Static'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sticker.sort_order}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="max-w-xs truncate">
                      {Array.isArray(sticker.tags) ? sticker.tags.join(', ') : sticker.tags}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {sticker.created_at ? new Date(sticker.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={(e) => handleDeleteClick(sticker, e)}
                      className="px-3 py-1 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {stickers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No stickers found in this pack
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </Button>
        <span className="text-sm text-gray-700">
          Page {page} of {pagination?.total_pages || 1}
        </span>
        <Button
          variant="outline"
          onClick={() => setPage((p) => p + 1)}
          disabled={page === pagination?.total_pages || !pagination?.total_pages}
        >
          Next
        </Button>
      </div>

      {/* Edit Modal */}
      {isModalOpen && selectedSticker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Edit Sticker: {selectedSticker.name}
              </h3>
            </div>
            
            <div className="px-6 py-4">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    <Input
                      value={editData.name || ''}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sort Order
                    </label>
                    <Input
                      type="number"
                      value={editData.sort_order || ''}
                      onChange={(e) => setEditData({ ...editData, sort_order: parseInt(e.target.value) || 1 })}
                      className="w-full"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <Textarea
                    value={editData.description || ''}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    className="w-full min-h-[100px]"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editData.is_animated || false}
                    onCheckedChange={(checked) => setEditData({ ...editData, is_animated: Boolean(checked) })}
                    id="edit-animated"
                  />
                  <label htmlFor="edit-animated" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Animated
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags (comma-separated)
                    </label>
                    <Input
                      value={editData.tags || ''}
                      onChange={(e) => setEditData({ ...editData, tags: e.target.value })}
                      placeholder="happy,cute,smile"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sticker URL
                    </label>
                    <Input
                      value={editData.sticker_url || ''}
                      onChange={(e) => setEditData({ ...editData, sticker_url: e.target.value })}
                      placeholder="https://example.com/sticker.png"
                      className={`w-full ${!isValidUrl(editData.sticker_url || '') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    />
                    {!isValidUrl(editData.sticker_url || '') && (editData.sticker_url || '').trim() && (
                      <p className="mt-1 text-sm text-red-600">Please enter a valid URL</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={updateMutation.isPending || !isValidUrl(editData.sticker_url || '')}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {updateMutation.isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Create New Sticker
              </h3>
            </div>
            
            <div className="px-6 py-4">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    <Input
                      value={createData.name}
                      onChange={(e) => setCreateData({ ...createData, name: e.target.value })}
                      placeholder="Enter sticker name"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sort Order
                    </label>
                    <Input
                      type="number"
                      value={createData.sort_order}
                      onChange={(e) => setCreateData({ ...createData, sort_order: parseInt(e.target.value) || 1 })}
                      className="w-full"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <Textarea
                    value={createData.description}
                    onChange={(e) => setCreateData({ ...createData, description: e.target.value })}
                    placeholder="Enter description"
                    className="w-full min-h-[100px]"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={createData.is_animated}
                    onCheckedChange={(checked) => setCreateData({ ...createData, is_animated: Boolean(checked) })}
                    id="create-animated"
                  />
                  <label htmlFor="create-animated" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Animated
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags (comma-separated)
                    </label>
                    <Input
                      value={createData.tags}
                      onChange={(e) => setCreateData({ ...createData, tags: e.target.value })}
                      placeholder="happy,cute,smile"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sticker URL
                    </label>
                    <Input
                      value={createData.sticker_url}
                      onChange={(e) => setCreateData({ ...createData, sticker_url: e.target.value })}
                      placeholder="https://example.com/sticker.png"
                      className={`w-full ${!isValidUrl(createData.sticker_url) ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    />
                    {!isValidUrl(createData.sticker_url) && createData.sticker_url.trim() && (
                      <p className="mt-1 text-sm text-red-600">Please enter a valid URL</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={handleCreateCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSave}
                disabled={createMutation.isPending || !isValidUrl(createData.sticker_url)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {createMutation.isPending ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && stickerToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Delete Sticker
              </h3>
            </div>
            
            <div className="px-6 py-4">
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to delete <strong>{stickerToDelete.name}</strong>? 
                This action cannot be undone.
              </p>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
