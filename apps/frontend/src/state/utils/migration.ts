import { Patient } from '../core/usePatientStore';
import { Session, Exercise, Template } from '../core/useInterventionStore';
import { Node, Edge } from '@xyflow/react';

export interface Intervention {
  id: string;
  name: string;
  patientId: string;
  nodes?: any[];
  edges?: any[];
  [key: string]: any;
}

/**
 * Basic TypeScript types for the legacy state.
 */
export interface LegacyState {
  patients: Record<string, Patient>;
  interventions: Record<string, Intervention>;
  sessions: Record<string, Session>;
  selectedInterventionId: string | null;
  selectedSessionId: string | null;
  editorStates: Record<string, {
    nodes: Node[];
    edges: Edge[];
    contextualMemory?: any[];
    historyIndex?: number;
  }>;
  profileStates: Record<string, {
    nodes: Node[];
    edges: Edge[];
    contextualMemory?: any[];
    historyIndex?: number;
  }>;
  templates: Template[];
  exercises: Exercise[];
  // Volatile properties that might not be in partialize but could exist in memory
  patientId?: string;
  activeTab?: string;
  clipboard?: { nodes: Node[]; edges: Edge[] };
  columnsLayout?: any[];
  rowsData?: any[];
}

interface PersistedState<T> {
  state: T;
  version?: number;
}

/**
 * Migration utility to handle the transition from the legacy 'flow-store'
 * to the new granular stores.
 */
export const migrateLegacyState = () => {
  const MIGRATION_KEY = 'migration-status';
  const migrationStatus = localStorage.getItem(MIGRATION_KEY);

  if (migrationStatus === 'completed') {
    return;
  }

  const legacyDataRaw = localStorage.getItem('flow-store');
  if (!legacyDataRaw) {
    localStorage.setItem(MIGRATION_KEY, 'completed');
    return;
  }

  try {
    const parsedLegacy = JSON.parse(legacyDataRaw) as PersistedState<LegacyState>;
    const legacyState = parsedLegacy.state;

    if (!legacyState) {
      localStorage.setItem(MIGRATION_KEY, 'completed');
      return;
    }

    // 1. Migrate Patient Store
    if (!localStorage.getItem('patient-store')) {
      const patientStoreData: PersistedState<any> = {
        state: {
          patients: legacyState.patients || {},
        },
        version: 0,
      };
      localStorage.setItem('patient-store', JSON.stringify(patientStoreData));
    }

    // 2. Migrate Intervention Store
    if (!localStorage.getItem('intervention-store')) {
      const interventions = { ...(legacyState.interventions || {}) };

      // For each patient, check if legacyState.editorStates[patientId] exists.
      // If it exists, create a "Default Intervention" object with those nodes and edges and add it to the 'interventions' record.
      Object.keys(legacyState.patients || {}).forEach((patientId) => {
        const editorState = legacyState.editorStates?.[patientId];
        if (editorState) {
          const defaultInterventionId = `default-${patientId}`;
          if (!interventions[defaultInterventionId]) {
            interventions[defaultInterventionId] = {
              id: defaultInterventionId,
              name: 'Default Intervention',
              patientId: patientId,
              nodes: editorState.nodes || [],
              edges: editorState.edges || [],
            };
          }
        }
      });

      const interventionStoreData: PersistedState<any> = {
        state: {
          interventions,
          sessions: legacyState.sessions || {},
          exercises: legacyState.exercises || [],
          templates: legacyState.templates || [],
          selectedInterventionId: legacyState.selectedInterventionId || null,
          selectedSessionId: legacyState.selectedSessionId || null,
        },
        version: 0,
      };
      localStorage.setItem('intervention-store', JSON.stringify(interventionStoreData));
    }

    // 3. Migrate Navigation Store
    if (!localStorage.getItem('navigation-store')) {
      // Pick the first patient as active if none specified (usually not persisted in legacy)
      const firstPatientId = Object.keys(legacyState.patients || {})[0] || '';
      const navigationStoreData: PersistedState<any> = {
        state: {
          patientId: legacyState.patientId || firstPatientId,
          activeTab: legacyState.activeTab || 'Profile',
          trailingPatientId: '',
          trailingActiveTab: '',
        },
        version: 0,
      };
      localStorage.setItem('navigation-store', JSON.stringify(navigationStoreData));
    }

    // 4. Migrate Flow Diagram Store
    if (!localStorage.getItem('flow-diagram-store')) {
      const activePatientId = legacyState.patientId || Object.keys(legacyState.patients || {})[0];
      const activeTab = legacyState.activeTab || 'Profile';
      
      let nodes: Node[] = [];
      let edges: Edge[] = [];

      // Try to hydrate with the last active patient/tab state
      if (activePatientId) {
        if (activeTab === 'Editor' && legacyState.editorStates?.[activePatientId]) {
          nodes = legacyState.editorStates[activePatientId].nodes || [];
          edges = legacyState.editorStates[activePatientId].edges || [];
        } else if (legacyState.profileStates?.[activePatientId]) {
          nodes = legacyState.profileStates[activePatientId].nodes || [];
          edges = legacyState.profileStates[activePatientId].edges || [];
        }
      }

      const flowDiagramStoreData: PersistedState<any> = {
        state: {
          nodes,
          edges,
          clipboard: legacyState.clipboard || { nodes: [], edges: [] },
          selectedNodeId: null,
          columnsLayout: legacyState.columnsLayout || [],
          rowsData: legacyState.rowsData || [],
        },
        version: 0,
      };
      localStorage.setItem('flow-diagram-store', JSON.stringify(flowDiagramStoreData));
    }

    // Mark as completed
    localStorage.setItem(MIGRATION_KEY, 'completed');
    console.info('Successfully migrated legacy flow-store to granular stores.');
  } catch (error) {
    console.error('Migration failed:', error);
    // We don't mark as completed here to allow for retry on next load if it was a transient error
  }
};
