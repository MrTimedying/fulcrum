export default class MicroMiddleware {
  public phaseMicro: any[];

  public microValues: any[]; // this is the long term memory
  public microData: any[]; // this is the cache
  public selectedMicro: number | null;
  public microPattern: any[]; // this is the indexing

  public wodValues: any[];
  public wodData: any[];
  public selectedWod: number | null;

  public exerciseValues: any[];
  public exerciseData: any[];
  public selectedExercise: number | null;

  public table_data: {};

  public isOpen: boolean;

  constructor(
    phaseMicro: any[] = [],
    microValues: any[] = [],
    microData: any[] = [],
    selectedMicro: number | null = null,
    microPattern: any[] = [],
    wodValues: any[] = [],
    wodData: any[] = [],
    selectedWod: number | null = null,
    exerciseValues: any[] = [],
    exerciseData: any[] = [],
    selectedExercise: number | null = null,
    table_data: {} = {},
    isOpen: boolean = false
  ) {
    this.phaseMicro = phaseMicro;
    this.microValues = microValues;
    this.selectedMicro = selectedMicro;
    this.wodValues = wodValues;
    this.selectedWod = selectedWod;
    this.isOpen = isOpen;
  }

  toggleModal(isOpen: boolean = !this.isOpen) {
    this.isOpen = isOpen;
  }

  static from(other: MicroMiddleware): MicroMiddleware {
    const updatedMicroMiddleware = new MicroMiddleware(
      other.phaseMicro,
      other.microValues,
      other.microData,
      other.selectedMicro,
      other.microPattern,
      other.wodValues,
      other.wodData,
      other.selectedWod,
      other.exerciseValues,
      other.exerciseData,
      other.selectedExercise,
      other.table_data,
      other.isOpen
    );

    return updatedMicroMiddleware;

  }
  
}
