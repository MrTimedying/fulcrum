import { useInterventionStore } from '../state/core/useInterventionStore';
import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash';

/**
 * Generates a full mock intervention with Phases, Microcycles, Sessions, and Exercises.
 * Directly populates the store for the given patientId.
 */
export const generateDummyIntervention = (patientId, config = { phases: 2, micros: 3, sessions: 4 }) => {
  if (!patientId) {
    console.warn("Generating dummy intervention without a patientId context.");
  }

  const store = useInterventionStore.getState();
  const timestamp = new Date().toLocaleTimeString();
  
  // 1. Create Intervention
  const interventionName = `Generated Plan ${timestamp}`;
  const interventionId = store.addIntervention(patientId, interventionName);
  
  // 2. Generate Hierarchy
  for (let p = 1; p <= config.phases; p++) {
    const phaseId = store.addPhase(interventionId, `Phase ${p} - Base Training`);
    
    for (let m = 1; m <= config.micros; m++) {
      const microId = store.addMicrocycle(phaseId, `Week ${m} (Microcycle)`);
      
      for (let s = 1; s <= config.sessions; s++) {
        const sessionDate = new Date();
        // Stagger dates: Phase-level offset (30d), Micro-level offset (7d), Session-level (1d)
        sessionDate.setDate(sessionDate.getDate() + ((p - 1) * 30) + ((m - 1) * 7) + (s - 1));
        
        const sessionId = store.addSession(interventionId, {
          name: `Session ${s}: Morning Flow`,
          date: sessionDate.toISOString(),
          tags: { type: 'dummy', source: 'generator' }
        }, microId);
        
        // 3. Generate Mock Exercises with correct validation schemas
        const exercises = {};
        const exerciseLibrary = ['Squat', 'Push-up', 'Pull-up', 'Deadlift', 'Plank', 'Lunges', 'Shoulder Press'];
        const numExercises = _.random(3, 5);
        
        for (let e = 1; e <= numExercises; e++) {
          const exId = uuidv4();
          const sets = _.random(3, 4);
          const reps = _.random(8, 12);
          const intensity = _.random(65, 85);

          // Correct variant string generation to match validationSchema.js regex
          const reps_variant = Array(sets).fill(reps).join(';') + ';';
          const duration_variant = Array(sets).fill('0:00:00').join(';') + ';';
          const intensity_string = Array(sets).fill(intensity).join(';') + ';';
          
          exercises[exId] = {
            id: exId,
            name: `${_.sample(exerciseLibrary)} (G${e})`,
            sets: sets,
            reps: reps,
            intensity: intensity,
            duration: 0,
            // Custom fields matching UI expectations
            reps_variant,
            duration_variant,
            intensity_string,
            intensity_type: 'Percentage',
            tags: '#generated;#mock;'
          };
        }
        
        // Update session with generated exercises
        store.updateSession(sessionId, { exercises });
      }
    }
  }
  
  console.log(`Successfully generated dummy intervention ${interventionId} for patient ${patientId}`);
  return interventionId;
};
