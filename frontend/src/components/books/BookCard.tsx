import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { BookOpen, User, Calendar, MapPin, Heart, Eye } from 'lucide-react';
import { useState } from 'react';

export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  year: number;
  cover_image?: string;
  available: boolean;
  available_copies: number;
  total_copies: number;
  shelf_location: string;
}

export interface BookCardProps {
  book: Book;
  onViewDetails?: (book: Book) => void;
}

export const BookCard = ({ book, onViewDetails }: BookCardProps) => {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(book);
    } else {
      navigate(`/books/${book.id}`);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -8 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer group"
      onClick={handleViewDetails}
    >
      {/* Book Cover Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
        {book.cover_image ? (
          <img
            src={book.cover_image}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen size={64} className="text-gray-400" />
          </div>
        )}

        {/* Availability Badge */}
        <motion.div
          initial={{ x: isRTL ? 20 : -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'}`}
        >
          <span className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
            book.available
              ? 'bg-green-500/90 text-white'
              : 'bg-red-500/90 text-white'
          }`}>
            {book.available ? t('books.available') : t('books.borrowed')}
          </span>
        </motion.div>

        {/* Favorite Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          className={`absolute bottom-3 ${isRTL ? 'left-3' : 'right-3'} p-2 rounded-full backdrop-blur-sm ${
            isFavorite
              ? 'bg-red-500 text-white'
              : 'bg-white/80 text-gray-600 hover:bg-white'
          } transition-colors shadow-lg`}
        >
          <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
        </motion.button>

        {/* Hover Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-4"
        >
          <div className="w-full flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                handleViewDetails();
              }}
              className="flex-1 bg-white text-blue-600 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-lg"
            >
              <Eye size={18} />
              {t('books.view_details')}
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Book Details */}
      <div className="p-4 space-y-2">
        {/* Title */}
        <h3 className="font-bold text-lg text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors min-h-[3.5rem]">
          {book.title}
        </h3>

        {/* Author */}
        <div className="flex items-center gap-2 text-gray-600">
          <User size={16} className="flex-shrink-0" />
          <span className="text-sm line-clamp-1">{book.author}</span>
        </div>

        {/* Category & Year */}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <BookOpen size={14} className="flex-shrink-0" />
            <span className="line-clamp-1">{book.category}</span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Calendar size={14} />
            <span>{book.year}</span>
          </div>
        </div>

        {/* Copies Available */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <MapPin size={14} className="flex-shrink-0" />
            <span className="line-clamp-1">{book.shelf_location}</span>
          </div>
          <span className={`text-sm font-medium ${
            book.available_copies > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {book.available_copies}/{book.total_copies}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
