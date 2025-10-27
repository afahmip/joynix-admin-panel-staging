import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { apiClient } from '../lib/api-client'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Switch } from '../components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Textarea } from '../components/ui/textarea'
import type { Badge, BadgeResponse } from '../../types/app/+types/badges'

const RARITY_OPTIONS = [
  { value: 'common', label: 'Common' },
  { value: 'rare', label: 'Rare' },
  { value: 'epic', label: 'Epic' },
  { value: 'legendary', label: 'Legendary' },
]

const BADGE_TYPE_OPTIONS = [
  { value: 'achievement', label: 'Achievement' },
  { value: 'milestone', label: 'Milestone' },
  { value: 'special', label: 'Special' },
  { value: 'event', label: 'Event' },
]

async function fetchBadges(page: number, pageSize: number): Promise<BadgeResponse> {
  return apiClient.get<BadgeResponse>(`gamification/badges?page=${page}&page_size=${pageSize}`)
}

export function BadgesPage() {
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [badgeToDelete, setBadgeToDelete] = useState<Badge | null>(null)
  const [editData, setEditData] = useState<Partial<Badge>>({})
  const [createData, setCreateData] = useState({
    name: '',
    code: '',
    badge_type: 'achievement',
    rarity: 'common',
    description: '',
    image_url: '',
    is_hidden: false,
    sort_order: 0,
    unlock_condition: '',
  })

  const queryClient = useQueryClient()
  const { data, isLoading, error } = useQuery({
    queryKey: ['badges', page, pageSize],
    queryFn: () => fetchBadges(page, pageSize),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Badge> }) => 
      apiClient.put(`gamification/badges/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['badges'] })
      setIsModalOpen(false)
      setSelectedBadge(null)
    },
  })

  const createMutation = useMutation({
    mutationFn: (data: typeof createData) => 
      apiClient.post('gamification/badges', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['badges'] })
      setIsCreateModalOpen(false)
      setCreateData({
        name: '',
        code: '',
        badge_type: 'achievement',
        rarity: 'common',
        description: '',
        image_url: '',
        is_hidden: false,
        sort_order: 0,
        unlock_condition: '',
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`gamification/badges/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['badges'] })
      setIsDeleteModalOpen(false)
      setBadgeToDelete(null)
    },
  })

  const handleRowClick = (badge: Badge) => {
    setSelectedBadge(badge)
    setEditData({
      name: badge.name,
      code: badge.code,
      badge_type: badge.badge_type,
      rarity: badge.rarity,
      description: badge.description,
      image_url: badge.image_url,
      is_hidden: badge.is_hidden,
      sort_order: badge.sort_order,
      unlock_condition: badge.unlock_condition,
    })
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (selectedBadge) {
      updateMutation.mutate({
        id: selectedBadge.id!,
        data: editData,
      })
    }
  }

  const handleCancel = () => {
    setIsModalOpen(false)
    setSelectedBadge(null)
    setEditData({})
  }

  const handleCreateClick = () => {
    setIsCreateModalOpen(true)
  }

  const handleCreateSave = () => {
    createMutation.mutate(createData)
  }

  const handleCreateCancel = () => {
    setIsCreateModalOpen(false)
    setCreateData({
      name: '',
      code: '',
      badge_type: 'achievement',
      rarity: 'common',
      description: '',
      image_url: '',
      is_hidden: false,
      sort_order: 0,
      unlock_condition: '',
    })
  }

  const handleDeleteClick = (badge: Badge, e: React.MouseEvent) => {
    e.stopPropagation()
    setBadgeToDelete(badge)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (badgeToDelete) {
      deleteMutation.mutate(badgeToDelete.id!)
    }
  }

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false)
    setBadgeToDelete(null)
  }

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Badges</h1>
        <div className="mt-4">
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Loading badges...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Badges</h1>
        <div className="mt-4">
          <div className="flex items-center justify-center py-8">
            <div className="text-red-500">Error loading badges: {(error as Error).message}</div>
          </div>
        </div>
      </div>
    )
  }

  const badges: Badge[] = (data as any)?.data?.data?.data || []
  const pagination = (data as any)?.data?.data?.pagination

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Badges</h1>
        <button
          onClick={handleCreateClick}
          className="px-4 py-2 cursor-pointer bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Create Badge
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
              {badges.map((badge) => (
                <tr key={badge.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleRowClick(badge)}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {badge.image_url && (
                        <img src={badge.image_url} alt={badge.name} className="h-8 w-8 rounded-full mr-3" />
                      )}
                      <div className="text-sm font-medium text-gray-900">{badge.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{badge.code}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{badge.badge_type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      badge.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-800' :
                      badge.rarity === 'epic' ? 'bg-purple-100 text-purple-800' :
                      badge.rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {badge.rarity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      badge.is_hidden ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {badge.is_hidden ? 'Hidden' : 'Visible'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{badge.sort_order}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(badge.created_at!).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={(e) => handleDeleteClick(badge, e)}
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
        {badges.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No badges found
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
      {isModalOpen && selectedBadge && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Edit Badge: {selectedBadge.name}
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
                      Badge Type
                    </label>
                    <Select value={editData.badge_type} onValueChange={(value) => setEditData({ ...editData, badge_type: value })}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {BADGE_TYPE_OPTIONS.map((option) => (
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
                      <SelectTrigger className="w-full">
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
                      Image URL
                    </label>
                    <Input
                      value={editData.image_url || ''}
                      onChange={(e) => setEditData({ ...editData, image_url: e.target.value })}
                      placeholder="https://example.com/image.jpg"
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
                      onChange={(e) => setEditData({ ...editData, sort_order: parseInt(e.target.value) || 0 })}
                      className="w-full"
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
                Create New Badge
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
                      placeholder="Enter badge name"
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
                      placeholder="Enter badge code"
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Badge Type
                    </label>
                    <Select value={createData.badge_type} onValueChange={(value) => setCreateData({ ...createData, badge_type: value })}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {BADGE_TYPE_OPTIONS.map((option) => (
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
                      <SelectTrigger className="w-full">
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
                      Image URL
                    </label>
                    <Input
                      value={createData.image_url}
                      onChange={(e) => setCreateData({ ...createData, image_url: e.target.value })}
                      placeholder="https://example.com/image.jpg"
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
                      onChange={(e) => setCreateData({ ...createData, sort_order: parseInt(e.target.value) || 0 })}
                      className="w-full"
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
      {isDeleteModalOpen && badgeToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Delete Badge
              </h3>
            </div>
            
            <div className="px-6 py-4">
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to delete <strong>{badgeToDelete.name}</strong>? 
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
