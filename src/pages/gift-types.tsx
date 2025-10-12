import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

interface GiftType {
  id: number
  name: string
  description: string
  price_coins: number
  icon_url: string
  animation_url: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface ApiResponse {
  status: number
  success: boolean
  message: string
  data: {
    gift_types: GiftType[]
    pagination: {
      page: number
      limit: number
      total_pages: number
      total_items: number
      has_next: boolean
      has_previous: boolean
    }
  }
  metadata: null
}

async function fetchGiftTypes(): Promise<ApiResponse> {
  const response = await fetch('https://stg.joynix.id/api/v1/gifts/types')
  if (!response.ok) {
    throw new Error('Failed to fetch gift types')
  }
  return response.json()
}

async function updateGiftType(id: number, data: Partial<GiftType>): Promise<ApiResponse> {
  const response = await fetch(`https://stg.joynix.id/api/v1/gifts/types/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-User-Id': '-1',
    },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error('Failed to update gift type')
  }
  return response.json()
}

export function GiftTypesPage() {
  const [selectedGiftType, setSelectedGiftType] = useState<GiftType | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editData, setEditData] = useState<Partial<GiftType>>({})
  
  const queryClient = useQueryClient()
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['gift-types'],
    queryFn: fetchGiftTypes,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<GiftType> }) => 
      updateGiftType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gift-types'] })
      setIsModalOpen(false)
      setSelectedGiftType(null)
    },
  })

  const handleRowClick = (giftType: GiftType) => {
    setSelectedGiftType(giftType)
    setEditData({
      name: giftType.name,
      description: giftType.description,
      price_coins: giftType.price_coins,
      is_active: giftType.is_active,
    })
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (selectedGiftType) {
      updateMutation.mutate({
        id: selectedGiftType.id,
        data: editData,
      })
    }
  }

  const handleCancel = () => {
    setIsModalOpen(false)
    setSelectedGiftType(null)
    setEditData({})
  }

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Gift Types</h1>
        <div className="mt-4">
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Loading gift types...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Gift Types</h1>
        <div className="mt-4">
          <div className="flex items-center justify-center py-8">
            <div className="text-red-500">Error loading gift types: {error.message}</div>
          </div>
        </div>
      </div>
    )
  }

  const giftTypes = data?.data?.gift_types || []

  return (
    <div>
      <h1 className="text-2xl font-bold">Gift Types</h1>
      <div className="mt-4">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price (Coins)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Icon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {giftTypes.map((giftType) => (
                <tr 
                  key={giftType.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleRowClick(giftType)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {giftType.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {giftType.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {giftType.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {giftType.price_coins}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        giftType.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {giftType.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {giftType.icon_url && (
                      <img
                        src={giftType.icon_url}
                        alt={giftType.name}
                        className="h-8 w-8 object-contain"
                      />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(giftType.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {giftTypes.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No gift types found
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isModalOpen && selectedGiftType && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Edit Gift Type: {selectedGiftType.name}
              </h3>
            </div>
            
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={editData.name || ''}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={editData.description || ''}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (Coins)
                </label>
                <input
                  type="number"
                  value={editData.price_coins || ''}
                  onChange={(e) => setEditData({ ...editData, price_coins: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editData.is_active || false}
                    onChange={(e) => setEditData({ ...editData, is_active: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active</span>
                </label>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateMutation.isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
