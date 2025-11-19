// استخدام Aladhan API - مجاني وبدون CORS
const ALADHAN_BASE_URL = 'https://api.aladhan.com/v1';

export interface Country {
  code: string;
  name: string;
}

export interface City {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}

// قائمة الدول الرئيسية
export const getCountries = async (): Promise<Country[]> => {
  return [
    { code: 'SA', name: 'المملكة العربية السعودية' },
    { code: 'EG', name: 'مصر' },
    { code: 'AE', name: 'الإمارات العربية المتحدة' },
    { code: 'JO', name: 'الأردن' },
    { code: 'LB', name: 'لبنان' },
    { code: 'SY', name: 'سوريا' },
    { code: 'IQ', name: 'العراق' },
    { code: 'KW', name: 'الكويت' },
    { code: 'QA', name: 'قطر' },
    { code: 'BH', name: 'البحرين' },
    { code: 'OM', name: 'عمان' },
    { code: 'YE', name: 'اليمن' },
    { code: 'MA', name: 'المغرب' },
    { code: 'DZ', name: 'الجزائر' },
    { code: 'TN', name: 'تونس' },
    { code: 'LY', name: 'ليبيا' },
    { code: 'SD', name: 'السودان' },
    { code: 'TR', name: 'تركيا' },
    { code: 'IR', name: 'إيران' },
    { code: 'PK', name: 'باكستان' },
    { code: 'BD', name: 'بنغلاديش' },
    { code: 'ID', name: 'إندونيسيا' },
    { code: 'MY', name: 'ماليزيا' },
  ];
};

// المدن الرئيسية لكل دولة
export const getCitiesByCountry = async (countryCode: string): Promise<City[]> => {
  const citiesData: Record<string, City[]> = {
    'SA': [
      { name: 'الرياض', country: 'SA', latitude: 24.7136, longitude: 46.6753 },
      { name: 'جدة', country: 'SA', latitude: 21.4858, longitude: 39.1925 },
      { name: 'مكة المكرمة', country: 'SA', latitude: 21.3891, longitude: 39.8579 },
      { name: 'المدينة المنورة', country: 'SA', latitude: 24.5247, longitude: 39.5692 },
      { name: 'الدمام', country: 'SA', latitude: 26.4207, longitude: 50.0888 },
    ],
    'EG': [
      { name: 'القاهرة', country: 'EG', latitude: 30.0444, longitude: 31.2357 },
      { name: 'الإسكندرية', country: 'EG', latitude: 31.2001, longitude: 29.9187 },
      { name: 'الجيزة', country: 'EG', latitude: 30.0131, longitude: 31.2089 },
      { name: 'شرم الشيخ', country: 'EG', latitude: 27.9158, longitude: 34.3300 },
    ],
    'AE': [
      { name: 'دبي', country: 'AE', latitude: 25.2048, longitude: 55.2708 },
      { name: 'أبوظبي', country: 'AE', latitude: 24.2992, longitude: 54.6970 },
      { name: 'الشارقة', country: 'AE', latitude: 25.3573, longitude: 55.4033 },
      { name: 'عجمان', country: 'AE', latitude: 25.4052, longitude: 55.5136 },
    ],
    'JO': [
      { name: 'عمان', country: 'JO', latitude: 31.9454, longitude: 35.9284 },
      { name: 'إربد', country: 'JO', latitude: 32.5556, longitude: 35.8500 },
      { name: 'الزرقاء', country: 'JO', latitude: 32.0727, longitude: 36.0888 },
    ],
    'TR': [
      { name: 'إسطنبول', country: 'TR', latitude: 41.0082, longitude: 28.9784 },
      { name: 'أنقرة', country: 'TR', latitude: 39.9334, longitude: 32.8597 },
      { name: 'إزمير', country: 'TR', latitude: 38.4192, longitude: 27.1287 },
    ],
  };

  return citiesData[countryCode] || [];
};

// الحصول على مواقيت الصلاة باستخدام الإحداثيات
export const getPrayerTimes = async (latitude: number, longitude: number, date?: string) => {
  try {
    const dateParam = date || new Date().toISOString().split('T')[0];
    const response = await fetch(
      `${ALADHAN_BASE_URL}/timings/${dateParam}?latitude=${latitude}&longitude=${longitude}&method=4`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.code !== 200) {
      throw new Error('API returned error');
    }

    return {
      date: data.data.date.gregorian,
      hijri: data.data.date.hijri,
      timings: {
        Fajr: data.data.timings.Fajr,
        Sunrise: data.data.timings.Sunrise,
        Dhuhr: data.data.timings.Dhuhr,
        Asr: data.data.timings.Asr,
        Maghrib: data.data.timings.Maghrib,
        Isha: data.data.timings.Isha,
      },
    };
  } catch (error) {
    console.error('Error fetching prayer times:', error);
    throw error;
  }
};

// الحصول على مواقيت الصلاة بالمدينة
export const getPrayerTimesByCity = async (cityName: string, countryCode: string, date?: string) => {
  try {
    const dateParam = date || new Date().toISOString().split('T')[0];
    const response = await fetch(
      `${ALADHAN_BASE_URL}/timingsByCity/${dateParam}?city=${encodeURIComponent(cityName)}&country=${countryCode}&method=4`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.code !== 200) {
      throw new Error('API returned error');
    }

    return {
      date: data.data.date.gregorian,
      hijri: data.data.date.hijri,
      timings: {
        Fajr: data.data.timings.Fajr,
        Sunrise: data.data.timings.Sunrise,
        Dhuhr: data.data.timings.Dhuhr,
        Asr: data.data.timings.Asr,
        Maghrib: data.data.timings.Maghrib,
        Isha: data.data.timings.Isha,
      },
    };
  } catch (error) {
    console.error('Error fetching prayer times by city:', error);
    throw error;
  }
};
