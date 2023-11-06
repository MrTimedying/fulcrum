export default class Timer {
    public span: number;
    
    constructor(public begin: Date, public end: Date) {
      this.begin = begin;
      this.end = end;
      this.span = end.getTime() - begin.getTime();
    }
  
    public get calculateDays() {
      return this.span / (1000 * 3600 * 24); 
    }
  
    public get calculateWeeks() {
      return this.span / (1000 * 3600 * 24 * 7); 
    }
  
    public get calculateMonths() {
      return this.span / (1000 * 3600 * 24 * 7 * 4);
    }
  }
  
