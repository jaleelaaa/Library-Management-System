/**
 * Search Page
 * Advanced Elasticsearch-powered search with faceted filters
 */

import { useEffect, useState, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
  performSearch,
  getAutocompleteSuggestions,
  checkSearchHealth,
  setQuery,
  clearFilters,
  clearAutocomplete,
} from '../store/slices/searchSlice'
import { FiSearch, FiX, FiFilter, FiAlertCircle, FiRefreshCw } from 'react-icons/fi'
import { useLanguage } from '../contexts/LanguageContext'

const Search = () => {
  const dispatch = useAppDispatch()
  const { t, isRTL } = useLanguage()
  const {
    results,
    facets,
    total,
    page,
    pageSize,
    totalPages,
    query,
    filters,
    loading,
    error,
    autocomplete,
    searchServiceAvailable,
  } = useAppSelector((state) => state.search)

  const [searchInput, setSearchInput] = useState(query)
  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const [showFilters, setShowFilters] = useState(true)
  const [selectedInstanceType, setSelectedInstanceType] = useState(filters.instance_type || '')
  const [selectedLanguage, setSelectedLanguage] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [yearFrom, setYearFrom] = useState(filters.year_from?.toString() || '')
  const [yearTo, setYearTo] = useState(filters.year_to?.toString() || '')

  // Check search service health on mount
  useEffect(() => {
    dispatch(checkSearchHealth())
  }, [dispatch])

  // Debounced autocomplete
  useEffect(() => {
    if (searchInput.length >= 2) {
      const timer = setTimeout(() => {
        dispatch(getAutocompleteSuggestions({ query: searchInput, field: 'title', limit: 5 }))
        setShowAutocomplete(true)
      }, 300)
      return () => clearTimeout(timer)
    } else {
      dispatch(clearAutocomplete())
      setShowAutocomplete(false)
    }
  }, [searchInput, dispatch])

  // Perform search
  const handleSearch = useCallback(
    (newPage: number = 1) => {
      const searchFilters: any = {}

      if (selectedInstanceType) searchFilters.instance_type = selectedInstanceType
      if (selectedLanguage) searchFilters.languages = selectedLanguage
      if (selectedSubject) searchFilters.subjects = selectedSubject
      if (yearFrom) searchFilters.year_from = parseInt(yearFrom)
      if (yearTo) searchFilters.year_to = parseInt(yearTo)

      dispatch(
        performSearch({
          query: searchInput || undefined,
          filters: searchFilters,
          page: newPage,
          pageSize: 20,
        })
      )
    },
    [dispatch, searchInput, selectedInstanceType, selectedLanguage, selectedSubject, yearFrom, yearTo]
  )

  // Handle search button click
  const handleSearchClick = () => {
    dispatch(setQuery(searchInput))
    handleSearch(1)
  }

  // Handle enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setShowAutocomplete(false)
      handleSearchClick()
    }
  }

  // Handle autocomplete selection
  const handleAutocompleteSelect = (suggestion: string) => {
    setSearchInput(suggestion)
    dispatch(setQuery(suggestion))
    setShowAutocomplete(false)
    handleSearch(1)
  }

  // Clear all filters
  const handleClearFilters = () => {
    setSelectedInstanceType('')
    setSelectedLanguage('')
    setSelectedSubject('')
    setYearFrom('')
    setYearTo('')
    dispatch(clearFilters())
    handleSearch(1)
  }

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    handleSearch(newPage)
    window.scrollTo(0, 0)
  }

  // Render pagination
  const renderPagination = () => {
    if (totalPages <= 1) return null

    const pages = []
    const maxVisiblePages = 5
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded ${
            i === page
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
          }`}
        >
          {i}
        </button>
      )
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-6">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          className="px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('search.pagination.previous')}
        </button>
        {pages}
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
          className="px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('search.pagination.next')}
        </button>
      </div>
    )
  }

  // Render facet filter
  const renderFacet = (title: string, items: Array<{ value: string; count: number }>, onSelect: (value: string) => void, selected: string) => {
    if (!items || items.length === 0) return null

    return (
      <div className="mb-6">
        <h3 className="font-semibold text-gray-700 mb-2">{title}</h3>
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {items.slice(0, 10).map((item) => (
            <label key={item.value} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
              <input
                type="radio"
                name={title}
                value={item.value}
                checked={selected === item.value}
                onChange={() => onSelect(item.value)}
                className="text-blue-600"
              />
              <span className="text-sm text-gray-700">
                {item.value} <span className="text-gray-400">({item.count})</span>
              </span>
            </label>
          ))}
        </div>
        {selected && (
          <button
            onClick={() => onSelect('')}
            className="mt-2 text-xs text-blue-600 hover:underline"
          >
            Clear filter
          </button>
        )}
      </div>
    )
  }

  if (!searchServiceAvailable) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <FiAlertCircle className="text-yellow-600 mt-1 flex-shrink-0" size={20} />
          <div>
            <h3 className="font-semibold text-yellow-800 mb-1">{t('search.error.serviceUnavailable')}</h3>
            <p className="text-sm text-yellow-700 mb-3">
              {t('search.error.serviceMessage')}
            </p>
            <button
              onClick={() => dispatch(checkSearchHealth())}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm flex items-center gap-2"
            >
              <FiRefreshCw size={16} />
              {t('search.error.retryConnection')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{t('search.title')}</h1>
        <p className="text-gray-600 mt-1">{t('search.subtitle')}</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6 relative">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleKeyPress}
                onFocus={() => autocomplete.suggestions.length > 0 && setShowAutocomplete(true)}
                onBlur={() => setTimeout(() => setShowAutocomplete(false), 200)}
                placeholder={t('search.placeholder')}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {searchInput && (
                <button
                  onClick={() => {
                    setSearchInput('')
                    dispatch(clearAutocomplete())
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FiX size={20} />
                </button>
              )}
            </div>

            {/* Autocomplete Dropdown */}
            {showAutocomplete && autocomplete.suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                {autocomplete.suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    onClick={() => handleAutocompleteSelect(suggestion)}
                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b last:border-b-0"
                  >
                    <div className="flex items-center gap-2">
                      <FiSearch className="text-gray-400" size={16} />
                      <span className="text-sm">{suggestion}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleSearchClick}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <FiSearch size={20} />
            {t('search.button.search')}
          </button>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
          >
            <FiFilter size={20} />
            {showFilters ? t('search.button.hideFilters') : t('search.button.showFilters')}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        {showFilters && (
          <div className="lg:col-span-1">
            <div className="bg-white p-4 rounded-lg border border-gray-200 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">{t('search.filters.title')}</h2>
                {(selectedInstanceType || selectedLanguage || selectedSubject || yearFrom || yearTo) && (
                  <button
                    onClick={handleClearFilters}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {t('search.filters.clearAll')}
                  </button>
                )}
              </div>

              {/* Year Range Filter */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-2">{t('search.filters.publicationYear')}</h3>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder={t('search.filters.from')}
                    value={yearFrom}
                    onChange={(e) => setYearFrom(e.target.value)}
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="number"
                    placeholder={t('search.filters.to')}
                    value={yearTo}
                    onChange={(e) => setYearTo(e.target.value)}
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                </div>
              </div>

              {/* Faceted Filters */}
              {facets && (
                <>
                  {renderFacet(t('search.filters.instanceType'), facets.instance_types, setSelectedInstanceType, selectedInstanceType)}
                  {renderFacet(t('search.filters.language'), facets.languages, setSelectedLanguage, selectedLanguage)}
                  {renderFacet(t('search.filters.subject'), facets.subjects, setSelectedSubject, selectedSubject)}
                </>
              )}

              <button
                onClick={() => handleSearch(1)}
                className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {t('search.filters.applyFilters')}
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        <div className={showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : results.length > 0 ? (
            <>
              {/* Results Header */}
              <div className="mb-4 flex items-center justify-between">
                <p className="text-gray-600">
                  {t('search.results.showing')} <span className="font-semibold">{(page - 1) * pageSize + 1}</span> {t('search.results.to')}{' '}
                  <span className="font-semibold">{Math.min(page * pageSize, total)}</span> {t('search.results.of')}{' '}
                  <span className="font-semibold">{total}</span> {t('search.results.results')}
                  {query && (
                    <>
                      {' '}
                      {t('search.results.for')} "<span className="font-semibold">{query}</span>"
                    </>
                  )}
                </p>
              </div>

              {/* Results List */}
              <div className="space-y-4">
                {results.map((result) => (
                  <div key={result.id} className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {result.title}
                      {result.subtitle && <span className="text-gray-600 font-normal">: {result.subtitle}</span>}
                    </h3>

                    {result.contributors && result.contributors.length > 0 && (
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">{t('search.results.authors')}:</span>{' '}
                        {result.contributors.map((c) => c.name).join(', ')}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                      {result.edition && (
                        <span>
                          <span className="font-medium">{t('search.results.edition')}:</span> {result.edition}
                        </span>
                      )}
                      {result.publication_year && (
                        <span>
                          <span className="font-medium">{t('search.results.year')}:</span> {result.publication_year}
                        </span>
                      )}
                      {result.publication && (
                        <span>
                          <span className="font-medium">{t('search.results.publisher')}:</span> {result.publication}
                        </span>
                      )}
                    </div>

                    {result.subjects && result.subjects.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {result.subjects.slice(0, 5).map((subject, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                          >
                            {subject}
                          </span>
                        ))}
                      </div>
                    )}

                    {result.languages && result.languages.length > 0 && (
                      <div className="flex gap-2 text-xs text-gray-500">
                        <span className="font-medium">{t('search.results.languages')}:</span>
                        <span>{result.languages.join(', ')}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {renderPagination()}
            </>
          ) : (
            <div className="text-center py-12">
              <FiSearch className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">{t('search.noResults.title')}</h3>
              <p className="text-gray-500">
                {query
                  ? `${t('search.noResults.withQuery')} "${query}"`
                  : t('search.noResults.enterQuery')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Search
