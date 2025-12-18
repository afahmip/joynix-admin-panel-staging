import { useQuery } from '@tanstack/react-query'
import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router'
import { apiClient } from '../lib/api-client'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import type { User, UsersResponse } from '../../types/app/+types/users'

async function fetchUsers(
  page: number,
  limit: number,
  filters: {
    search?: string
    isTalent?: string
    role?: string
  }
): Promise<UsersResponse> {
  const params = new URLSearchParams()
  params.append('page', page.toString())
  params.append('limit', limit.toString())
  
  if (filters.search) {
    params.append('search', filters.search)
  }
  if (filters.isTalent) {
    params.append('is_talent', filters.isTalent)
  }
  if (filters.role) {
    params.append('role', filters.role)
  }
  
  const response = await apiClient.get<UsersResponse>(`users/admin/list?${params.toString()}`)
  return response
}

export function UsersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [limit] = useState(20)
  
  // Initialize filters from URL parameters
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '')
  const [isTalent, setIsTalent] = useState(searchParams.get('is_talent') || '')
  const [role, setRole] = useState(searchParams.get('role') || '')
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10))
  
  // Modal state
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Debounce search
  const debounceSearch = useCallback(() => {
    const timeoutId = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [searchInput])

  useEffect(() => {
    const cleanup = debounceSearch()
    return cleanup
  }, [debounceSearch])

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    params.set('page', page.toString())
    if (search) params.set('search', search)
    if (isTalent) params.set('is_talent', isTalent)
    if (role) params.set('role', role)
    setSearchParams(params)
  }, [page, search, isTalent, role, setSearchParams])

  // Fetch users
  const { data: usersData, isLoading, error, isFetching } = useQuery({
    queryKey: ['users', page, limit, search, isTalent, role],
    queryFn: () => fetchUsers(page, limit, {
      search,
      isTalent,
      role,
    }),
  })

  const handleFilterChange = (newPage = 1) => {
    setPage(newPage)
  }

  const handleClearFilters = () => {
    setSearch('')
    setSearchInput('')
    setIsTalent('')
    setRole('')
    setPage(1)
  }

  const handleRowClick = (user: User) => {
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedUser(null)
  }

  // Extract data from response
  const users: User[] = usersData?.data?.users || []
  const pagination = usersData?.data?.pagination
  const totalCount = pagination?.total || 0
  const totalPages = pagination?.total_pages || 1
  const hasNext = pagination?.has_next ?? false
  const hasPrev = pagination?.has_prev ?? false
  
  const isInitialLoading = isLoading && !usersData
  const isRefetching = isFetching && usersData

  // Format date helper function
  const formatDateTime = (dateString: string): string => {
    if (!dateString || dateString === '0001-01-01T00:00:00Z') return 'N/A'
    const date = new Date(dateString)
    const month = date.toLocaleDateString('en-US', { month: 'short' })
    const day = date.getDate()
    const year = date.getFullYear()
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${month} ${day} ${year}, ${hours}:${minutes}`
  }

  const getBadgeColor = (value: boolean) => {
    return value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <Input
              type="text"
              placeholder="Search by username, full name, email, or phone number"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value)
              }}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Talent Status
            </label>
            <Select value={isTalent || 'all'} onValueChange={(value) => {
              setIsTalent(value === 'all' ? '' : value)
              handleFilterChange(1)
            }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All users</SelectItem>
                <SelectItem value="true">Talent only</SelectItem>
                <SelectItem value="false">Non-talent only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <Select value={role || 'all'} onValueChange={(value) => {
              setRole(value === 'all' ? '' : value)
              handleFilterChange(1)
            }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="talent">Talent</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button
              onClick={handleClearFilters}
              variant="outline"
              className="w-full cursor-pointer"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-4 relative">
        {(isRefetching || isInitialLoading) && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10 rounded-lg">
            <div className="text-gray-500 text-center">
              {isInitialLoading ? 'Loading users...' : 'Loading updates...'}
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profile
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email / Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Roles
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr 
                  key={user.id} 
                  className="hover:bg-gray-50 cursor-pointer" 
                  onClick={() => handleRowClick(user)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.profile_image_url ? (
                      <img 
                        src={user.profile_image_url} 
                        alt={user.username}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 text-xs font-medium">
                          {user.username.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.username}</div>
                    <div className="text-sm text-gray-500">{user.full_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{user.email || '-'}</div>
                    <div className="text-gray-500">{user.phone_number || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getBadgeColor(user.is_talent)}`}>
                        {user.is_talent ? 'Talent' : 'User'}
                      </span>
                      {user.is_verified && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          Verified
                        </span>
                      )}
                      {user.is_talent_candidate && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Candidate
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.roles.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role: string, idx: number) => (
                          <span key={idx} className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                            {role}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDateTime(user.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 && !isInitialLoading && (
          <div className="text-center py-8 text-gray-500">
            {error ? `Error loading users: ${(error as Error).message}` : 'No users found'}
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={!hasPrev}
          className="cursor-pointer"
        >
          Previous
        </Button>
        <span className="text-sm text-gray-700">
          Page {page} of {totalPages} (Total: {totalCount} users)
        </span>
        <Button
          variant="outline"
          onClick={() => setPage((p) => p + 1)}
          disabled={!hasNext}
          className="cursor-pointer"
        >
          Next
        </Button>
      </div>

      {/* User Detail Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                User Details
              </h3>
            </div>
            
            <div className="px-6 py-4">
              {selectedUser ? (
                <div className="space-y-6">
                  {/* Profile Section */}
                  <div className="flex items-center gap-4">
                    {selectedUser.profile_image_url ? (
                      <img 
                        src={selectedUser.profile_image_url} 
                        alt={selectedUser.username}
                        className="h-20 w-20 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 text-xl font-medium">
                          {selectedUser.username.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900">{selectedUser.username}</h4>
                      <p className="text-gray-600">{selectedUser.full_name}</p>
                    </div>
                  </div>

                  {/* Basic Information */}
                  <div>
                    <h5 className="text-sm font-semibold text-gray-900 mb-3 uppercase">Basic Information</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">User ID</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedUser.id}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedUser.email || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedUser.phone_number || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Timezone</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedUser.timezone || '-'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Status Section */}
                  <div>
                    <h5 className="text-sm font-semibold text-gray-900 mb-3 uppercase">Status</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Talent</label>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getBadgeColor(selectedUser.is_talent)}`}>
                          {selectedUser.is_talent ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Verified</label>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getBadgeColor(selectedUser.is_verified)}`}>
                          {selectedUser.is_verified ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Talent Candidate</label>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getBadgeColor(selectedUser.is_talent_candidate)}`}>
                          {selectedUser.is_talent_candidate ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Available for Booking</label>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getBadgeColor(selectedUser.is_available_for_booking)}`}>
                          {selectedUser.is_available_for_booking ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Roles */}
                  <div>
                    <h5 className="text-sm font-semibold text-gray-900 mb-3 uppercase">Roles</h5>
                    {selectedUser.roles.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedUser.roles.map((role: string, idx: number) => (
                          <span key={idx} className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-purple-100 text-purple-800">
                            {role}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No roles assigned</p>
                    )}
                  </div>

                  {/* Services (for talents) */}
                  {selectedUser.services && selectedUser.services.length > 0 && (
                    <div>
                      <h5 className="text-sm font-semibold text-gray-900 mb-3 uppercase">Services</h5>
                      <div className="space-y-3">
                        {selectedUser.services.map((service: any) => (
                          <div key={service.id} className="border border-gray-200 rounded-lg p-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <div>
                                <label className="block text-xs font-medium text-gray-700">Activity</label>
                                <p className="text-sm text-gray-900">{service.activity_name}</p>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700">Category</label>
                                <p className="text-sm text-gray-900">{service.category_name}</p>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700">Skill Level</label>
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                  {service.skill_level}
                                </span>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700">Service Type</label>
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                  {service.service_type}
                                </span>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700">Available</label>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getBadgeColor(service.is_available)}`}>
                                  {service.is_available ? 'Yes' : 'No'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Timestamps */}
                  <div>
                    <h5 className="text-sm font-semibold text-gray-900 mb-3 uppercase">Activity</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Created At</label>
                        <p className="mt-1 text-sm text-gray-900">{formatDateTime(selectedUser.created_at)}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Last Active At</label>
                        <p className="mt-1 text-sm text-gray-900">{formatDateTime(selectedUser.last_active_at)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <div className="text-red-500">No user selected</div>
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
