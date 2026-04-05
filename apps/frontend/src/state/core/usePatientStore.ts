import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export interface IcfRecord {
  id: string;
  [key: string]: any;
}

export interface Patient {
  details: {
    [key: string]: any;
  };
  icf: {
    bodyStructure: IcfRecord[];
    activities: IcfRecord[];
    participation: IcfRecord[];
    environmentalFactors: IcfRecord[];
    personalFactors: IcfRecord[];
    [dimension: string]: IcfRecord[];
  };
}

export interface PatientState {
  patients: Record<string, Patient>;
  addPatient: (patientId: string, patientDetails: any) => void;
  removePatient: (patientId: string) => void;
  updateIcfRecord: (patientId: string, dimension: string, recordId: string, updates: Partial<IcfRecord>) => void;
  addIcfRecord: (patientId: string, dimension: string, record: Omit<IcfRecord, 'id'>) => void;
  deleteIcfRecord: (patientId: string, dimension: string, recordId: string) => void;
  moveIcfRecord: (patientId: string, sourceDimension: string, targetDimension: string, recordId: string, newIndex: number) => void;
}

export const usePatientStore = create<PatientState>()(
  persist(
    (set) => ({
      patients: {},

      addPatient: (patientId, patientDetails) => {
        set((state) => ({
          patients: {
            ...state.patients,
            [patientId]: {
              details: { ...patientDetails },
              icf: {
                bodyStructure: [],
                activities: [],
                participation: [],
                environmentalFactors: [],
                personalFactors: [],
                ...(state.patients[patientId]?.icf || {}),
              },
              ...state.patients[patientId],
            },
          },
        }));
      },

      removePatient: (patientId) => {
        set((state) => {
          const { [patientId]: _, ...rest } = state.patients;
          return { patients: rest };
        });
      },

      updateIcfRecord: (patientId, dimension, recordId, updates) => {
        set((state) => {
          const patient = state.patients[patientId];
          if (!patient || !patient.icf[dimension]) return state;

          const updatedDimension = patient.icf[dimension].map((record) =>
            record.id === recordId ? { ...record, ...updates } : record
          );

          return {
            patients: {
              ...state.patients,
              [patientId]: {
                ...patient,
                icf: {
                  ...patient.icf,
                  [dimension]: updatedDimension,
                },
              },
            },
          };
        });
      },

      addIcfRecord: (patientId, dimension, record) => {
        set((state) => {
          const patient = state.patients[patientId];
          if (!patient) return state;

          const newRecord = { id: uuidv4(), ...record };
          const dimensionList = patient.icf[dimension] || [];

          return {
            patients: {
              ...state.patients,
              [patientId]: {
                ...patient,
                icf: {
                  ...patient.icf,
                  [dimension]: [...dimensionList, newRecord],
                },
              },
            },
          };
        });
      },

      deleteIcfRecord: (patientId, dimension, recordId) => {
        set((state) => {
          const patient = state.patients[patientId];
          if (!patient || !patient.icf[dimension]) return state;

          return {
            patients: {
              ...state.patients,
              [patientId]: {
                ...patient,
                icf: {
                  ...patient.icf,
                  [dimension]: patient.icf[dimension].filter((r) => r.id !== recordId),
                },
              },
            },
          };
        });
      },

      moveIcfRecord: (patientId, sourceDimension, targetDimension, recordId, newIndex) => {
        set((state) => {
          const patient = state.patients[patientId];
          if (!patient) return state;

          let recordToMove: IcfRecord | undefined;
          const sourceList = [...patient.icf[sourceDimension]];

          const recordIndex = sourceList.findIndex((r) => r.id === recordId);
          if (recordIndex === -1) return state;

          [recordToMove] = sourceList.splice(recordIndex, 1);

          const targetList = sourceDimension === targetDimension
            ? sourceList
            : [...(patient.icf[targetDimension] || [])];

          targetList.splice(newIndex, 0, recordToMove);

          return {
            patients: {
              ...state.patients,
              [patientId]: {
                ...patient,
                icf: {
                  ...patient.icf,
                  [sourceDimension]: sourceList,
                  [targetDimension]: targetList,
                },
              },
            },
          };
        });
      },
    }),
    {
      name: 'patient-store',
    }
  )
);
