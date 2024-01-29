import { addWeeks } from 'date-fns';

export default class Timer {
  public weeksCounter: number;
  public phaseCounter: number;
  public minWeeks: number;
  public endDate?: Date;
  public mirror_weeks_counter: number;

  constructor(public begin: Date, public weeks: number) {
    this.begin = begin;
    this.endDate = undefined ;
    this.weeksCounter = Math.max(weeks, 0);
    this.phaseCounter = Math.max(0, 0);
    this.minWeeks = 4;
    this.mirror_weeks_counter = 0;
  }

  get calculateDays(): number {
    return this.weeks * 7;
  }

  get calculateMonths(): number {
    return this.weeks / 4; // Consider using weeks / 4 to estimate months
  }

  calculateEndDate(): Date | null {
    if (this.begin && this.weeks) {
      this.endDate = addWeeks(this.begin, this.weeks);
      return this.endDate;
    }
    return null;
  }

  // Additional logic to handle the weeks count in phase creation

  setWeeksCounter(value: number): void {
    this.weeksCounter = Math.max(value, 0);
  }

  setMirrorWeeksCounter(value: number): void {
    this.mirror_weeks_counter = Math.max(value, 0);
  }

  setPhaseCounter(value: number): void {
    this.phaseCounter = Math.max(value, 0);
  }

  weeksHandler(previousWeeks: number): number {
    if (previousWeeks === 0 || isNaN(previousWeeks)) {
      if (this.weeksCounter !== 0 && this.phaseCounter !== 0) {
        let maxWeeks = this.weeksCounter - this.minWeeks * (this.phaseCounter - 1);
        return maxWeeks;
      } else {
        return this.weeksCounter;
      }
    } else {
      if (this.weeksCounter !== 0 && this.phaseCounter !== 0) {
        let maxWeeks = (previousWeeks + this.weeksCounter) - this.minWeeks * (this.phaseCounter - 1);
        return maxWeeks;
      } else {
        return (previousWeeks + this.weeksCounter);
      }
    }
  }

  static from(other: Timer): Timer {
    const clonedTimer = new Timer(other.begin, other.weeks);

    clonedTimer.endDate = other.endDate;
    clonedTimer.weeksCounter = other.weeksCounter;
    clonedTimer.phaseCounter = other.phaseCounter;
    clonedTimer.minWeeks = other.minWeeks;

    return clonedTimer;
  }
}
