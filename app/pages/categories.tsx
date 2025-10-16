import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { API_ENDPOINTS } from '../config/api'
import { apiClient } from '../lib/api-client'

interface Category {
  id: number
  name: string
  description: string
  color_code: string
  icon_url: string
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

interface CategoriesApiResponse {
  status: number
  success: boolean
  message: string
  data: {
    categories: Category[]
    metadata: {
      has_next: boolean
      has_previous: boolean
      limit: number
      page: number
      total_pages: number
      total_records: number
    }
  }
  metadata: unknown
}


interface CreateCategoryData {
  name: string
  description: string
  color_code: string
  icon_url: string
  is_active: boolean
  sort_order: number
  metadata?: Record<string, unknown>
}

async function fetchCategories(): Promise<CategoriesApiResponse> {
  return apiClient.get<CategoriesApiResponse>(API_ENDPOINTS.CATEGORIES)
}

async function createCategory(data: CreateCategoryData) {
  return apiClient.post(API_ENDPOINTS.CATEGORY_CREATE_ADMIN, data)
}

async function updateCategory(id: number | string, data: Partial<CreateCategoryData>) {
  return apiClient.put(API_ENDPOINTS.CATEGORY_ADMIN_BY_ID(id), data)
}

async function deleteCategory(id: number | string) {
  return apiClient.delete(API_ENDPOINTS.CATEGORY_ADMIN_BY_ID(id))
}

export function CategoriesPage() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editData, setEditData] = useState<Partial<CreateCategoryData>>({})
  const [createData, setCreateData] = useState<CreateCategoryData>({
    name: '',
    description: '',
    color_code: '#000000',
    icon_url: '',
    is_active: true,
    sort_order: 0,
  })
  const [search, setSearch] = useState('')
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)

  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  })

  // (Optional) detail fetcher can be enabled if needed

  const createMutation = useMutation({
    mutationFn: (payload: CreateCategoryData) => createCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setIsCreateModalOpen(false)
      setCreateData({
        name: '',
        description: '',
        color_code: '#000000',
        icon_url: '',
        is_active: true,
        sort_order: 0,
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: Partial<CreateCategoryData> }) => updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      if (selectedCategoryId) {
        queryClient.invalidateQueries({ queryKey: ['category', selectedCategoryId] })
      }
      setIsDetailModalOpen(false)
      setSelectedCategory(null)
      setSelectedCategoryId(null)
      setEditData({})
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number | string) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setIsDeleteModalOpen(false)
      setCategoryToDelete(null)
    },
  })

  const handleRowClick = (category: Category) => {
    setSelectedCategoryId(category.id)
    setSelectedCategory(category)
    setEditData({
      name: category.name,
      description: category.description,
      color_code: category.color_code,
      icon_url: category.icon_url,
      is_active: category.is_active,
      sort_order: category.sort_order,
    })
    setIsDetailModalOpen(true)
  }

  const handleDetailClose = () => {
    setIsDetailModalOpen(false)
    setSelectedCategoryId(null)
    setSelectedCategory(null)
  }

  const handleCreateClick = () => setIsCreateModalOpen(true)
  const handleCreateCancel = () => {
    setIsCreateModalOpen(false)
  }

  const handleUpdateSave = () => {
    if (!selectedCategoryId) return
    updateMutation.mutate({ id: selectedCategoryId, data: editData })
  }

  const handleDeleteClick = (category: Category, e: React.MouseEvent) => {
    e.stopPropagation()
    setCategoryToDelete(category)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (!categoryToDelete) return
    deleteMutation.mutate(categoryToDelete.id)
  }

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false)
    setCategoryToDelete(null)
  }

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Categories</h1>
        <div className="mt-4">
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Loading categories...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Categories</h1>
        <div className="mt-4">
          <div className="flex items-center justify-center py-8">
            <div className="text-red-500">Error loading categories</div>
          </div>
        </div>
      </div>
    )
  }

  const categories = (data?.data?.categories || []).filter((c: Category) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      c.name.toLowerCase().includes(q) ||
      (c.description || '').toLowerCase().includes(q) ||
      (c.color_code || '').toLowerCase().includes(q)
    )
  })

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Categories</h1>
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories..."
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
          onClick={handleCreateClick}
          className="px-4 py-2 cursor-pointer bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Create Category
          </button>
        </div>
      </div>
      <div className="mt-4">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Color</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Icon</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sort</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((category: Category) => (
                <tr key={category.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleRowClick(category)}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{category.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{category.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center text-xs">
                      <span className="w-4 h-4 rounded-full inline-block mr-2" style={{ backgroundColor: category.color_code }} />
                      {category.color_code}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {category.icon_url && (
                      <img src={category.icon_url} alt={category.name} className="h-8 w-8 object-contain" />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${category.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {category.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{category.sort_order}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(category.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={(e) => handleDeleteClick(category, e)}
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
        {categories.length === 0 && (
          <div className="text-center py-8 text-gray-500">No categories found</div>
        )}
      </div>

      {isDetailModalOpen && selectedCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Edit Category: {selectedCategory.name}</h3>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" value={editData.name || ''} onChange={(e) => setEditData({ ...editData, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input type="text" value={editData.description || ''} onChange={(e) => setEditData({ ...editData, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color Code</label>
                <input type="text" value={editData.color_code || ''} onChange={(e) => setEditData({ ...editData, color_code: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon URL</label>
                <input type="url" value={editData.icon_url || ''} onChange={(e) => setEditData({ ...editData, icon_url: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                <input type="number" value={editData.sort_order ?? 0} onChange={(e) => setEditData({ ...editData, sort_order: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="flex items-center">
                  <input type="checkbox" checked={!!editData.is_active} onChange={(e) => setEditData({ ...editData, is_active: e.target.checked })} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                  <span className="ml-2 text-sm text-gray-700">Active</span>
                </label>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button onClick={handleDetailClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">Cancel</button>
              <button onClick={handleUpdateSave} disabled={updateMutation.isPending} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">{updateMutation.isPending ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Create New Category</h3>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" value={createData.name} onChange={(e) => setCreateData({ ...createData, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter category name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input type="text" value={createData.description} onChange={(e) => setCreateData({ ...createData, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter description" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color Code</label>
                <input type="text" value={createData.color_code} onChange={(e) => setCreateData({ ...createData, color_code: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="#000000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon URL</label>
                <input type="url" value={createData.icon_url} onChange={(e) => setCreateData({ ...createData, icon_url: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter icon URL" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                <input type="number" value={createData.sort_order} onChange={(e) => setCreateData({ ...createData, sort_order: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" />
              </div>
              <div>
                <label className="flex items-center">
                  <input type="checkbox" checked={createData.is_active} onChange={(e) => setCreateData({ ...createData, is_active: e.target.checked })} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                  <span className="ml-2 text-sm text-gray-700">Active</span>
                </label>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button onClick={handleCreateCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">Cancel</button>
              <button onClick={() => createMutation.mutate(createData)} disabled={createMutation.isPending} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">{createMutation.isPending ? 'Creating...' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && categoryToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Delete Category</h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-gray-600 mb-4">Are you sure you want to delete <strong>{categoryToDelete.name}</strong>? This action cannot be undone.</p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button onClick={handleDeleteCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">Cancel</button>
              <button onClick={handleDeleteConfirm} disabled={deleteMutation.isPending} className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">{deleteMutation.isPending ? 'Deleting...' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CategoriesPage
