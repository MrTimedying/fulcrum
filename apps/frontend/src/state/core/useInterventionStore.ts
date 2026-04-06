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
  phaseIds: string[];
  [key: string]: any;
}

export interface Phase {
  id: string;
  name: string;
  microcycleIds: string[];
}

export interface Microcycle {
  id: string;
  name: string;
  sessionIds: string[];
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
  phases: Record<string, Phase>;
  microcycles: Record<string, Microcycle>;
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
  
  addPhase: (interventionId: string, name?: string) => string;
  updatePhase: (id: string, updates: Partial<Phase>) => void;
  deletePhase: (interventionId: string, phaseId: string) => void;
  
  addMicrocycle: (phaseId: string, name?: string) => string;
  updateMicrocycle: (id: string, updates: Partial<Microcycle>) => void;
  deleteMicrocycle: (phaseId: string, microId: string) => void;

  addSession: (interventionId: string, sessionData?: Partial<Session>, microId?: string) => string;
  updateSession: (id: string, updates: Partial<Session>) => void;
  updateMultipleSessions: (updatesMap: Record<string, Partial<Session>>) => void;
  deleteSession: (id: string, microId?: string) => void;
  
  moveSession: (sourceMicroId: string, targetMicroId: string, sessionId: string, newIndex: number) => void;
  moveMicrocycle: (sourcePhaseId: string, targetPhaseId: string, microId: string, newIndex: number) => void;
  movePhase: (interventionId: string, phaseId: string, newIndex: number) => void;

  cloneSessions: (sessionIds: string[], targetMicroId: string) => void;

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
  clearInterventions: () => void;
}

