import { DateTime, Interval } from "luxon";
import { IPrayerTimes, ITime, TimeNames, TypeTimer } from "../types";

const HOUR_FORMAT = "HH:mm";

const secondSplit = (seconds: number): TypeTimer => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return [hours, minutes, secs];
};

export class Times {
  public data: IPrayerTimes;
  public localTime: DateTime;
  public timeTravel: [number, number, number];
  public adjustments: number[];

  constructor(
    data: IPrayerTimes,
    adjustments: number[] = [0, 0, 0, 0, 0, 0]
  ) {
    this.data = data;
    this.adjustments = adjustments;
    this.localTime = DateTime.local();
    this.timeTravel = [0, 0, 0];
  }

  updateTimeTravel(value: [number, number, number]): void {
    this.timeTravel = value;
    // Update localTime with the time travel adjustment
    this.localTime = this.localTime.plus({ hours: value[0], minutes: value[1], seconds: value[2] });
  }

  updateDateTime(datetime: DateTime): void {
    this.localTime = datetime;
  }

  get today(): ITime[] {
    return this.data.times;
  }

  get time(): { now: TimeNames; next: TimeNames; timer: TypeTimer } {
    if (!this.today || this.today.length === 0) return { 
      now: TimeNames.Fajr, 
      next: TimeNames.Fajr, 
      timer: [0, 0, 0] 
    };

    // Create prayer times array with adjustments
    const prayerTimes: DateTime[] = this.today.map((prayer, index) => {
      const baseTime = DateTime.fromFormat(prayer.time, HOUR_FORMAT);
      return baseTime.plus({ minutes: this.adjustments[index] });
    });

    // Default values
    const obj: { now: TimeNames; next: TimeNames } = {
      now: TimeNames.Isha,
      next: TimeNames.Fajr,
    };

    // Check each prayer time interval
    if (Interval.fromDateTimes(prayerTimes[TimeNames.Fajr], prayerTimes[TimeNames.Sunrise]).contains(this.localTime)) {
      obj.now = TimeNames.Fajr;
      obj.next = TimeNames.Sunrise;
    } else if (Interval.fromDateTimes(prayerTimes[TimeNames.Sunrise], prayerTimes[TimeNames.Dhuhr]).contains(this.localTime)) {
      obj.now = TimeNames.Sunrise;
      obj.next = TimeNames.Dhuhr;
    } else if (Interval.fromDateTimes(prayerTimes[TimeNames.Dhuhr], prayerTimes[TimeNames.Asr]).contains(this.localTime)) {
      obj.now = TimeNames.Dhuhr;
      obj.next = TimeNames.Asr;
    } else if (Interval.fromDateTimes(prayerTimes[TimeNames.Asr], prayerTimes[TimeNames.Maghrib]).contains(this.localTime)) {
      obj.now = TimeNames.Asr;
      obj.next = TimeNames.Maghrib;
    } else if (Interval.fromDateTimes(prayerTimes[TimeNames.Maghrib], prayerTimes[TimeNames.Isha]).contains(this.localTime)) {
      obj.now = TimeNames.Maghrib;
      obj.next = TimeNames.Isha;
    }

    // Calculate timer for next prayer
    const nextPrayerTime = prayerTimes[obj.next];
    const ms = nextPrayerTime.diff(this.localTime).toMillis();
    const timer = secondSplit(ms / 1000);

    return {
      ...obj,
      timer: timer
    };
  }

  isBeforeMidnight(): boolean {
    if (!this.today || this.today.length === 0) return false;
    
    // Get Fajr time for comparison
    const fajrTime = DateTime.fromFormat(this.today[TimeNames.Fajr].time, HOUR_FORMAT)
      .plus({ minutes: this.adjustments[TimeNames.Fajr] });
    
    return this.localTime > fajrTime;
  }

  timer(): TypeTimer {
    if (!this.today || this.today.length === 0) return [0, 0, 0];

    const prayerTimes: DateTime[] = this.today.map((prayer, index) => {
      const baseTime = DateTime.fromFormat(prayer.time, HOUR_FORMAT);
      return baseTime.plus({ minutes: this.adjustments[index] });
    });

    const nextPrayerTime = prayerTimes[this.time.next];
    const ms = nextPrayerTime.diff(this.localTime).toMillis();

    return secondSplit(ms / 1000);
  }

  getCurrentPrayerIndex(): number {
    return this.time.now;
  }

  getNextPrayerIndex(): number {
    return this.time.next;
  }

  isPrayerTimePassed(prayerIndex: number): boolean {
    if (!this.today || this.today.length === 0) return false;

    const prayerTime = DateTime.fromFormat(this.today[prayerIndex].time, HOUR_FORMAT)
      .plus({ minutes: this.adjustments[prayerIndex] });
    
    return this.localTime > prayerTime;
  }

  getAdjustedTime(prayerIndex: number): string {
    if (!this.today || this.today.length === 0 || prayerIndex >= this.today.length) return "00:00";

    const prayer = this.today[prayerIndex];
    const baseTime = DateTime.fromFormat(prayer.time, HOUR_FORMAT);
    const adjustedTime = baseTime.plus({ minutes: this.adjustments[prayerIndex] });
    
    return adjustedTime.toFormat(HOUR_FORMAT);
  }

  getTimeUntilNextPrayer(): string {
    if (!this.today || this.today.length === 0) return "00:00:00";

    const prayerTimes: DateTime[] = this.today.map((prayer, index) => {
      const baseTime = DateTime.fromFormat(prayer.time, HOUR_FORMAT);
      return baseTime.plus({ minutes: this.adjustments[index] });
    });

    const nextPrayerTime = prayerTimes[this.time.next];
    const diff = nextPrayerTime.diff(this.localTime);
    const totalSeconds = Math.floor(diff.toMillis() / 1000);
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    // Format as HH:MM:SS
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}
