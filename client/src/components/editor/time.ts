import { addWeeks } from 'date-fns';

export default class Timer {
  public weeksCounter: number;
  public phaseCounter: number;
  public minWeeks: number;

  constructor(public begin: Date, public weeks: number) {
    this.begin = begin;
    this.weeksCounter = weeks;
    this.phaseCounter = 0;
    this.minWeeks = 4;
  }

  get calculateDays(): number {
    return this.weeks * 7;
  }

  get calculateMonths(): number {
    return this.weeks / 4; // Consider using weeks / 4 to estimate months
  }

  calculateEndDate(): Date | null {
    if (this.begin && this.weeks) {
      const endDate = addWeeks(this.begin, this.weeks);
      return endDate;
    }
    return null;
  }

  // Additional logic to handle the weeks count in phase creation

  setWeeksCounter(value: number): void {
    this.weeksCounter = Math.max(value, 0);
  }

  setPhaseCounter(value: number): void {
    this.phaseCounter = Math.max(value, 0);
  }

  weeksHandler(): number {
    if (this.weeksCounter !== 0 && this.phaseCounter !== 0) {
      let maxWeeks = this.weeksCounter - this.minWeeks * (this.phaseCounter - 1);
      return maxWeeks;
    } else {
      return this.weeksCounter;
    }
  }
}
