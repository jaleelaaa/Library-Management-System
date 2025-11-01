import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Grid, List, SlidersHorizontal, BookOpen } from 'lucide-react';
import { BookCard, Book } from '@/components/books/BookCard';
import { Button } from '@/components/common/Button';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';

// Sample book data with real Unsplash images - moved outside component to prevent recreating on every render
const SAMPLE_BOOKS: Book[] = [
    {
      id: '1',
      title: 'The Art of Computer Programming',
      author: 'Donald Knuth',
      category: 'Technology',
      year: 2020,
      cover_image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400',
      available: true,
      available_copies: 3,
      total_copies: 5,
      shelf_location: 'A-101'
    },
    {
      id: '2',
      title: 'Clean Code',
      author: 'Robert Martin',
      category: 'Technology',
      year: 2019,
      cover_image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400',
      available: true,
      available_copies: 2,
      total_copies: 3,
      shelf_location: 'A-102'
    },
    {
      id: '3',
      title: 'Design Patterns',
      author: 'Gang of Four',
      category: 'Technology',
      year: 2018,
      cover_image: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=400',
      available: false,
      available_copies: 0,
      total_copies: 2,
      shelf_location: 'A-103'
    },
    {
      id: '4',
      title: 'البرمجة بلغة Python',
      author: 'محمد أحمد',
      category: 'تكنولوجيا',
      year: 2021,
      cover_image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400',
      available: true,
      available_copies: 4,
      total_copies: 4,
      shelf_location: 'B-201'
    },
    {
      id: '5',
      title: 'JavaScript: The Good Parts',
      author: 'Douglas Crockford',
      category: 'Technology',
      year: 2017,
      cover_image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
      available: true,
      available_copies: 2,
      total_copies: 4,
      shelf_location: 'A-104'
    },
    {
      id: '6',
      title: 'Introduction to Algorithms',
      author: 'Thomas H. Cormen',
      category: 'Technology',
      year: 2019,
      cover_image: 'https://images.unsplash.com/photo-1550399105-c4db5fb85c18?w=400',
      available: false,
      available_copies: 0,
      total_copies: 3,
      shelf_location: 'A-105'
    },
    {
      id: '7',
      title: 'تعلم الذكاء الاصطناعي',
      author: 'أحمد محمود',
      category: 'تكنولوجيا',
      year: 2022,
      cover_image: 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=400',
      available: true,
      available_copies: 5,
      total_copies: 5,
      shelf_location: 'B-202'
    },
    {
      id: '8',
      title: 'Python for Data Analysis',
      author: 'Wes McKinney',
      category: 'Technology',
      year: 2021,
      cover_image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400',
      available: true,
      available_copies: 3,
      total_copies: 6,
      shelf_location: 'A-106'
    },
    {
      id: '9',
      title: 'قواعد البيانات الحديثة',
      author: 'خالد عبدالله',
      category: 'تكنولوجيا',
      year: 2020,
      cover_image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400',
      available: true,
      available_copies: 2,
      total_copies: 3,
      shelf_location: 'B-203'
    },
    {
      id: '10',
      title: 'React Handbook',
      author: 'Robin Wieruch',
      category: 'Technology',
      year: 2023,
      cover_image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
      available: true,
      available_copies: 4,
      total_copies: 4,
      shelf_location: 'A-107'
    },
    {
      id: '11',
      title: 'أساسيات الأمن السيبراني',
      author: 'سارة محمد',
      category: 'تكنولوجيا',
      year: 2023,
      cover_image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400',
      available: false,
      available_copies: 0,
      total_copies: 2,
      shelf_location: 'B-204'
    },
    {
      id: '12',
      title: 'Cloud Computing Essentials',
      author: 'Mark Johnson',
      category: 'Technology',
      year: 2022,
      cover_image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400',
      available: true,
      available_copies: 3,
      total_copies: 5,
      shelf_location: 'A-108'
    }
  ];

export default function BookCatalog() {
  const { t, isRTL } = useLanguage();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all',
    language: 'all',
    availability: 'all'
  });

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setBooks(SAMPLE_BOOKS);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filters.category === 'all' ||
                           book.category === filters.category ||
                           book.category.toLowerCase() === filters.category.toLowerCase();
    const matchesAvailability = filters.availability === 'all' ||
                                (filters.availability === 'available' && book.available) ||
                                (filters.availability === 'borrowed' && !book.available);
    return matchesSearch && matchesCategory && matchesAvailability;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12 px-4 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          />
        </div>

        {/* Language Switcher */}
        <div className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} z-10`}>
          <LanguageSwitcher />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <h1 className="text-4xl md:text-5xl font-bold">{t('books.catalog_title')}</h1>
            <p className="text-xl text-blue-100">{t('books.catalog_subtitle')}</p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 max-w-3xl mx-auto"
          >
            <div className="relative">
              <Search className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-4' : 'left-4'} text-gray-400`} size={24} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('books.search_placeholder')}
                className={`w-full ${isRTL ? 'pe-12 ps-4' : 'ps-12 pe-4'} py-4 text-lg rounded-xl border-0 focus:ring-4 focus:ring-blue-300 text-gray-900`}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Filters & View Controls */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-lg p-4 shadow-sm">
          {/* Filter Button */}
          <Button
            variant={showFilters ? 'primary' : 'secondary'}
            icon={SlidersHorizontal}
            onClick={() => setShowFilters(!showFilters)}
          >
            {t('common.filter')}
          </Button>

          {/* Results Count */}
          <div className="text-gray-600">
            <span className="font-semibold">{filteredBooks.length}</span> {t('books.books_found')}
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'ghost'}
              icon={Grid}
              onClick={() => setViewMode('grid')}
              size="sm"
            />
            <Button
              variant={viewMode === 'list' ? 'primary' : 'ghost'}
              icon={List}
              onClick={() => setViewMode('list')}
              size="sm"
            />
          </div>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg shadow-sm p-6 mt-4 overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('books.category')}
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">{t('books.all_categories')}</option>
                    <option value="Technology">{t('books.technology')}</option>
                    <option value="تكنولوجيا">{t('books.technology')}</option>
                    <option value="Science">{t('books.science')}</option>
                    <option value="History">{t('books.history')}</option>
                    <option value="Literature">{t('books.literature')}</option>
                  </select>
                </div>

                {/* Language Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('books.language')}
                  </label>
                  <select
                    value={filters.language}
                    onChange={(e) => setFilters({ ...filters, language: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">{t('books.all_languages')}</option>
                    <option value="English">English</option>
                    <option value="Arabic">العربية</option>
                  </select>
                </div>

                {/* Availability Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('books.availability')}
                  </label>
                  <select
                    value={filters.availability}
                    onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">{t('books.all_books')}</option>
                    <option value="available">{t('books.available_only')}</option>
                    <option value="borrowed">{t('books.borrowed_only')}</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Books Grid/List */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 aspect-[3/4] rounded-xl mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            layout
            className={`grid ${
              viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1'
            } gap-6`}
          >
            <AnimatePresence mode="popLayout">
              {filteredBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* No Results */}
        {!loading && filteredBooks.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <BookOpen size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">
              {t('books.no_books_found')}
            </h3>
            <p className="text-gray-500">{t('books.try_different_search')}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
