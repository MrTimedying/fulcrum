import React, { useMemo } from 'react';
import { useInterventionStore } from "../../state/core/useInterventionStore";
import { getExerciseContainerDisplayName } from "../../utils/exerciseUtils";
import { InlineEdit } from "./exercise_modal/InlineEdit";
import { HiOutlineCalendarDays } from "react-icons/hi2";

const MicroPanel = () => {
  const { 
    selectedStructuralNodeId, 
    microcycles, 
    sessions,
    updateMicrocycle
  } = useInterventionStore();

  const microcycle = selectedStructuralNodeId ? microcycles[selectedStructuralNodeId] : null;

  const microSessions = useMemo(() => {
    if (!microcycle || !microcycle.sessionIds) return [];
    return microcycle.sessionIds
      .map(id => sessions[id])
      .filter(Boolean)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [microcycle, sessions]);

  const metrics = useMemo(() => {
    let totalExercises = 0;
    const allTags = new Set();

    microSessions.forEach(session => {
      if (session.exercises) {
        Object.keys(session.exercises).forEach(key => {
          totalExercises++;
          const fields = session.exercises[key]?.fields || [];
          const tagField = fields.find(f => f.subtype === 'tags');
          if (tagField && tagField.value) {
            const tags = tagField.value.split(';').map(t => t.trim().replace(/^#/, '')).filter(Boolean);
            tags.forEach(t => allTags.add(t));
          }
        });
      }
    });

    return {
      totalExercises,
      uniqueTags: Array.from(allTags).slice(0, 5) // Show top 5 or just 5 unique
    };
  }, [microSessions]);

  if (!microcycle) return null;

  return (
    <div className="w-full h-full flex flex-col bg-zinc-900 text-white overflow-hidden border-l border-zinc-800">
      {/* Header */}
      <div className="bg-zinc-900 p-1 flex justify-between items-center border-b border-zinc-800 flex-shrink-0">
        <div className="flex items-center">
          <h2 className="text-gray-300 text-base font-medium ml-2 mr-4">Microcycle Overview</h2>
          <InlineEdit
            value={microcycle.name || ""}
            onSave={(newName) => updateMicrocycle(microcycle.id, { name: newName })}
            displayClassName="text-[10px] text-zinc-400 uppercase font-bold tracking-widest hover:text-zinc-300 transition-colors"
            inputClassName="text-[10px] bg-zinc-800 text-white border border-zinc-500 rounded px-1 outline-none"
          />
        </div>
        <div className="text-[9px] text-zinc-600 mr-2 font-mono">
           ID: {microcycle.id.slice(0, 8)}...
        </div>
      </div>

      {/* Metadata Section */}
      <div className="bg-zinc-900 p-3 border-b border-zinc-800 flex gap-6 text-[11px] text-zinc-400">
        <div><span className="font-bold text-zinc-300">{microSessions.length}</span> Sessions</div>
        <div><span className="font-bold text-zinc-300">{metrics.totalExercises}</span> Exercise Vectors</div>
        <div>
          Top Tags: {metrics.uniqueTags.length > 0 ? (
            metrics.uniqueTags.map(t => `#${t}`).join(', ')
          ) : (
            <span className="italic text-zinc-600">None</span>
          )}
        </div>
      </div>

      {/* Minimalistic Textual Visualizer */}
      <div className="p-6 flex-grow overflow-y-auto bg-zinc-900 font-mono text-sm text-zinc-300">
        {microSessions.length === 0 ? (
          <div className="text-zinc-600 italic">No sessions in this microcycle.</div>
        ) : (
          <div className="space-y-6 max-w-4xl">
            {microSessions.map(session => {
              const dateStr = session.date ? new Date(session.date).toLocaleDateString() : 'No date';
              const exerciseKeys = session.exercises ? Object.keys(session.exercises) : [];

              return (
                <div key={session.id} className="space-y-2">
                  <div className="flex items-center gap-2 border-b border-zinc-800 pb-1">
                    <HiOutlineCalendarDays className="text-zinc-500" />
                    <span className="font-bold text-zinc-200">{session.name}</span>
                    <span className="text-zinc-500 text-xs">- {dateStr}</span>
                  </div>
                  
                  {exerciseKeys.length === 0 ? (
                    <div className="text-zinc-600 text-xs pl-6">No exercises</div>
                  ) : (
                    <ul className="list-disc pl-6 space-y-1 text-zinc-400 text-xs">
                      {exerciseKeys.map(key => {
                        const name = getExerciseContainerDisplayName(key);
                        const fields = session.exercises[key]?.fields || [];
                        let sets = '-', reps = '-', intensity = '-';
                        fields.forEach(f => {
                          if (f.subtype === 'sets') sets = f.value || '-';
                          if (f.subtype === 'reps_constant' || f.subtype === 'reps_variant') reps = f.value || '-';
                          if (f.subtype === 'intensity_number' || f.subtype === 'intensity_string') intensity = f.value || '-';
                        });

                        return (
                          <li key={key}>
                            <span className="text-zinc-300">{name}</span>
                            <span className="text-zinc-500 ml-2">
                              (Sets: {sets}, Reps: {reps}, Int: {intensity})
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MicroPanel;
