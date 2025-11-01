import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchLoans, setLoansFilters, renewLoan } from '../store/slices/circulationSlice'
import { FiRefreshCw, FiBook, FiAlertCircle, FiCheckCircle } from 'react-icons/fi'
import type { LoanStatus } from '../types/circulation'
import { useLanguage } from '../contexts/LanguageContext'
import { toast } from 'react-toastify'

const PatronLoanHistory = () => {
  const dispatch = useAppDispatch()
  const { loans, loading, loansMeta, loansFilters } = useAppSelector(state => state.circulation)
  const { user } = useAppSelector(state => state.auth)
  const { t } = useLanguage()

  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'closed'>('all')

  useEffect(() => {
    // Fetch loans for current user only
    if (user?.id) {
      const filters = {
        ...loansFilters,
        user_id: user.id,
        page: 1,
        page_size: 20
      }
      dispatch(setLoansFilters(filters))
      dispatch(fetchLoans(filters))
    }
  }, [dispatch, user?.id])

  const handleStatusFilterChange = (status: 'all' | 'open' | 'closed') => {
    setStatusFilter(status)
    if (user?.id) {
      const filters = {
        ...loansFilters,
        user_id: user.id,
        status: status === 'all' ? undefined : status,
        page: 1
      }
      dispatch(setLoansFilters(filters))
      dispatch(fetchLoans(filters))
    }
  }

  const handlePageChange = (page: number) => {
    if (user?.id) {
      const filters = { ...loansFilters, user_id: user.id, page }
      dispatch(setLoansFilters(filters))
      dispatch(fetchLoans(filters))
    }
  }

  const handleRefresh = () => {
    if (user?.id) {
      dispatch(fetchLoans({ ...loansFilters, user_id: user.id }))
    }
  }

  const handleRenew = async (itemBarcode: string) => {
    const result = await dispatch(renewLoan({ item_barcode: itemBarcode }))
    if (renewLoan.fulfilled.match(result)) {
      toast.success('Item renewed successfully!')
      handleRefresh()
    } else {
      toast.error(result.payload as string || 'Failed to renew item')
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

  // Separate loans into current and past
  const currentLoans = loans.filter(loan => loan.status === 'open')
  const pastLoans = loans.filter(loan => loan.status === 'closed')
  const overdueLoans = currentLoans.filter(loan => isOverdue(loan.due_date, loan.status))

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('patron.myLoans') || 'My Loan History'}
        </h1>
        <p className="text-gray-600">
          {t('patron.loanHistoryDesc') || 'View your current loans, past loans, and overdue items'}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="folio-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('patron.currentLoans') || 'Current Loans'}</p>
              <p className="text-3xl font-bold text-blue-600">{currentLoans.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FiBook className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="folio-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('patron.overdueItems') || 'Overdue Items'}</p>
              <p className="text-3xl font-bold text-red-600">{overdueLoans.length}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <FiAlertCircle className="text-red-600" size={24} />
            </div>
          </div>
        </div>

        <div className="folio-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('patron.pastLoans') || 'Past Loans'}</p>
              <p className="text-3xl font-bold text-green-600">{pastLoans.length}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <FiCheckCircle className="text-green-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => handleStatusFilterChange('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              statusFilter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('patron.allLoans') || 'All Loans'}
          </button>
          <button
            onClick={() => handleStatusFilterChange('open')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              statusFilter === 'open'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('patron.currentOnly') || 'Current Only'}
          </button>
          <button
            onClick={() => handleStatusFilterChange('closed')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              statusFilter === 'closed'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('patron.historyOnly') || 'History Only'}
          </button>
        </div>
        <button
          onClick={handleRefresh}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 transition"
        >
          <FiRefreshCw /> {t('common.refresh') || 'Refresh'}
        </button>
      </div>

      {/* Loans List */}
      <div className="folio-card">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">{t('loans.loading') || 'Loading loans...'}</p>
          </div>
        ) : loans.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FiBook className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-xl mb-2">{t('patron.noLoans') || 'No loans found'}</p>
            <p>{t('patron.noLoansDesc') || 'You have no loan records to display'}</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {loans.map((loan) => {
                const overdue = isOverdue(loan.due_date, loan.status)
                const daysUntilDue = getDaysUntilDue(loan.due_date)

                return (
                  <div
                    key={loan.id}
                    className={`p-4 border rounded-lg transition-all hover:shadow-md ${
                      overdue ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {loan.item_title || 'Unknown Item'}
                          </h3>
                          <span
                            className={`px-2 py-1 text-xs rounded-full font-medium ${
                              loan.status === 'open'
                                ? overdue
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {loan.status === 'open'
                              ? overdue
                                ? t('loans.statusOverdue') || 'OVERDUE'
                                : t('loans.statusOpen') || 'CHECKED OUT'
                              : t('loans.statusClosed') || 'RETURNED'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Barcode</p>
                            <p className="font-medium text-gray-900">{loan.item_barcode}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Loan Date</p>
                            <p className="font-medium text-gray-900">
                              {new Date(loan.loan_date).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className={overdue ? 'text-red-600' : 'text-gray-600'}>Due Date</p>
                            <p className={`font-medium ${overdue ? 'text-red-600' : 'text-gray-900'}`}>
                              {new Date(loan.due_date).toLocaleDateString()}
                            </p>
                            {loan.status === 'open' && (
                              <p className="text-xs text-gray-500 mt-1">
                                {overdue
                                  ? `${Math.abs(daysUntilDue)} days overdue`
                                  : daysUntilDue === 0
                                  ? 'Due today'
                                  : daysUntilDue === 1
                                  ? 'Due tomorrow'
                                  : `Due in ${daysUntilDue} days`}
                              </p>
                            )}
                          </div>
                          <div>
                            <p className="text-gray-600">Renewals</p>
                            <p className="font-medium text-gray-900">
                              {loan.renewal_count} / {loan.max_renewals}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      {loan.status === 'open' && loan.item_barcode && (
                        <div className="ml-4">
                          <button
                            onClick={() => handleRenew(loan.item_barcode!)}
                            disabled={loan.renewal_count >= loan.max_renewals}
                            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 transition"
                          >
                            <FiRefreshCw size={16} />
                            {t('loans.renew') || 'Renew'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Pagination */}
            {loansMeta && loansMeta.total_pages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t mt-6">
                <div className="text-sm text-gray-700">
                  Showing page {loansMeta.page} of {loansMeta.total_pages} ({loansMeta.total_items}{' '}
                  total loans)
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(loansMeta.page - 1)}
                    disabled={loansMeta.page === 1}
                    className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    {t('common.previous') || 'Previous'}
                  </button>
                  <button
                    onClick={() => handlePageChange(loansMeta.page + 1)}
                    disabled={loansMeta.page === loansMeta.total_pages}
                    className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    {t('common.next') || 'Next'}
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

export default PatronLoanHistory
