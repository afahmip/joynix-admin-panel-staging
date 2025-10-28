import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { apiClient } from '../lib/api-client'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Switch } from '../components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Textarea } from '../components/ui/textarea'
import type { StickerPack, StickerPackResponse } from '../../types/app/+types/sticker-packs'

const CATEGORY_OPTIONS = [
  { value: 'general', label: 'General' },
  { value: 'emotions', label: 'Emotions' },
  { value: 'animals', label: 'Animals' },
  { value: 'food', label: 'Food' },
  { value: 'nature', label: 'Nature' },
  { value: 'sports', label: 'Sports' },
  { value: 'holidays', label: 'Holidays' },
]

async function fetchStickerPacks(page: number, pageSize: number): Promise<StickerPackResponse> {
  return apiClient.get<StickerPackResponse>(`stickers/packs/search?page=${page}&limit=${pageSize}`)
}

export function StickerPacksPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [selectedPack, setSelectedPack] = useState<StickerPack | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [packToDelete, setPackToDelete] = useState<StickerPack | null>(null)
  const [editData, setEditData] = useState<Partial<Omit<StickerPack, 'tags'> & { tags: string }>>({})
  const [createData, setCreateData] = useState({
    name: '',
    description: '',
    category: 'general',
    tags: '',
    price_coins: 0,
    is_featured: false,
    is_free_for_all: true,
    is_premium: false,
  })

  const queryClient = useQueryClient()
  const { data, isLoading, error } = useQuery({
    queryKey: ['sticker-packs', page, pageSize],
    queryFn: () => fetchStickerPacks(page, pageSize),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Omit<StickerPack, 'tags'> & { tags: string[] }> }) => 
      apiClient.put(`stickers/packs/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sticker-packs'] })
      setIsModalOpen(false)
      setSelectedPack(null)
    },
  })

  const createMutation = useMutation({
    mutationFn: (data: Omit<typeof createData, 'tags'> & { tags: string[] }) => 
      apiClient.post('stickers/packs', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sticker-packs'] })
      setIsCreateModalOpen(false)
      setCreateData({
        name: '',
        description: '',
        category: 'general',
        tags: '',
        price_coins: 0,
        is_featured: false,
        is_free_for_all: true,
        is_premium: false,
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`stickers/packs/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sticker-packs'] })
      setIsDeleteModalOpen(false)
      setPackToDelete(null)
    },
  })

  const handleRowClick = (pack: StickerPack) => {
    setSelectedPack(pack)
    setEditData({
      name: pack.name,
      description: pack.description,
      category: pack.category,
      tags: Array.isArray(pack.tags) ? pack.tags.join(',') : pack.tags || '',
      price_coins: pack.price_coins,
      is_featured: pack.is_featured,
      is_free_for_all: pack.is_free_for_all,
      is_premium: pack.is_premium,
    })
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (selectedPack) {
      const dataToSave = {
        ...editData,
        tags: editData.tags ? editData.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag) : []
      }
      updateMutation.mutate({
        id: selectedPack.id!,
        data: dataToSave,
      })
    }
  }

  const handleCancel = () => {
    setIsModalOpen(false)
    setSelectedPack(null)
    setEditData({})
  }

  const handleCreateClick = () => {
    setIsCreateModalOpen(true)
  }

  const handleCreateSave = () => {
    const dataToSave = {
      ...createData,
      tags: createData.tags ? createData.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag) : []
    }
    createMutation.mutate(dataToSave)
  }

  const handleCreateCancel = () => {
    setIsCreateModalOpen(false)
    setCreateData({
      name: '',
      description: '',
      category: 'general',
      tags: '',
      price_coins: 0,
      is_featured: false,
      is_free_for_all: true,
      is_premium: false,
    })
  }

  const handleDeleteClick = (pack: StickerPack, e: React.MouseEvent) => {
    e.stopPropagation()
    setPackToDelete(pack)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (packToDelete) {
      deleteMutation.mutate(packToDelete.id!)
    }
  }

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false)
    setPackToDelete(null)
  }

  const handleManageStickers = (pack: StickerPack, e: React.MouseEvent) => {
    e.stopPropagation()
    navigate(`/sticker-packs/${pack.id}/stickers`)
  }

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Sticker Packs</h1>
        <div className="mt-4">
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Loading sticker packs...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Sticker Packs</h1>
        <div className="mt-4">
          <div className="flex items-center justify-center py-8">
            <div className="text-red-500">Error loading sticker packs: {(error as Error).message}</div>
          </div>
        </div>
      </div>
    )
  }

  const packs: StickerPack[] = (data as any)?.data?.sticker_packs || []
  const pagination = (data as any)?.data?.pagination

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Sticker Packs</h1>
        <button
          onClick={handleCreateClick}
          className="px-4 py-2 cursor-pointer bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Create Sticker Pack
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
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price (Coins)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stickers
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
              {packs.map((pack) => (
                <tr key={pack.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleRowClick(pack)}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{pack.name}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">{pack.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{pack.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{pack.price_coins}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      {pack.is_featured && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Featured
                        </span>
                      )}
                      {pack.is_premium && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                          Premium
                        </span>
                      )}
                      {pack.is_free_for_all && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Free
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {pack.stickers?.length || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {pack.created_at ? new Date(pack.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => handleManageStickers(pack, e)}
                        className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      >
                        Manage Stickers
                      </button>
                      <button
                        onClick={(e) => handleDeleteClick(pack, e)}
                        className="px-3 py-1 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {packs.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No sticker packs found
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
      {isModalOpen && selectedPack && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Edit Sticker Pack: {selectedPack.name}
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
                      Category
                    </label>
                    <Select value={editData.category} onValueChange={(value) => setEditData({ ...editData, category: value })}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORY_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags (comma-separated)
                    </label>
                    <Input
                      value={editData.tags || ''}
                      onChange={(e) => setEditData({ ...editData, tags: e.target.value })}
                      placeholder="cute,animals,fun"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (Coins)
                    </label>
                    <Input
                      type="number"
                      value={editData.price_coins || ''}
                      onChange={(e) => setEditData({ ...editData, price_coins: parseInt(e.target.value) || 0 })}
                      className="w-full"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={editData.is_featured || false}
                      onCheckedChange={(checked) => setEditData({ ...editData, is_featured: Boolean(checked) })}
                      id="edit-featured"
                    />
                    <label htmlFor="edit-featured" className="text-sm font-medium text-gray-700 cursor-pointer">
                      Featured
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={editData.is_premium || false}
                      onCheckedChange={(checked) => setEditData({ ...editData, is_premium: Boolean(checked) })}
                      id="edit-premium"
                    />
                    <label htmlFor="edit-premium" className="text-sm font-medium text-gray-700 cursor-pointer">
                      Premium
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={editData.is_free_for_all || false}
                      onCheckedChange={(checked) => setEditData({ ...editData, is_free_for_all: Boolean(checked) })}
                      id="edit-free"
                    />
                    <label htmlFor="edit-free" className="text-sm font-medium text-gray-700 cursor-pointer">
                      Free for All
                    </label>
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
                disabled={updateMutation.isPending}
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
                Create New Sticker Pack
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
                      placeholder="Enter pack name"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <Select value={createData.category} onValueChange={(value) => setCreateData({ ...createData, category: value })}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORY_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags (comma-separated)
                    </label>
                    <Input
                      value={createData.tags}
                      onChange={(e) => setCreateData({ ...createData, tags: e.target.value })}
                      placeholder="cute,animals,fun"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (Coins)
                    </label>
                    <Input
                      type="number"
                      value={createData.price_coins}
                      onChange={(e) => setCreateData({ ...createData, price_coins: parseInt(e.target.value) || 0 })}
                      className="w-full"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={createData.is_featured}
                      onCheckedChange={(checked) => setCreateData({ ...createData, is_featured: Boolean(checked) })}
                      id="create-featured"
                    />
                    <label htmlFor="create-featured" className="text-sm font-medium text-gray-700 cursor-pointer">
                      Featured
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={createData.is_premium}
                      onCheckedChange={(checked) => setCreateData({ ...createData, is_premium: Boolean(checked) })}
                      id="create-premium"
                    />
                    <label htmlFor="create-premium" className="text-sm font-medium text-gray-700 cursor-pointer">
                      Premium
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={createData.is_free_for_all}
                      onCheckedChange={(checked) => setCreateData({ ...createData, is_free_for_all: Boolean(checked) })}
                      id="create-free"
                    />
                    <label htmlFor="create-free" className="text-sm font-medium text-gray-700 cursor-pointer">
                      Free for All
                    </label>
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
                disabled={createMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {createMutation.isPending ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && packToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Delete Sticker Pack
              </h3>
            </div>
            
            <div className="px-6 py-4">
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to delete <strong>{packToDelete.name}</strong>? 
                This will also delete all stickers in this pack. This action cannot be undone.
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
