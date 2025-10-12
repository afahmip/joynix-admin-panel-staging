import { useQuery } from '@tanstack/react-query'

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
  const response = await fetch('https://api.joynix.id/api/v1/gifts/types')
  if (!response.ok) {
    throw new Error('Failed to fetch gift types')
  }
  return response.json()
}

export function GiftTypesPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['gift-types'],
    queryFn: fetchGiftTypes,
  })

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
                <tr key={giftType.id} className="hover:bg-gray-50">
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
    </div>
  )
}
