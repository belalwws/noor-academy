'use client';

import React, { useState } from 'react';
import { Search, BookOpen, Download, Eye, Star, Filter } from 'lucide-react';

interface IslamicBook {
  id: string;
  title: string;
  author: string;
  category: string;
  description: string;
  pages: number;
  rating: number;
  downloadUrl?: string;
  readOnlineUrl?: string;
  coverImage?: string;
  language: 'ar' | 'en';
  size?: string;
}

const islamicBooks: IslamicBook[] = [
  {
    id: '1',
    title: 'صحيح البخاري',
    author: 'الإمام البخاري',
    category: 'الحديث الشريف',
    description: 'أصح كتب الحديث النبوي الشريف، يحتوي على الأحاديث الصحيحة المروية عن النبي محمد صلى الله عليه وسلم',
    pages: 2736,
    rating: 5.0,
    language: 'ar',
    size: '15.2 MB',
    downloadUrl: '#',
    readOnlineUrl: '#'
  },
  {
    id: '2',
    title: 'صحيح مسلم',
    author: 'الإمام مسلم',
    category: 'الحديث الشريف',
    description: 'ثاني أصح كتب الحديث النبوي، مرتب حسب الموضوعات الفقهية',
    pages: 1942,
    rating: 5.0,
    language: 'ar',
    size: '12.8 MB',
    downloadUrl: '#',
    readOnlineUrl: '#'
  },
  {
    id: '3',
    title: 'تفسير ابن كثير',
    author: 'ابن كثير',
    category: 'التفسير',
    description: 'من أشهر كتب تفسير القرآن الكريم، يجمع بين التفسير بالمأثور والرأي',
    pages: 4200,
    rating: 4.9,
    language: 'ar',
    size: '28.5 MB',
    downloadUrl: '#',
    readOnlineUrl: '#'
  },
  {
    id: '4',
    title: 'الفقه على المذاهب الأربعة',
    author: 'عبد الرحمن الجزيري',
    category: 'الفقه',
    description: 'كتاب شامل يعرض الأحكام الفقهية على المذاهب الأربعة المعتبرة',
    pages: 2156,
    rating: 4.8,
    language: 'ar',
    size: '18.3 MB',
    downloadUrl: '#',
    readOnlineUrl: '#'
  },
  {
    id: '5',
    title: 'رياض الصالحين',
    author: 'الإمام النووي',
    category: 'الأخلاق والآداب',
    description: 'مجموعة من الأحاديث النبوية في الأخلاق والآداب الإسلامية',
    pages: 896,
    rating: 4.9,
    language: 'ar',
    size: '8.2 MB',
    downloadUrl: '#',
    readOnlineUrl: '#'
  },
  {
    id: '6',
    title: 'إحياء علوم الدين',
    author: 'الإمام الغزالي',
    category: 'التصوف والأخلاق',
    description: 'موسوعة شاملة في علوم الدين والأخلاق والتزكية',
    pages: 3200,
    rating: 4.7,
    language: 'ar',
    size: '22.1 MB',
    downloadUrl: '#',
    readOnlineUrl: '#'
  },
  {
    id: '7',
    title: 'السيرة النبوية',
    author: 'ابن هشام',
    category: 'السيرة النبوية',
    description: 'سيرة النبي محمد صلى الله عليه وسلم من أوثق المصادر',
    pages: 1456,
    rating: 4.8,
    language: 'ar',
    size: '12.4 MB',
    downloadUrl: '#',
    readOnlineUrl: '#'
  },
  {
    id: '8',
    title: 'الأسماء الحسنى',
    author: 'ابن القيم',
    category: 'العقيدة',
    description: 'شرح مفصل لأسماء الله الحسنى وصفاته العلى',
    pages: 672,
    rating: 4.9,
    language: 'ar',
    size: '6.8 MB',
    downloadUrl: '#',
    readOnlineUrl: '#'
  }
];

const categories = ['الكل', 'الحديث الشريف', 'التفسير', 'الفقه', 'الأخلاق والآداب', 'التصوف والأخلاق', 'السيرة النبوية', 'العقيدة'];

