import { useQuery } from '@tanstack/react-query'
import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router'
import { apiClient } from '../lib/api-client'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import type { CoinTransaction, CoinTransactionResponse, CoinTransactionDetailResponse } from '../../types/app/+types/coin-transactions'

const TRANSACTION_TYPE_OPTIONS = [
  { value: 'earn', label: 'Earn' },
  { value: 'spend', label: 'Spend' },
  { value: 'topup', label: 'Top Up' },
  { value: 'withdrawal', label: 'Withdrawal' },
  { value: 'refund', label: 'Refund' },
  { value: 'gift', label: 'Gift' },
]

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' },
]

async function fetchCoinTransactions(
  page: number,
  limit: number,
  filters: {
    transactionType?: string
    referenceType?: string
    status?: string
  }
): Promise<CoinTransactionResponse> {
  const params = new URLSearchParams()
  params.append('page', page.toString())
  params.append('limit', limit.toString())
  
  if (filters.transactionType) {
    params.append('transaction_type', filters.transactionType)
  }
  if (filters.referenceType) {
    params.append('reference_type', filters.referenceType)
  }
  if (filters.status) {
    params.append('status', filters.status)
  }
  
  return apiClient.get<CoinTransactionResponse>(`payment/transactions?${params.toString()}`)
}

async function fetchTransactionDetail(id: number): Promise<CoinTransactionDetailResponse> {
  return apiClient.get<CoinTransactionDetailResponse>(`payment/transactions/${id}`)
}

export function CoinTransactionsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [limit] = useState(20)
  
  // Initialize filters from URL parameters
  const [transactionType, setTransactionType] = useState(searchParams.get('transaction_type') || '')
  const [referenceType, setReferenceType] = useState(searchParams.get('reference_type') || '')
  const [referenceTypeInput, setReferenceTypeInput] = useState(searchParams.get('reference_type') || '')
  const [status, setStatus] = useState(searchParams.get('status') || '')
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10))
  
  // Modal state
  const [selectedTransactionId, setSelectedTransactionId] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Debounce reference type search
  const debounceReferenceType = useCallback(() => {
    const timeoutId = setTimeout(() => {
      setReferenceType(referenceTypeInput)
      setPage(1)
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [referenceTypeInput])

  useEffect(() => {
    const cleanup = debounceReferenceType()
    return cleanup
  }, [debounceReferenceType])

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    params.set('page', page.toString())
    if (transactionType) params.set('transaction_type', transactionType)
    if (referenceType) params.set('reference_type', referenceType)
    if (status) params.set('status', status)
    setSearchParams(params)
  }, [page, transactionType, referenceType, status, setSearchParams])

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['coin-transactions', page, limit, transactionType, referenceType, status],
    queryFn: () => fetchCoinTransactions(page, limit, {
      transactionType,
      referenceType,
      status,
    }),
  })

  // Fetch transaction detail when modal is opened
  const { data: transactionDetail, isLoading: isDetailLoading } = useQuery({
    queryKey: ['transaction-detail', selectedTransactionId],
    queryFn: () => fetchTransactionDetail(selectedTransactionId!),
    enabled: !!selectedTransactionId && isModalOpen,
  })

  const handleFilterChange = (newPage = 1) => {
    setPage(newPage)
  }

  const handleClearFilters = () => {
    setTransactionType('')
    setReferenceType('')
    setReferenceTypeInput('')
    setStatus('')
    setPage(1)
  }

  const handleRowClick = (transaction: CoinTransaction) => {
    setSelectedTransactionId(transaction.id)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedTransactionId(null)
  }

  const transactions: CoinTransaction[] = data?.data?.transactions || []
  const pagination = data?.data?.pagination
  
  const isInitialLoading = isLoading && !data
  const isRefetching = isFetching && data

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

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transaction Type
            </label>
            <Select value={transactionType || "all-types"} onValueChange={(value) => {
              setTransactionType(value === "all-types" ? "" : value)
              handleFilterChange(1)
            }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-types">All Types</SelectItem>
                {TRANSACTION_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <Select value={status || "all-status"} onValueChange={(value) => {
              setStatus(value === "all-status" ? "" : value)
              handleFilterChange(1)
            }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-status">All Status</SelectItem>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reference Type
            </label>
            <Input
              type="text"
              placeholder="Search reference type..."
              value={referenceTypeInput}
              onChange={(e) => {
                setReferenceTypeInput(e.target.value)
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
            <div className="text-gray-500">
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
                    {new Date(transaction.created_at).toLocaleString()}
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
          disabled={!pagination?.has_prev}
          className="cursor-pointer"
        >
          Previous
        </Button>
        <span className="text-sm text-gray-700">
          Page {page} of {pagination?.total_pages || 1} (Total: {pagination?.total || 0} transactions)
        </span>
        <Button
          variant="outline"
          onClick={() => setPage((p) => p + 1)}
          disabled={!pagination?.has_next}
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
              {isDetailLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-gray-500">Loading transaction details...</div>
                </div>
              ) : transactionDetail?.data ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Transaction ID</label>
                      <p className="mt-1 text-sm text-gray-900">{transactionDetail.data.id}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">User ID</label>
                      <p className="mt-1 text-sm text-gray-900">{transactionDetail.data.user_id}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Username</label>
                      <p className="mt-1 text-sm text-gray-900">{transactionDetail.data.username || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Transaction Type</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTransactionTypeColor(transactionDetail.data.transaction_type)}`}>
                        {transactionDetail.data.transaction_type}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Coin Type</label>
                      <p className="mt-1 text-sm text-gray-900">{transactionDetail.data.coin_type || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Amount</label>
                      <p className={`mt-1 text-sm font-medium ${transactionDetail.data.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {transactionDetail.data.amount > 0 ? '+' : ''}{transactionDetail.data.amount}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Balance Before</label>
                      <p className="mt-1 text-sm text-gray-900">{transactionDetail.data.balance_before.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Balance After</label>
                      <p className="mt-1 text-sm text-gray-900">{transactionDetail.data.balance_after.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Reserved Balance Before</label>
                      <p className="mt-1 text-sm text-gray-900">{transactionDetail.data.reserved_balance_before.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Reserved Balance After</label>
                      <p className="mt-1 text-sm text-gray-900">{transactionDetail.data.reserved_balance_after.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Reference ID</label>
                      <p className="mt-1 text-sm text-gray-900">{transactionDetail.data.reference_id}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Reference Type</label>
                      <p className="mt-1 text-sm text-gray-900">{transactionDetail.data.reference_type}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <p className="mt-1 text-sm text-gray-900">{transactionDetail.data.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(transactionDetail.data.status)}`}>
                        {transactionDetail.data.status}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Created At</label>
                      <p className="mt-1 text-sm text-gray-900">{new Date(transactionDetail.data.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <div className="text-red-500">Failed to load transaction details</div>
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