export const useInterventionStore = create<InterventionState>()(
  persist(
    (set, get) => ({
      interventions: {},
      phases: {},
      microcycles: {},
      sessions: {},
      exercises: [],
      templates: [],
      selectedInterventionId: null,
      selectedSessionId: null,

      clearInterventions: () => set({ 
        interventions: {}, 
        phases: {},
        microcycles: {},
        sessions: {}, 
        exercises: [], 
        selectedInterventionId: null, 
        selectedSessionId: null 
      }),

      setSelectedInterventionId: (id) => set({ selectedInterventionId: id }),
      setSelectedSessionId: (id) => set({ selectedSessionId: id }),

      addIntervention: (patientId, data) => {
        let intervention: Intervention;
        if (typeof data === 'string') {
          const id = uuidv4();
          intervention = { id, name: data, patientId, phaseIds: [] };
        } else {
          const id = data.id || uuidv4();
          intervention = { ...data, id, patientId, phaseIds: data.phaseIds || [] } as Intervention;
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

      addPhase: (interventionId, name = 'New Phase') => {
        const id = uuidv4();
        const phase: Phase = { id, name, microcycleIds: [] };
        
        set((state) => ({
          phases: { ...state.phases, [id]: phase },
          interventions: {
            ...state.interventions,
            [interventionId]: {
              ...state.interventions[interventionId],
              phaseIds: [...(state.interventions[interventionId].phaseIds || []), id]
            }
          }
        }));
        return id;
      },

      updatePhase: (id, updates) => {
        set((state) => ({
          phases: {
            ...state.phases,
            [id]: { ...state.phases[id], ...updates }
          }
        }));
      },

      deletePhase: (interventionId, phaseId) => {
        set((state) => {
          const { [phaseId]: removedPhase, ...remainingPhases } = state.phases;
          const intervention = state.interventions[interventionId];
          if (!intervention) return state;
          return {
            phases: remainingPhases,
            interventions: {
              ...state.interventions,
              [interventionId]: {
                ...intervention,
                phaseIds: (intervention.phaseIds || []).filter(id => id !== phaseId)
              }
            }
          };
        });
      },

      addMicrocycle: (phaseId, name = 'New Microcycle') => {
        const id = uuidv4();
        const micro: Microcycle = { id, name, sessionIds: [] };
        
        set((state) => ({
          microcycles: { ...state.microcycles, [id]: micro },
          phases: {
            ...state.phases,
            [phaseId]: {
              ...state.phases[phaseId],
              microcycleIds: [...(state.phases[phaseId].microcycleIds || []), id]
            }
          }
        }));
        return id;
      },

      updateMicrocycle: (id, updates) => {
        set((state) => ({
          microcycles: {
            ...state.microcycles,
            [id]: { ...state.microcycles[id], ...updates }
          }
        }));
      },

      deleteMicrocycle: (phaseId, microId) => {
        set((state) => {
          const { [microId]: _, ...remainingMicros } = state.microcycles;
          const phase = state.phases[phaseId];
          if (!phase) return state;
          return {
            microcycles: remainingMicros,
            phases: {
              ...state.phases,
              [phaseId]: {
                ...phase,
                microcycleIds: (phase.microcycleIds || []).filter(id => id !== microId)
              }
            }
          };
        });
      },

      addSession: (interventionId, sessionData, microId) => {
        const id = uuidv4();
        const session: Session = {
          id,
          interventionId,
          name: sessionData?.name || 'New Session',
          date: sessionData?.date || new Date().toISOString(),
          tags: sessionData?.tags || {},
          exercises: sessionData?.exercises || [],
          order: 0,
          ...sessionData,
        };

        set((state) => {
          const newState = {
            ...state,
            sessions: { ...state.sessions, [id]: session },
          };

          if (microId && state.microcycles[microId]) {
            newState.microcycles = {
              ...state.microcycles,
              [microId]: {
                ...state.microcycles[microId],
                sessionIds: [...(state.microcycles[microId].sessionIds || []), id]
              }
            };
          }

          return newState;
        });
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

      deleteSession: (id, microId) => {
        set((state) => {
          const { [id]: _, ...remainingSessions } = state.sessions;
          const newState: any = {
            sessions: remainingSessions,
            selectedSessionId: state.selectedSessionId === id ? null : state.selectedSessionId,
          };

          if (microId && state.microcycles[microId]) {
            newState.microcycles = {
              ...state.microcycles,
              [microId]: {
                ...state.microcycles[microId],
                sessionIds: (state.microcycles[microId].sessionIds || []).filter(sid => sid !== id)
              }
            };
          }

          return newState;
        });
      },

      moveSession: (sourceMicroId, targetMicroId, sessionId, newIndex) => {
        set((state) => {
          const sourceMicro = state.microcycles[sourceMicroId];
          const targetMicro = state.microcycles[targetMicroId];
          
          let sourceIds = [];
          if (sourceMicro) {
            sourceIds = [...sourceMicro.sessionIds];
            const sIdx = sourceIds.indexOf(sessionId);
            if (sIdx > -1) sourceIds.splice(sIdx, 1);
          }

          if (!targetMicro) return state; // Still need a valid target micro

          const targetIds = sourceMicroId === targetMicroId ? sourceIds : [...targetMicro.sessionIds];
          targetIds.splice(newIndex, 0, sessionId);

          const newState: any = {
            microcycles: {
              ...state.microcycles,
              [targetMicroId]: { ...targetMicro, sessionIds: targetIds },
            }
          };

          if (sourceMicro && sourceMicroId !== targetMicroId) {
            newState.microcycles[sourceMicroId] = { ...sourceMicro, sessionIds: sourceIds };
          }

          return newState;
        });
      },

      moveMicrocycle: (sourcePhaseId, targetPhaseId, microId, newIndex) => {
        set((state) => {
          const sourcePhase = state.phases[sourcePhaseId];
          const targetPhase = state.phases[targetPhaseId];
          
          let sourceIds = [];
          if (sourcePhase) {
            sourceIds = [...sourcePhase.microcycleIds];
            const mIdx = sourceIds.indexOf(microId);
            if (mIdx > -1) sourceIds.splice(mIdx, 1);
          }

          if (!targetPhase) return state;

          const targetIds = sourcePhaseId === targetPhaseId ? sourceIds : [...targetPhase.microcycleIds];
          targetIds.splice(newIndex, 0, microId);

          const newState: any = {
            phases: {
              ...state.phases,
              [targetPhaseId]: { ...targetPhase, microcycleIds: targetIds },
            }
          };

          if (sourcePhase && sourcePhaseId !== targetPhaseId) {
            newState.phases[sourcePhaseId] = { ...sourcePhase, microcycleIds: sourceIds };
          }

          return newState;
        });
      },

      movePhase: (interventionId, phaseId, newIndex) => {
        set((state) => {
          const intervention = state.interventions[interventionId];
          if (!intervention) return state;

          const phaseIds = [...(intervention.phaseIds || [])];
          const pIdx = phaseIds.indexOf(phaseId);
          if (pIdx > -1) phaseIds.splice(pIdx, 1);
          phaseIds.splice(newIndex, 0, phaseId);

          return {
            interventions: {
              ...state.interventions,
              [interventionId]: { ...intervention, phaseIds }
            }
          };
        });
      },

      cloneSessions: (sessionIds, targetMicroId) => {
        set((state) => {
          const targetMicro = state.microcycles[targetMicroId];
          if (!targetMicro) return state;

          const newSessions: Record<string, Session> = {};
          const newSessionIds: string[] = [];

          sessionIds.forEach(sid => {
            const original = state.sessions[sid];
            if (original) {
              const newId = uuidv4();
              newSessions[newId] = { ..._.cloneDeep(original), id: newId };
              newSessionIds.push(newId);
            }
          });

          return {
            sessions: { ...state.sessions, ...newSessions },
            microcycles: {
              ...state.microcycles,
              [targetMicroId]: {
                ...targetMicro,
                sessionIds: [...(targetMicro.sessionIds || []), ...newSessionIds]
              }
            }
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