export default function LibraryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [sortBy, setSortBy] = useState('title');

  const filteredBooks = islamicBooks
    .filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          book.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'الكل' || book.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title, 'ar');
        case 'author':
          return a.author.localeCompare(b.author, 'ar');
        case 'rating':
          return b.rating - a.rating;
        case 'pages':
          return b.pages - a.pages;
        default:
          return 0;
      }
    });

  return (
    <div
      className="min-h-screen"
      style={{
        background: 'linear-gradient(135deg, #2d7d32 0%, #1b5e20 50%, #0d3e10 100%)',
        fontFamily: "'Cairo', sans-serif",
        direction: 'rtl'
      }}
    >
      {/* Header */}
      <div
        className="backdrop-blur-md border-b"
        style={{
          background: 'rgba(255, 255, 255, 0.15)',
          borderColor: 'rgba(255, 215, 0, 0.3)'
        }}
      >
        <div className="container mx-auto px-4 py-6">
          <div className="text-center mb-6">
            <h1
              className="text-4xl font-bold mb-2 text-white"
              style={{ fontFamily: "'Amiri', serif" }}
            >
              📚 المكتبة الإسلامية
            </h1>
            <p className="text-lg text-white/80">
              مكتبة إلكترونية شاملة للكتب الإسلامية الأصيلة
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                style={{ color: '#ffd700' }}
              />
              <input
                type="text"
                placeholder="ابحث في الكتب..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-3 rounded-xl text-white placeholder-white/70"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 215, 0, 0.3)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#ffd700';
                  e.target.style.boxShadow = '0 0 0 2px rgba(255, 215, 0, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 215, 0, 0.3)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5" style={{ color: '#ffd700' }} />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 rounded-xl text-white"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 215, 0, 0.3)'
                }}
              >
                {categories.map(category => (
                  <option key={category} value={category} style={{ background: '#1b5e20', color: 'white' }}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 rounded-xl text-white"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 215, 0, 0.3)'
              }}
            >
              <option value="title" style={{ background: '#1b5e20', color: 'white' }}>ترتيب حسب العنوان</option>
              <option value="author" style={{ background: '#1b5e20', color: 'white' }}>ترتيب حسب المؤلف</option>
              <option value="rating" style={{ background: '#1b5e20', color: 'white' }}>ترتيب حسب التقييم</option>
              <option value="pages" style={{ background: '#1b5e20', color: 'white' }}>ترتيب حسب عدد الصفحات</option>
            </select>
          </div>
        </div>
      </div>

      {/* Books Grid */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBooks.map((book) => (
            <div
              key={book.id}
              className="backdrop-blur-md rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 215, 0, 0.3)',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 12px 35px rgba(0, 0, 0, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.2)';
              }}
            >
              {/* Book Cover */}
              <div
                className="h-48 flex items-center justify-center relative"
                style={{
                  background: 'linear-gradient(135deg, #ffd700 0%, #ffc107 100%)'
                }}
              >
                <BookOpen className="w-16 h-16" style={{ color: '#1b5e20' }} />
                <div
                  className="absolute top-3 right-3 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium"
                  style={{
                    background: 'rgba(27, 94, 32, 0.8)',
                    color: 'white'
                  }}
                >
                  {book.category}
                </div>
              </div>

              {/* Book Info */}
              <div className="p-5">
                <h3
                  className="font-bold text-lg mb-2 line-clamp-2 text-white"
                  style={{ fontFamily: "'Amiri', serif" }}
                >
                  {book.title}
                </h3>
                <p className="text-sm mb-2" style={{ color: '#ffd700' }}>
                  بقلم: {book.author}
                </p>
                <p className="text-white/80 text-sm mb-4 line-clamp-3">
                  {book.description}
                </p>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-white/70 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-current" style={{ color: '#ffd700' }} />
                    <span>{book.rating}</span>
                  </div>
                  <span>{book.pages.toLocaleString('ar-EG')} صفحة</span>
                  <span>{book.size}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-1"
                    style={{
                      background: 'linear-gradient(135deg, #ffd700 0%, #ffc107 100%)',
                      color: '#1b5e20'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <Eye className="w-4 h-4" />
                    قراءة
                  </button>
                  <button
                    className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-1 text-white"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 215, 0, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 215, 0, 0.2)';
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <Download className="w-4 h-4" />
                    تحميل
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredBooks.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto mb-4" style={{ color: '#ffd700' }} />
            <h3 className="text-xl font-semibold text-white mb-2" style={{ fontFamily: "'Amiri', serif" }}>
              لم يتم العثور على كتب
            </h3>
            <p className="text-white/80">
              جرب تغيير مصطلحات البحث أو الفئة المحددة
            </p>
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div
        className="backdrop-blur-md border-t mt-12"
        style={{
          background: 'rgba(255, 255, 255, 0.15)',
          borderColor: 'rgba(255, 215, 0, 0.3)'
        }}
      >
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold" style={{ color: '#ffd700' }}>
                {islamicBooks.length.toLocaleString('ar-EG')}
              </div>
              <div className="text-white/80 text-sm">كتاب متاح</div>
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: '#ffd700' }}>
                {categories.length - 1}
              </div>
              <div className="text-white/80 text-sm">فئة مختلفة</div>
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: '#ffd700' }}>
                {islamicBooks.reduce((sum, book) => sum + book.pages, 0).toLocaleString('ar-EG')}
              </div>
              <div className="text-white/80 text-sm">إجمالي الصفحات</div>
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: '#ffd700' }}>
                100%
              </div>
              <div className="text-white/80 text-sm">مجاني</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
