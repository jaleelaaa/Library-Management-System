import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchLoans, setLoansFilters, renewLoan } from '../../store/slices/circulationSlice'
import { FiRefreshCw, FiFilter, FiX } from 'react-icons/fi'
import type { LoanStatus } from '../../types/circulation'

const Loans = () => {
  const dispatch = useAppDispatch()
  const { loans, loading, loansMeta, loansFilters } = useAppSelector(state => state.circulation)

  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    dispatch(fetchLoans(loansFilters))
  }, [dispatch])

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...loansFilters, [key]: value, page: 1 }
    dispatch(setLoansFilters(newFilters))
    dispatch(fetchLoans(newFilters))
  }

  const handlePageChange = (page: number) => {
    const newFilters = { ...loansFilters, page }
    dispatch(setLoansFilters(newFilters))
    dispatch(fetchLoans(newFilters))
  }

  const handleRefresh = () => {
    dispatch(fetchLoans(loansFilters))
  }

  const handleRenew = async (itemBarcode: string) => {
    const result = await dispatch(renewLoan({ item_barcode: itemBarcode }))
    if (renewLoan.fulfilled.match(result)) {
      dispatch(fetchLoans(loansFilters))
    }
  }

  const isOverdue = (dueDate: string, status: LoanStatus) => {
    return status === 'open' && new Date(dueDate) < new Date()
  }

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate)
    const today = new Date()
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div>
      {/* Header with Actions */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">All Loans</h2>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md flex items-center gap-2 transition"
          >
            <FiRefreshCw /> Refresh
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md flex items-center gap-2 transition"
          >
            <FiFilter /> Filters
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="folio-card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={loansFilters.status || 'all'}
                onChange={(e) => handleFilterChange('status', e.target.value === 'all' ? undefined : e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Loans</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Overdue Only</label>
              <select
                value={loansFilters.overdue_only ? 'true' : 'false'}
                onChange={(e) => handleFilterChange('overdue_only', e.target.value === 'true')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
              >
                <option value="false">All Loans</option>
                <option value="true">Overdue Only</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  dispatch(setLoansFilters({ page: 1, page_size: 20 }))
                  dispatch(fetchLoans({ page: 1, page_size: 20 }))
                }}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md flex items-center justify-center gap-2 transition"
              >
                <FiX /> Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loans Table */}
      <div className="folio-card">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Loading loans...</p>
          </div>
        ) : loans.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-xl mb-2">No loans found</p>
            <p>Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Loan Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Renewals
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loans.map((loan) => {
                    const overdue = isOverdue(loan.due_date, loan.status)
                    const daysUntilDue = getDaysUntilDue(loan.due_date)

                    return (
                      <tr key={loan.id} className={`hover:bg-gray-50 ${overdue ? 'bg-red-50' : ''}`}>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">
                            {loan.item_title || 'Unknown Item'}
                          </div>
                          <div className="text-sm text-gray-500">
                            Barcode: {loan.item_barcode}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-900">
                            {loan.user_name || 'Unknown User'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {loan.user_barcode}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                          {new Date(loan.loan_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={overdue ? 'text-red-600 font-medium' : 'text-gray-600'}>
                            {new Date(loan.due_date).toLocaleDateString()}
                          </div>
                          {loan.status === 'open' && (
                            <div className="text-xs text-gray-500">
                              {overdue
                                ? `${Math.abs(daysUntilDue)} days overdue`
                                : daysUntilDue === 0
                                ? 'Due today'
                                : daysUntilDue === 1
                                ? 'Due tomorrow'
                                : `Due in ${daysUntilDue} days`}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              loan.status === 'open'
                                ? overdue
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {loan.status === 'open'
                              ? overdue
                                ? 'Overdue'
                                : 'Open'
                              : 'Closed'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                          {loan.renewal_count} / {loan.max_renewals}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {loan.status === 'open' && loan.item_barcode && (
                            <button
                              onClick={() => handleRenew(loan.item_barcode!)}
                              disabled={loan.renewal_count >= loan.max_renewals}
                              className="text-primary-600 hover:text-primary-800 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center gap-1"
                            >
                              <FiRefreshCw size={16} />
                              Renew
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {loansMeta && loansMeta.total_pages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t">
                <div className="text-sm text-gray-700">
                  Showing page {loansMeta.page} of {loansMeta.total_pages} ({loansMeta.total_items} total loans)
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(loansMeta.page - 1)}
                    disabled={loansMeta.page === 1}
                    className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(loansMeta.page + 1)}
                    disabled={loansMeta.page === loansMeta.total_pages}
                    className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Loans
