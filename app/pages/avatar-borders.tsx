import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { apiClient } from '../lib/api-client'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Switch } from '../components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Textarea } from '../components/ui/textarea'
import type { AvatarBorder, AvatarBorderResponse } from '../../types/app/+types/avatar-borders'

const RARITY_OPTIONS = [
  { value: 'common', label: 'Common' },
  { value: 'rare', label: 'Rare' },
  { value: 'epic', label: 'Epic' },
  { value: 'legendary', label: 'Legendary' },
]

const BORDER_TYPE_OPTIONS = [
  { value: 'basic', label: 'Basic' },
  { value: 'animated', label: 'Animated' },
  { value: 'special', label: 'Special' },
]


async function fetchAvatarBorders(page: number, pageSize: number): Promise<AvatarBorderResponse> {
  return apiClient.get<AvatarBorderResponse>(`gamification/avatar-borders?page=${page}&page_size=${pageSize}`)
}

export function AvatarBordersPage() {
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [selectedBorder, setSelectedBorder] = useState<AvatarBorder | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [borderToDelete, setBorderToDelete] = useState<AvatarBorder | null>(null)
  const [editData, setEditData] = useState<Partial<AvatarBorder>>({})
  const [editImageFile, setEditImageFile] = useState<File | null>(null)
  const [createData, setCreateData] = useState({
    name: '',
    code: '',
    border_type: 'basic',
    rarity: 'common',
    description: '',
    is_hidden: false,
    sort_order: 0,
    unlock_condition: '',
  })
  const [createImageFile, setCreateImageFile] = useState<File | null>(null)

  const queryClient = useQueryClient()
  const { data, isLoading, error } = useQuery({
    queryKey: ['avatar-borders', page, pageSize],
    queryFn: () => fetchAvatarBorders(page, pageSize),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data, imageFile }: { id: number; data: Partial<AvatarBorder>; imageFile?: File | null }) => {
      const formData = new FormData()
      
      // Add all the form fields
      if (data.name) formData.append('name', data.name)
      if (data.code) formData.append('code', data.code)
      if (data.border_type) formData.append('border_type', data.border_type)
      if (data.rarity) formData.append('rarity', data.rarity)
      if (data.description) formData.append('description', data.description)
      if (data.unlock_condition) formData.append('unlock_condition', data.unlock_condition)
      if (data.sort_order !== undefined) formData.append('sort_order', data.sort_order.toString())
      if (data.is_hidden !== undefined) formData.append('is_hidden', data.is_hidden.toString())
      
      // Add image file if provided
      if (imageFile) {
        formData.append('image', imageFile)
      }
      
      return apiClient.putFormData(`gamification/avatar-borders/${id}`, formData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['avatar-borders'] })
      setIsModalOpen(false)
      setSelectedBorder(null)
      setEditImageFile(null)
    },
  })

  const createMutation = useMutation({
    mutationFn: ({ data, imageFile }: { data: typeof createData; imageFile?: File | null }) => {
      const formData = new FormData()
      
      // Add all the form fields
      formData.append('name', data.name)
      formData.append('code', data.code)
      formData.append('border_type', data.border_type)
      formData.append('rarity', data.rarity)
      formData.append('description', data.description)
      formData.append('unlock_condition', data.unlock_condition)
      formData.append('sort_order', data.sort_order.toString())
      formData.append('is_hidden', data.is_hidden.toString())
      
      // Add image file if provided
      if (imageFile) {
        formData.append('image', imageFile)
      }
      
      return apiClient.postFormData('gamification/avatar-borders', formData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['avatar-borders'] })
      setIsCreateModalOpen(false)
      setCreateData({
        name: '',
        code: '',
        border_type: 'basic',
        rarity: 'common',
        description: '',
        is_hidden: false,
        sort_order: 0,
        unlock_condition: '',
      })
      setCreateImageFile(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`gamification/avatar-borders/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['avatar-borders'] })
      setIsDeleteModalOpen(false)
      setBorderToDelete(null)
    },
  })

  const handleRowClick = (border: AvatarBorder) => {
    setSelectedBorder(border)
    setEditData({
      name: border.name,
      code: border.code,
      border_type: border.border_type,
      rarity: border.rarity,
      description: border.description,
      is_hidden: border.is_hidden,
      sort_order: border.sort_order,
      unlock_condition: border.unlock_condition,
    })
    setEditImageFile(null)
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (selectedBorder) {
      updateMutation.mutate({
        id: selectedBorder.id!,
        data: editData,
        imageFile: editImageFile,
      })
    }
  }

  const handleCancel = () => {
    setIsModalOpen(false)
    setSelectedBorder(null)
    setEditData({})
    setEditImageFile(null)
  }

  const handleCreateClick = () => {
    setIsCreateModalOpen(true)
  }

  const handleCreateSave = () => {
    createMutation.mutate({
      data: createData,
      imageFile: createImageFile,
    })
  }

  const handleCreateCancel = () => {
    setIsCreateModalOpen(false)
    setCreateData({
      name: '',
      code: '',
      border_type: 'basic',
      rarity: 'common',
      description: '',
      is_hidden: false,
      sort_order: 0,
      unlock_condition: '',
    })
    setCreateImageFile(null)
  }

  const handleDeleteClick = (border: AvatarBorder, e: React.MouseEvent) => {
    e.stopPropagation()
    setBorderToDelete(border)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (borderToDelete) {
      deleteMutation.mutate(borderToDelete.id!)
    }
  }

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false)
    setBorderToDelete(null)
  }

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Avatar Borders</h1>
        <div className="mt-4">
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Loading avatar borders...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Avatar Borders</h1>
        <div className="mt-4">
          <div className="flex items-center justify-center py-8">
            <div className="text-red-500">Error loading avatar borders: {(error as Error).message}</div>
          </div>
        </div>
      </div>
    )
  }

  const borders: AvatarBorder[] = (data as any)?.data?.data || []
  const pagination = (data as any)?.data?.pagination

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Avatar Borders</h1>
        <button
          onClick={handleCreateClick}
          className="px-4 py-2 cursor-pointer bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Create Avatar Border
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
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rarity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hidden
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sort Order
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
              {borders.map((border) => (
                <tr key={border.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleRowClick(border)}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {border.image_url && (
                        <img src={border.image_url} alt={border.name} className="h-8 w-8 rounded-full mr-3" />
                      )}
                      <div className="text-sm font-medium text-gray-900">{border.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{border.code}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{border.border_type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      border.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-800' :
                      border.rarity === 'epic' ? 'bg-purple-100 text-purple-800' :
                      border.rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {border.rarity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      border.is_hidden ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {border.is_hidden ? 'Hidden' : 'Visible'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{border.sort_order}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(border.created_at!).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={(e) => handleDeleteClick(border, e)}
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
        {borders.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No avatar borders found
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
      {isModalOpen && selectedBorder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Edit Avatar Border: {selectedBorder.name}
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
                      Code
                    </label>
                    <Input
                      value={editData.code || ''}
                      onChange={(e) => setEditData({ ...editData, code: e.target.value })}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Border Type
                    </label>
                    <Select value={editData.border_type} onValueChange={(value) => setEditData({ ...editData, border_type: value })}>
                      <SelectTrigger className="w-full cursor-pointer">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {BORDER_TYPE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rarity
                    </label>
                    <Select value={editData.rarity} onValueChange={(value) => setEditData({ ...editData, rarity: value })}>
                      <SelectTrigger className="w-full cursor-pointer">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {RARITY_OPTIONS.map((option) => (
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
                      Image Upload
                    </label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null
                        setEditImageFile(file)
                      }}
                      className="w-full cursor-pointer"
                    />
                    {editImageFile && (
                      <p className="mt-1 text-sm text-green-600">Selected: {editImageFile.name}</p>
                    )}
                    {selectedBorder?.image_url && !editImageFile && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 mb-1">Current image:</p>
                        <img src={selectedBorder.image_url} alt="Current" className="h-16 w-16 object-cover rounded" />
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sort Order
                    </label>
                    <Input
                      type="number"
                      value={editData.sort_order || ''}
                      onChange={(e) => setEditData({ ...editData, sort_order: parseInt(e.target.value) || 0 })}
                      className="w-full cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unlock Condition
                  </label>
                  <Input
                    value={editData.unlock_condition || ''}
                    onChange={(e) => setEditData({ ...editData, unlock_condition: e.target.value })}
                    placeholder="Enter unlock condition"
                    className="w-full"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editData.is_hidden || false}
                    onCheckedChange={(checked) => setEditData({ ...editData, is_hidden: Boolean(checked) })}
                    id="edit-hidden"
                  />
                  <label htmlFor="edit-hidden" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Hidden
                  </label>
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
                Create New Avatar Border
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
                      placeholder="Enter border name"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Code
                    </label>
                    <Input
                      value={createData.code}
                      onChange={(e) => setCreateData({ ...createData, code: e.target.value })}
                      placeholder="Enter border code"
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Border Type
                    </label>
                    <Select value={createData.border_type} onValueChange={(value) => setCreateData({ ...createData, border_type: value })}>
                      <SelectTrigger className="w-full cursor-pointer">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {BORDER_TYPE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rarity
                    </label>
                    <Select value={createData.rarity} onValueChange={(value) => setCreateData({ ...createData, rarity: value })}>
                      <SelectTrigger className="w-full cursor-pointer">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {RARITY_OPTIONS.map((option) => (
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
                      Image Upload
                    </label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null
                        setCreateImageFile(file)
                      }}
                      className="w-full cursor-pointer"
                    />
                    {createImageFile && (
                      <p className="mt-1 text-sm text-green-600">Selected: {createImageFile.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sort Order
                    </label>
                    <Input
                      type="number"
                      value={createData.sort_order}
                      onChange={(e) => setCreateData({ ...createData, sort_order: parseInt(e.target.value) || 0 })}
                      className="w-full cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unlock Condition
                  </label>
                  <Input
                    value={createData.unlock_condition}
                    onChange={(e) => setCreateData({ ...createData, unlock_condition: e.target.value })}
                    placeholder="Enter unlock condition"
                    className="w-full"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={createData.is_hidden}
                    onCheckedChange={(checked) => setCreateData({ ...createData, is_hidden: Boolean(checked) })}
                    id="create-hidden"
                  />
                  <label htmlFor="create-hidden" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Hidden
                  </label>
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
      {isDeleteModalOpen && borderToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Delete Avatar Border
              </h3>
            </div>
            
            <div className="px-6 py-4">
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to delete <strong>{borderToDelete.name}</strong>? 
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
