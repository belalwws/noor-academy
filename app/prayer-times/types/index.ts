export enum TimeNames {
  Fajr = 0,
  Sunrise = 1,
  Dhuhr = 2,
  Asr = 3,
  Maghrib = 4,
  Isha = 5,
}

export interface ITime {
  name: TimeNames;
  time: string;
}

export interface IPrayerTimes {
  date: string;
  hijri: string;
  times: ITime[];
}

export interface ISettings {
  country: ICountry | null;
  city: ICity | null;
  adjustments: number[];
}

export interface ICountry {
  code: string;
  name: string;
}

export interface ICity {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface IPrayerTimesContext {
  prayerTimes: IPrayerTimes | null;
  settings: ISettings;
  countries: ICountry[];
  cities: ICity[];
  loading: boolean;
  error: string | null;
  loadCountries: () => Promise<void>;
  loadCities: (countryCode: string) => Promise<void>;
  loadPrayerTimes: (latitude: number, longitude: number) => Promise<void>;
  updateSettings: (newSettings: Partial<ISettings>) => void;
  getCurrentLocation: () => Promise<void>;
}

export const prayerNamesArabic = {
  [TimeNames.Fajr]: "الفجر",
  [TimeNames.Sunrise]: "الشروق", 
  [TimeNames.Dhuhr]: "الظهر",
  [TimeNames.Asr]: "العصر",
  [TimeNames.Maghrib]: "المغرب",
  [TimeNames.Isha]: "العشاء",
};

export enum TypeTimer {
  NEXT_PRAYER = "NEXT_PRAYER",
  CURRENT_PRAYER = "CURRENT_PRAYER",
}
