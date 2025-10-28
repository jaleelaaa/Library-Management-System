import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import {
  BookOpen,
  User,
  Calendar,
  MapPin,
  Heart,
  Share2,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Tag,
  Globe,
  FileText,
  BarChart3,
  Clock,
  Star
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Book } from '@/components/books/BookCard';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';

// Sample book data - moved outside component to prevent recreating on every render
// In real app, fetch from API based on id
const SAMPLE_BOOKS: Book[] = [
    {
      id: '1',
      title: 'The Art of Computer Programming',
      author: 'Donald Knuth',
      category: 'Technology',
      year: 2020,
      cover_image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800',
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
      cover_image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800',
      available: true,
      available_copies: 2,
      total_copies: 3,
      shelf_location: 'A-102'
    },
    {
      id: '4',
      title: 'البرمجة بلغة Python',
      author: 'محمد أحمد',
      category: 'تكنولوجيا',
      year: 2021,
      cover_image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800',
      available: true,
      available_copies: 4,
      total_copies: 4,
      shelf_location: 'B-201'
    },
  ];

export default function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'availability'>('overview');

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const foundBook = SAMPLE_BOOKS.find(b => b.id === id);
      setBook(foundBook || SAMPLE_BOOKS[0]);
      setLoading(false);
    }, 500);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700">{t('books.not_found')}</h2>
          <Button onClick={() => navigate('/books')} className="mt-4">
            {t('books.back_to_catalog')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-6 px-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          />
        </div>

        <div className={`max-w-7xl mx-auto relative z-10 flex items-center justify-between`}>
          <Button
            variant="ghost"
            icon={ArrowLeft}
            onClick={() => navigate('/books')}
            className="text-white hover:bg-white/20"
          >
            {t('common.back')}
          </Button>
          <LanguageSwitcher />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Book Cover & Actions */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-xl shadow-lg overflow-hidden sticky top-8">
              {/* Cover Image */}
              <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                {book.cover_image ? (
                  <motion.img
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    src={book.cover_image}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen size={96} className="text-gray-400" />
                  </div>
                )}

                {/* Availability Badge */}
                <div className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'}`}>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm flex items-center gap-2 ${
                    book.available
                      ? 'bg-green-500/90 text-white'
                      : 'bg-red-500/90 text-white'
                  }`}>
                    {book.available ? <CheckCircle size={16} /> : <XCircle size={16} />}
                    {book.available ? t('books.available') : t('books.borrowed')}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 space-y-3">
                <Button
                  variant={book.available ? "primary" : "secondary"}
                  size="lg"
                  fullWidth
                  disabled={!book.available}
                >
                  {book.available ? t('books.borrow_now') : t('books.not_available')}
                </Button>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    icon={Heart}
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={isFavorite ? 'border-red-500 text-red-500' : ''}
                  >
                    {isFavorite ? t('books.favorited') : t('books.favorite')}
                  </Button>
                  <Button variant="outline" icon={Share2}>
                    {t('books.share')}
                  </Button>
                </div>
              </div>

              {/* Availability Info */}
              <div className="px-6 pb-6 border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">{t('books.copies_available')}</span>
                  <span className={`text-lg font-bold ${
                    book.available_copies > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {book.available_copies} / {book.total_copies}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      book.available_copies > 0 ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${(book.available_copies / book.total_copies) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Book Details */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Title & Author */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                    {book.title}
                  </h1>
                  <div className="flex items-center gap-2 text-xl text-gray-600 mb-4">
                    <User size={20} />
                    <span>{book.author}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-yellow-50 px-3 py-2 rounded-lg">
                  <Star className="text-yellow-500 fill-yellow-500" size={20} />
                  <span className="font-semibold text-gray-900">4.5</span>
                </div>
              </div>

              {/* Quick Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Tag size={18} className="flex-shrink-0" />
                  <div>
                    <div className="text-xs text-gray-500">{t('books.category')}</div>
                    <div className="font-medium text-gray-900">{book.category}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar size={18} className="flex-shrink-0" />
                  <div>
                    <div className="text-xs text-gray-500">{t('books.year')}</div>
                    <div className="font-medium text-gray-900">{book.year}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin size={18} className="flex-shrink-0" />
                  <div>
                    <div className="text-xs text-gray-500">{t('books.location')}</div>
                    <div className="font-medium text-gray-900">{book.shelf_location}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Globe size={18} className="flex-shrink-0" />
                  <div>
                    <div className="text-xs text-gray-500">{t('books.language')}</div>
                    <div className="font-medium text-gray-900">English</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="flex border-b border-gray-200">
                {(['overview', 'details', 'availability'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 px-6 py-4 font-medium transition-all ${
                      activeTab === tab
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {t(`books.tab_${tab}`)}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      {t('books.description')}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {t('books.sample_description')}
                    </p>
                    <div className="pt-4 border-t border-gray-100">
                      <h4 className="font-semibold text-gray-900 mb-3">{t('books.subjects')}</h4>
                      <div className="flex flex-wrap gap-2">
                        {['Programming', 'Computer Science', 'Algorithms', 'Software Engineering'].map((subject) => (
                          <span key={subject} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                            {subject}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'details' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3">
                        <FileText className="text-blue-600 mt-1" size={20} />
                        <div>
                          <div className="text-sm text-gray-500">{t('books.isbn')}</div>
                          <div className="font-medium text-gray-900">978-0-201-89683-1</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <BookOpen className="text-blue-600 mt-1" size={20} />
                        <div>
                          <div className="text-sm text-gray-500">{t('books.pages')}</div>
                          <div className="font-medium text-gray-900">672 {t('books.pages_unit')}</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <BarChart3 className="text-blue-600 mt-1" size={20} />
                        <div>
                          <div className="text-sm text-gray-500">{t('books.publisher')}</div>
                          <div className="font-medium text-gray-900">Addison-Wesley</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Calendar className="text-blue-600 mt-1" size={20} />
                        <div>
                          <div className="text-sm text-gray-500">{t('books.edition')}</div>
                          <div className="font-medium text-gray-900">3rd Edition</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'availability' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="text-green-600" size={24} />
                      <div>
                        <div className="font-semibold text-green-900">{t('books.currently_available')}</div>
                        <div className="text-sm text-green-700">
                          {book.available_copies} {t('books.copies_ready_to_borrow')}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900">{t('books.loan_details')}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                          <Clock className="text-gray-400" size={20} />
                          <div>
                            <div className="text-sm text-gray-500">{t('books.loan_period')}</div>
                            <div className="font-medium text-gray-900">14 {t('books.days')}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="text-gray-400" size={20} />
                          <div>
                            <div className="text-sm text-gray-500">{t('books.renewals')}</div>
                            <div className="font-medium text-gray-900">2 {t('books.times')}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Similar Books */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {t('books.similar_books')}
              </h3>
              <div className="text-gray-500 text-center py-8">
                {t('books.similar_books_coming_soon')}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
