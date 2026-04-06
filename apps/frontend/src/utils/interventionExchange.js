import { useInterventionStore } from '../state/core/useInterventionStore';
import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash';

/**
 * Dynamically attempts to import Tauri plugins if running in a Tauri environment.
 * Fallbacks to null if not available.
 */
const getTauriPlugins = async () => {
  if (window.__TAURI_INTERNALS__) {
    try {
      // Assuming Tauri v2 plugin names
      const dialog = await import('@tauri-apps/plugin-dialog');
      const fs = await import('@tauri-apps/plugin-fs');
      return { dialog, fs };
    } catch (e) {
      console.warn('Tauri plugins not available, falling back to web standard APIs.', e);
      return null;
    }
  }
  return null;
};

/**
 * Bundles an intervention and all its related entities into a single JSON object
 * and saves it to the file system.
 */
export const exportIntervention = async (interventionId) => {
  const state = useInterventionStore.getState();
  const intervention = state.interventions[interventionId];
  
  if (!intervention) {
    console.error(`Export failed: Intervention with ID ${interventionId} not found.`);
    return;
  }

  // Bundle construction
  const bundle = {
    metadata: {
      exportedAt: new Date().toISOString(),
      version: '1.0'
    },
    intervention: _.cloneDeep(intervention),
    phases: {},
    microcycles: {},
    sessions: {},
  };

  // Collect all related entities
  intervention.phaseIds?.forEach(phaseId => {
    const phase = state.phases[phaseId];
    if (phase) {
      bundle.phases[phaseId] = _.cloneDeep(phase);
      phase.microcycleIds?.forEach(microId => {
        const micro = state.microcycles[microId];
        if (micro) {
          bundle.microcycles[microId] = _.cloneDeep(micro);
          micro.sessionIds?.forEach(sessionId => {
            const session = state.sessions[sessionId];
            if (session) {
              bundle.sessions[sessionId] = _.cloneDeep(session);
            }
          });
        }
      });
    }
  });

  const jsonContent = JSON.stringify(bundle, null, 2);
  const fileName = `intervention_${intervention.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;

  const plugins = await getTauriPlugins();
  if (plugins) {
    try {
      const filePath = await plugins.dialog.save({
        defaultPath: fileName,
        filters: [{ name: 'JSON', extensions: ['json'] }]
      });
      if (filePath) {
        await plugins.fs.writeTextFile(filePath, jsonContent);
      }
    } catch (e) {
      console.error('Tauri export failed:', e);
    }
  } else {
    // Web fallback
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }
};

/**
 * Opens a file dialog to select an intervention JSON, unbundles it with new UUIDs
 * to avoid collisions, and adds it to the store for the specified patient.
 */
export const importIntervention = async (patientId) => {
  let jsonString = '';
  const plugins = await getTauriPlugins();

  if (plugins) {
    try {
      const filePath = await plugins.dialog.open({
        multiple: false,
        filters: [{ name: 'JSON', extensions: ['json'] }]
      });
      if (filePath) {
        // Handle both string and array of strings (multiple: false ensures string if any)
        const path = Array.isArray(filePath) ? filePath[0] : filePath;
        jsonString = await plugins.fs.readTextFile(path);
      }
    } catch (e) {
      console.error('Tauri import failed:', e);
    }
  } else {
    // Web fallback
    jsonString = await new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
          const text = await file.text();
          resolve(text);
        } else {
          resolve('');
        }
      };
      input.click();
    });
  }

  if (!jsonString) return null;

  try {
    const bundle = JSON.parse(jsonString);
    const { intervention, phases, microcycles, sessions } = bundle;
    
    // ID Mapping to prevent collisions
    const idMap = {};
    const getNewId = (oldId) => {
      if (!idMap[oldId]) idMap[oldId] = uuidv4();
      return idMap[oldId];
    };

    const newInterventionId = getNewId(intervention.id);
    const newIntervention = {
      ...intervention,
      id: newInterventionId,
      patientId: patientId || intervention.patientId, // Default to provided patientId
      phaseIds: (intervention.phaseIds || []).map(getNewId)
    };

    const newPhases = {};
    Object.entries(phases || {}).forEach(([oldId, phase]) => {
      newPhases[getNewId(oldId)] = {
        ...phase,
        id: getNewId(oldId),
        microcycleIds: (phase.microcycleIds || []).map(getNewId)
      };
    });

    const newMicrocycles = {};
    Object.entries(microcycles || {}).forEach(([oldId, micro]) => {
      newMicrocycles[getNewId(oldId)] = {
        ...micro,
        id: getNewId(oldId),
        sessionIds: (micro.sessionIds || []).map(getNewId)
      };
    });

    const newSessions = {};
    Object.entries(sessions || {}).forEach(([oldId, session]) => {
      const newSessId = getNewId(oldId);
      
      // Re-map internal exercise IDs
      const newExercises = {};
      Object.entries(session.exercises || {}).forEach(([oldExId, exercise]) => {
        const newExId = uuidv4();
        newExercises[newExId] = { ...exercise, id: newExId };
      });

      newSessions[newSessId] = {
        ...session,
        id: newSessId,
        interventionId: newInterventionId,
        exercises: newExercises
      };
    });

    // Bulk injection into store
    useInterventionStore.setState((s) => ({
      interventions: { ...s.interventions, [newInterventionId]: newIntervention },
      phases: { ...s.phases, ...newPhases },
      microcycles: { ...s.microcycles, ...newMicrocycles },
      sessions: { ...s.sessions, ...newSessions },
    }));

    return newInterventionId;
  } catch (e) {
    console.error('Invalid intervention bundle format:', e);
    return null;
  }
};
