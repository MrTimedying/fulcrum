import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash';
import { useFlowDiagramStore } from '../flow/useFlowDiagramStore';
import { remapNodesAndEdgesWithNewIds, offsetNodesEdgesPosition } from '../../components/utils';

export interface Exercise {
  id: string;
  name: string;
  duration?: number;
  sets?: number;
  reps?: number;
  intensity?: number;
  [key: string]: any;
}

export interface Session {
  id: string;
  interventionId: string;
  name: string;
  date: string;
  tags: Record<string, string>;
  exercises: Exercise[];
  order: number;
  [key: string]: any;
}

export interface Intervention {
  id: string;
  name: string;
  patientId: string;
  nodes?: any[];
  edges?: any[];
  [key: string]: any;
}

export interface Template {
  id: string;
  name: string;
  nodes: any[];
  edges: any[];
  [key: string]: any;
}

export interface InterventionState {
  interventions: Record<string, Intervention>;
  sessions: Record<string, Session>;
  exercises: Exercise[];
  templates: Template[];
  selectedInterventionId: string | null;
  selectedSessionId: string | null;

  addIntervention: (patientId: string, data: string | Partial<Intervention>) => string;
  updateIntervention: (id: string, updates: Partial<Intervention>) => void;
  loadIntervention: (patientId: string, interventionId: string) => void;
  saveActiveIntervention: (patientId: string, interventionId: string) => void;
  removeIntervention: (patientId: string, interventionId: string) => void;
  addSession: (interventionId: string, sessionData?: Partial<Session>) => string;
  updateSession: (id: string, updates: Partial<Session>) => void;
  updateMultipleSessions: (updatesMap: Record<string, Partial<Session>>) => void;
  deleteSession: (id: string) => void;
  setSelectedInterventionId: (id: string | null) => void;
  setSelectedSessionId: (id: string | null) => void;

  addExercise: () => void;
  updateExerciseData: (exerciseId: string, field: string, value: any) => void;
  deleteExercises: (exerciseIds: string[]) => void;
  saveExercise: (exercise: Omit<Exercise, 'id'>) => void;
  deleteExercise: (mangledKey: string) => void;

  addTemplate: (template: Template) => void;
  removeTemplate: (templateId: string) => void;
  loadTemplate: (templateId: string) => void;

  bulkUpdateNodeData: (nodeId: string, property: string, value: any) => void;
}

