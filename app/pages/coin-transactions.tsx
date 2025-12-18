import { useQuery } from '@tanstack/react-query'
import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router'
import { apiClient } from '../lib/api-client'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import type { CoinTransaction, CoinTransactionResponse, CoinTransactionDetailResponse } from '../../types/app/+types/coin-transactions'

interface TransactionSummaryResponse {
  status: number
  success: boolean
  message: string
  data: {
    user_id: number
    total_transaction_amount: number
    by_transaction_type: Array<{
      transaction_type: string
      total_amount: number
    }>
  }
  metadata: null
}

async function fetchCoinTransactions(
  page: number,
  limit: number,
  filters: {
    fromDate?: string
    toDate?: string
    userId?: string
  }
): Promise<CoinTransactionResponse> {
  const params = new URLSearchParams()
  params.append('page', page.toString())
  params.append('limit', limit.toString())
  
  if (filters.fromDate) {
    params.append('from_date', filters.fromDate)
  }
  if (filters.toDate) {
    params.append('to_date', filters.toDate)
  }
  if (filters.userId) {
    params.append('user_id', filters.userId)
  }
  
  // Make the API call
  const response = await apiClient.get<CoinTransactionResponse>(`payment/admin/coin-transaction?${params.toString()}`)
  return response
}

async function fetchTransactionSummary(
  filters: {
    fromDate?: string
    toDate?: string
    userId: string
  }
): Promise<TransactionSummaryResponse> {
  const params = new URLSearchParams()
  params.append('user_id', filters.userId)
  
  if (filters.fromDate) {
    params.append('from_date', filters.fromDate)
  }
  if (filters.toDate) {
    params.append('to_date', filters.toDate)
  }
  
  const response = await apiClient.get<TransactionSummaryResponse>(`payment/admin/coin-transaction/summary?${params.toString()}`)
  return response
}


