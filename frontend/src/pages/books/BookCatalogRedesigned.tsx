import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Grid, List, SlidersHorizontal, BookOpen, X } from 'lucide-react';
import { BookCard, Book } from '@/components/books/BookCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

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

  const clearFilters = () => {
    setFilters({ category: 'all', language: 'all', availability: 'all' });
    setSearchQuery('');
  };

  const hasActiveFilters = filters.category !== 'all' || filters.language !== 'all' ||
                          filters.availability !== 'all' || searchQuery !== '';

  return (
    <div className="p-6 space-y-6">
      {/* Header with gradient */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            {t('books.catalog_title')}
          </h1>
          <p className="text-gray-600 mt-2">{t('books.catalog_subtitle') || 'Browse and search our comprehensive book collection'}</p>
        </div>
      </motion.div>

      {/* Search Bar Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="shadow-md border-0 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('books.search_placeholder') || 'Search by title, author, category...'}
                className="ps-10 h-12 text-lg border-0 bg-white shadow-sm"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters & View Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="shadow-md border-0">
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Left side - Filter Button */}
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  variant={showFilters ? "default" : "outline"}
                  className={showFilters ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="ms-2">{t('common.filter')}</span>
                </Button>
                {hasActiveFilters && (
                  <Button
                    onClick={clearFilters}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                    <span className="ms-1">{t('common.clear')}</span>
                  </Button>
                )}
              </div>

              {/* Middle - Results Count */}
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-base px-3 py-1">
                  <span className="font-bold text-blue-600">{filteredBooks.length}</span>
                  <span className="ms-1 text-gray-600">{t('books.books_found') || 'books found'}</span>
                </Badge>
              </div>

              {/* Right side - View Mode Toggle */}
              <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                <Button
                  onClick={() => setViewMode('grid')}
                  variant={viewMode === 'grid' ? "default" : "ghost"}
                  size="sm"
                  className={viewMode === 'grid' ? "bg-white shadow-sm" : "hover:bg-gray-200"}
                >
                  <Grid className="w-4 h-4" />
                  <span className="ms-2 hidden sm:inline">{t('common.grid')}</span>
                </Button>
                <Button
                  onClick={() => setViewMode('list')}
                  variant={viewMode === 'list' ? "default" : "ghost"}
                  size="sm"
                  className={viewMode === 'list' ? "bg-white shadow-sm" : "hover:bg-gray-200"}
                >
                  <List className="w-4 h-4" />
                  <span className="ms-2 hidden sm:inline">{t('common.list')}</span>
                </Button>
              </div>
            </div>

            {/* Filters Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <Separator className="my-4" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Category Filter */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2">
                        {t('books.category')}
                      </Label>
                      <Select
                        value={filters.category}
                        onValueChange={(value) => setFilters({ ...filters, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t('books.all_categories')}</SelectItem>
                          <SelectItem value="Technology">{t('books.technology')}</SelectItem>
                          <SelectItem value="تكنولوجيا">{t('books.technology')}</SelectItem>
                          <SelectItem value="Science">{t('books.science')}</SelectItem>
                          <SelectItem value="History">{t('books.history')}</SelectItem>
                          <SelectItem value="Literature">{t('books.literature')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Language Filter */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2">
                        {t('books.language')}
                      </Label>
                      <Select
                        value={filters.language}
                        onValueChange={(value) => setFilters({ ...filters, language: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t('books.all_languages')}</SelectItem>
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="Arabic">العربية</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Availability Filter */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-2">
                        {t('books.availability')}
                      </Label>
                      <Select
                        value={filters.availability}
                        onValueChange={(value) => setFilters({ ...filters, availability: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t('books.all_books')}</SelectItem>
                          <SelectItem value="available">{t('books.available_only')}</SelectItem>
                          <SelectItem value="borrowed">{t('books.borrowed_only')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {/* Books Grid/List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden border-0 shadow-md">
                <Skeleton className="aspect-[3/4] w-full" />
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredBooks.length === 0 ? (
          <Card className="shadow-md border-0">
            <CardContent className="py-16">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-700 mb-2">
                  {t('books.no_books_found') || 'No books found'}
                </h3>
                <p className="text-gray-500 mb-4">{t('books.try_different_search') || 'Try adjusting your search or filters'}</p>
                {hasActiveFilters && (
                  <Button onClick={clearFilters} variant="outline">
                    <X className="w-4 h-4" />
                    <span className="ms-2">{t('common.clear_filters')}</span>
                  </Button>
                )}
              </motion.div>
            </CardContent>
          </Card>
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
              {filteredBooks.map((book, index) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <BookCard book={book} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