export const useInterventionStore = create<InterventionState>()(
  persist(
    (set, get) => ({
      interventions: {},
      sessions: {},
      exercises: [],
      templates: [],
      selectedInterventionId: null,
      selectedSessionId: null,

      setSelectedInterventionId: (id) => set({ selectedInterventionId: id }),
      setSelectedSessionId: (id) => set({ selectedSessionId: id }),

      addIntervention: (patientId, data) => {
        let intervention: Intervention;
        if (typeof data === 'string') {
          const id = uuidv4();
          intervention = { id, name: data, patientId };
        } else {
          const id = data.id || uuidv4();
          intervention = { ...data, id, patientId } as Intervention;
        }

        set((state) => ({
          interventions: {
            ...state.interventions,
            [intervention.id]: intervention,
          },
        }));
        return intervention.id;
      },

      updateIntervention: (id, updates) => {
        set((state) => ({
          interventions: {
            ...state.interventions,
            [id]: { ...state.interventions[id], ...updates },
          },
        }));
      },

      loadIntervention: (patientId, interventionId) => {
        const intervention = get().interventions[interventionId];
        const flowStore = useFlowDiagramStore.getState();
        
        if (intervention && intervention.patientId === patientId) {
          flowStore.setNodes(intervention.nodes || []);
          flowStore.setEdges(intervention.edges || []);
          set({ selectedInterventionId: interventionId });
        } else {
          // If intervention not found or belongs to another patient, clear diagram
          flowStore.setNodes([]);
          flowStore.setEdges([]);
          set({ selectedInterventionId: null });
        }
      },

      saveActiveIntervention: (patientId, interventionId) => {
        const { nodes, edges } = useFlowDiagramStore.getState();
        set((state) => {
          const intervention = state.interventions[interventionId];
          if (intervention && intervention.patientId === patientId) {
            return {
              interventions: {
                ...state.interventions,
                [interventionId]: {
                  ...intervention,
                  nodes: _.cloneDeep(nodes),
                  edges: _.cloneDeep(edges),
                },
              },
            };
          }
          return state;
        });
      },

      removeIntervention: (patientId, interventionId) => {
        set((state) => {
          const intervention = state.interventions[interventionId];
          if (intervention && intervention.patientId !== patientId) {
            return state;
          }
          const { [interventionId]: _, ...rest } = state.interventions;
          return {
            interventions: rest,
            selectedInterventionId: state.selectedInterventionId === interventionId ? null : state.selectedInterventionId,
          };
        });
      },

      addSession: (interventionId, sessionData) => {
        const id = uuidv4();
        const interventionSessions = Object.values(get().sessions).filter(
          (s) => s.interventionId === interventionId
        );
        const sessionNumber = interventionSessions.length + 1;

        set((state) => ({
          sessions: {
            ...state.sessions,
            [id]: {
              id,
              interventionId,
              name: `Session ${sessionNumber}`,
              date: new Date().toISOString(),
              tags: { Phase: 'Phase 1', Micro: 'Micro 1' },
              exercises: [],
              order: sessionNumber,
              ...sessionData,
            },
          },
        }));
        return id;
      },

      updateSession: (id, updates) => {
        set((state) => ({
          sessions: {
            ...state.sessions,
            [id]: { ...state.sessions[id], ...updates },
          },
        }));
      },

      updateMultipleSessions: (updatesMap) => {
        set((state) => {
          const newSessions = { ...state.sessions };
          Object.entries(updatesMap).forEach(([id, updates]) => {
            if (newSessions[id]) {
              newSessions[id] = { ...newSessions[id], ...updates };
            }
          });
          return { sessions: newSessions };
        });
      },

      deleteSession: (id) => {
        set((state) => {
          const { [id]: _, ...rest } = state.sessions;
          return {
            sessions: rest,
            selectedSessionId: state.selectedSessionId === id ? null : state.selectedSessionId,
          };
        });
      },

      addExercise: () => {
        const { selectedSessionId } = get();
        if (!selectedSessionId) return;

        set((state) => {
          const session = state.sessions[selectedSessionId];
          if (!session) return state;

          const newExercise: Exercise = {
            id: uuidv4(),
            name: 'New Exercise',
            duration: 0,
            sets: 0,
            reps: 0,
            intensity: 0,
          };

          const exercises = Array.isArray(session.exercises) ? session.exercises : [];

          return {
            sessions: {
              ...state.sessions,
              [selectedSessionId]: {
                ...session,
                exercises: [...exercises, newExercise],
              },
            },
          };
        });
      },

      updateExerciseData: (exerciseId, field, value) => {
        const { selectedSessionId } = get();
        if (!selectedSessionId) return;

        set((state) => {
          const session = state.sessions[selectedSessionId];
          if (!session) return state;

          const exercises = [...(session.exercises || [])];
          const exerciseIndex = exercises.findIndex((ex) => ex.id === exerciseId);

          if (exerciseIndex >= 0) {
            exercises[exerciseIndex] = { ...exercises[exerciseIndex], [field]: value };
          }

          return {
            sessions: {
              ...state.sessions,
              [selectedSessionId]: {
                ...session,
                exercises,
              },
            },
          };
        });
      },

      deleteExercises: (exerciseIds) => {
        const { selectedSessionId } = get();
        if (!selectedSessionId) return;

        set((state) => {
          const session = state.sessions[selectedSessionId];
          if (!session) return state;

          const exercises = (session.exercises || []).filter(
            (ex) => !exerciseIds.includes(ex.id)
          );

          return {
            sessions: {
              ...state.sessions,
              [selectedSessionId]: {
                ...session,
                exercises,
              },
            },
          };
        });
      },

      saveExercise: (exercise) => {
        const exerciseNewId = { ...exercise, id: uuidv4() };
        set((state) => ({
          exercises: [...state.exercises, exerciseNewId],
        }));
      },

      deleteExercise: (mangledKey) => {
        set((state) => ({
          exercises: state.exercises.filter((ex) => ex.name !== mangledKey),
        }));
      },

      addTemplate: (template) => {
        set((state) => ({
          templates: [...state.templates, template],
        }));
      },

      removeTemplate: (templateId) => {
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== templateId),
        }));
      },

      loadTemplate: (templateId) => {
        const template = get().templates.find((t) => t.id === templateId);
        if (template) {
          const { newNodes, newEdges } = remapNodesAndEdgesWithNewIds(
            template.nodes || [],
            template.edges || []
          );
          const { offsetedNodes, offsetedEdges } = offsetNodesEdgesPosition(
            newNodes,
            newEdges,
            50,
            50
          );

          const flowStore = useFlowDiagramStore.getState();
          flowStore.setNodes((nds) => [...nds, ...offsetedNodes]);
          flowStore.setEdges((eds) => [...eds, ...offsetedEdges]);
        }
      },

      bulkUpdateNodeData: (nodeId, property, value) => {
        const flowStore = useFlowDiagramStore.getState();
        const nodeExists = flowStore.nodes.some((n) => n.id === nodeId);
        if (nodeExists) {
          flowStore.updateNodeData(property, value, nodeId);
        }

        set((state) => {
          const newState = _.cloneDeep(state);
          if (newState.sessions[nodeId]) {
            _.set(newState.sessions[nodeId], property, value);
          } else if (newState.interventions[nodeId]) {
            _.set(newState.interventions[nodeId], property, value);
          }
          return newState;
        });
      },
    }),
    {
      name: 'intervention-store',
    }
  )
);