export function CoinTransactionsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [limit] = useState(50)
  
  // Initialize filters from URL parameters
  const [fromDate, setFromDate] = useState(searchParams.get('from_date') || '')
  const [toDate, setToDate] = useState(searchParams.get('to_date') || '')
  const [userId, setUserId] = useState(searchParams.get('user_id') || '')
  const [userIdInput, setUserIdInput] = useState(searchParams.get('user_id') || '')
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10))
  
  // Modal state
  const [selectedTransaction, setSelectedTransaction] = useState<CoinTransaction | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Debounce user ID search
  const debounceUserId = useCallback(() => {
    const timeoutId = setTimeout(() => {
      setUserId(userIdInput)
      setPage(1)
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [userIdInput])

  useEffect(() => {
    const cleanup = debounceUserId()
    return cleanup
  }, [debounceUserId])

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    params.set('page', page.toString())
    if (fromDate) params.set('from_date', fromDate)
    if (toDate) params.set('to_date', toDate)
    if (userId) params.set('user_id', userId)
    setSearchParams(params)
  }, [page, fromDate, toDate, userId, setSearchParams])

  // Fetch transactions
  const { data: transactionsData, isLoading, error, isFetching } = useQuery({
    queryKey: ['coin-transactions', page, limit, fromDate, toDate, userId],
    queryFn: () => fetchCoinTransactions(page, limit, {
      fromDate,
      toDate,
      userId,
    }),
  })

  // Fetch transaction summary when user_id filter is set
  const { data: summaryData, isLoading: isSummaryLoading } = useQuery({
    queryKey: ['coin-transaction-summary', fromDate, toDate, userId],
    queryFn: () => fetchTransactionSummary({
      fromDate,
      toDate,
      userId: userId!,
    }),
    enabled: !!userId, // Only fetch when userId is set
  })

  const handleFilterChange = (newPage = 1) => {
    setPage(newPage)
  }

  const handleClearFilters = () => {
    setFromDate('')
    setToDate('')
    setUserId('')
    setUserIdInput('')
    setPage(1)
  }

  const handleRowClick = (transaction: CoinTransaction) => {
    setSelectedTransaction(transaction)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedTransaction(null)
  }

  // Extract data from response
  const transactions: CoinTransaction[] = transactionsData?.data?.transactions || []
  const pagination = transactionsData?.data?.pagination
  const totalCount = pagination?.total || 0
  const totalPages = pagination?.total_pages || 1
  const hasNext = pagination?.has_next ?? false
  const hasPrev = pagination?.has_prev ?? false
  
  const isInitialLoading = isLoading && !transactionsData
  const isRefetching = isFetching && transactionsData

  // Format date helper functions
  const formatDate = (dateString: string): string => {
    if (!dateString) return 'Not specified'
    const date = new Date(dateString)
    const month = date.toLocaleDateString('en-US', { month: 'short' })
    const day = date.getDate()
    const year = date.getFullYear()
    return `${month} ${day} ${year}`
  }

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString)
    const month = date.toLocaleDateString('en-US', { month: 'short' })
    const day = date.getDate()
    const year = date.getFullYear()
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${month} ${day} ${year}, ${hours}:${minutes}`
  }

  // Build user summary from API response
  const userSummary = userId && summaryData?.data ? {
    userId: summaryData.data.user_id.toString(),
    fromDate: fromDate ? formatDate(fromDate) : 'Not specified',
    toDate: toDate ? formatDate(toDate) : 'Not specified',
    totalAmount: summaryData.data.total_transaction_amount,
    totalsByType: summaryData.data.by_transaction_type.reduce((acc, item) => {
      acc[item.transaction_type] = item.total_amount
      return acc
    }, {} as Record<string, number>),
  } : null

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTransactionTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'gift':
        return 'bg-purple-100 text-purple-800'
      case 'purchase':
        return 'bg-blue-100 text-blue-800'
      case 'refund':
        return 'bg-orange-100 text-orange-800'
      case 'reward':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Coin Transactions</h1>
      </div>

      {/* User Summary */}
      {userSummary && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-blue-900">User Transaction Summary</h2>
            {isSummaryLoading && (
              <span className="text-sm text-blue-600">Loading summary...</span>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* User Info */}
            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <h3 className="font-medium text-gray-900 mb-3">User Information</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">User ID:</span>
                  <span className="ml-2 font-medium text-gray-900">{userSummary.userId}</span>
                </div>
                <div>
                  <span className="text-gray-600">Date Range:</span>
                  <div className="ml-2 text-gray-900">
                    <div>From: {userSummary.fromDate}</div>
                    <div>To: {userSummary.toDate}</div>
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="ml-2 font-bold text-gray-900">{userSummary.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Transaction Totals */}
            <div className="md:col-span-2 bg-white rounded-lg p-4 border border-blue-100">
              <h3 className="font-medium text-gray-900 mb-3">Amount by Transaction Type</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {Object.entries(userSummary.totalsByType).map(([type, amount]) => (
                  <div key={type} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTransactionTypeColor(type)}`}>
                        {type}
                      </span>
                    </div>
                    <div className="mt-2">
                      <span className={`text-lg font-bold ${amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {amount >= 0 ? '+' : ''}{amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              {Object.keys(userSummary.totalsByType).length === 0 && (
                <div className="text-gray-500 text-center py-4">
                  No transactions found for this user in the selected date range.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value)
                  handleFilterChange(1)
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <Input
                type="text"
                value={fromDate ? formatDate(fromDate) : ''}
                readOnly
                className="w-full cursor-pointer"
                placeholder="Select from date"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value)
                  handleFilterChange(1)
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <Input
                type="text"
                value={toDate ? formatDate(toDate) : ''}
                readOnly
                className="w-full cursor-pointer"
                placeholder="Select to date"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User ID
            </label>
            <Input
              type="text"
              placeholder="Enter user ID..."
              value={userIdInput}
              onChange={(e) => {
                setUserIdInput(e.target.value)
              }}
              className="w-full"
            />
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
              {isInitialLoading ? 'Loading coin transactions...' : 'Loading updates...'}
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance Before
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance After
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reference
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr 
                  key={transaction.id} 
                  className="hover:bg-gray-50 cursor-pointer" 
                  onClick={() => handleRowClick(transaction)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.user_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.username || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTransactionTypeColor(transaction.transaction_type)}`}>
                      {transaction.transaction_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={transaction.amount < 0 ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.balance_before.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.balance_after.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="max-w-xs truncate" title={transaction.description}>
                      {transaction.reference_type} ({transaction.reference_id})
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDateTime(transaction.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {transactions.length === 0 && !isInitialLoading && (
          <div className="text-center py-8 text-gray-500">
            {error ? `Error loading coin transactions: ${(error as Error).message}` : 'No coin transactions found'}
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
          Page {page} of {totalPages} (Total: {totalCount} transactions)
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

      {/* Transaction Detail Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Transaction Details
              </h3>
            </div>
            
            <div className="px-6 py-4">
              {selectedTransaction ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Transaction ID</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedTransaction.id}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">User ID</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedTransaction.user_id}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Username</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedTransaction.username || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Transaction Type</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTransactionTypeColor(selectedTransaction.transaction_type)}`}>
                        {selectedTransaction.transaction_type}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Coin Type</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedTransaction.coin_type || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Amount</label>
                      <p className={`mt-1 text-sm font-medium ${selectedTransaction.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {selectedTransaction.amount > 0 ? '+' : ''}{selectedTransaction.amount}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Balance Before</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedTransaction.balance_before.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Balance After</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedTransaction.balance_after.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Reserved Balance Before</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedTransaction.reserved_balance_before.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Reserved Balance After</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedTransaction.reserved_balance_after.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Reference ID</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedTransaction.reference_id}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Reference Type</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedTransaction.reference_type}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedTransaction.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(selectedTransaction.status)}`}>
                        {selectedTransaction.status}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Created At</label>
                      <p className="mt-1 text-sm text-gray-900">{new Date(selectedTransaction.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <div className="text-red-500">No transaction selected</div>
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

