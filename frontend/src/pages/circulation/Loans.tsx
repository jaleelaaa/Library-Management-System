import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchLoans, setLoansFilters, renewLoan } from '../../store/slices/circulationSlice'
import { FiRefreshCw, FiFilter, FiX } from 'react-icons/fi'
import type { LoanStatus } from '../../types/circulation'
import { useLanguage } from '../../contexts/LanguageContext'

const Loans = () => {
  const dispatch = useAppDispatch()
  const { loans, loading, loansMeta, loansFilters } = useAppSelector(state => state.circulation)
  const { t } = useLanguage()

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
        <h2 className="text-2xl font-semibold">{t('loans.title')}</h2>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md flex items-center gap-2 transition"
          >
            <FiRefreshCw /> {t('common.refresh')}
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md flex items-center gap-2 transition"
          >
            <FiFilter /> {t('loans.filters')}
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="folio-card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('loans.status')}</label>
              <select
                value={loansFilters.status || 'all'}
                onChange={(e) => handleFilterChange('status', e.target.value === 'all' ? undefined : e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">{t('loans.allLoans')}</option>
                <option value="open">{t('loans.statusOpen')}</option>
                <option value="closed">{t('loans.statusClosed')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('loans.overdueOnly')}</label>
              <select
                value={loansFilters.overdue_only ? 'true' : 'false'}
                onChange={(e) => handleFilterChange('overdue_only', e.target.value === 'true')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
              >
                <option value="false">{t('loans.allLoans')}</option>
                <option value="true">{t('loans.overdueOnly')}</option>
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
                <FiX /> {t('loans.clearFilters')}
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
            <p className="mt-4 text-gray-600">{t('loans.loading')}</p>
          </div>
        ) : loans.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-xl mb-2">{t('loans.noLoans')}</p>
            <p>{t('loans.tryAdjusting')}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('loans.item')}
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('loans.user')}
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('loans.loanDate')}
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('loans.dueDate')}
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('loans.status')}
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('loans.renewals')}
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('loans.actions')}
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
                            {loan.item_title || t('loans.unknownItem')}
                          </div>
                          <div className="text-sm text-gray-500">
                            {t('loans.barcode')}: {loan.item_barcode}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-900">
                            {loan.user_name || t('loans.unknownUser')}
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
                                ? t('loans.daysOverdue').replace('{days}', Math.abs(daysUntilDue).toString())
                                : daysUntilDue === 0
                                ? t('loans.dueToday')
                                : daysUntilDue === 1
                                ? t('loans.dueTomorrow')
                                : t('loans.dueInDays').replace('{days}', daysUntilDue.toString())}
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
                                ? t('loans.statusOverdue')
                                : t('loans.statusOpen')
                              : t('loans.statusClosed')}
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
                              {t('loans.renew')}
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
                  {t('loans.showingPage')
                    .replace('{page}', loansMeta.page.toString())
                    .replace('{total_pages}', loansMeta.total_pages.toString())
                    .replace('{total_items}', loansMeta.total_items.toString())}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(loansMeta.page - 1)}
                    disabled={loansMeta.page === 1}
                    className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    {t('common.previous')}
                  </button>
                  <button
                    onClick={() => handlePageChange(loansMeta.page + 1)}
                    disabled={loansMeta.page === loansMeta.total_pages}
                    className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    {t('common.next')}
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
