import React from 'react';

const ExerciseDataDisplay = ({ fields, values }) => {
  if (!fields || !values) return null;

  // Extract values based on field subtypes
  let sets = null;
  let intensityType = null;
  let tags = [];
  const otherFields = [];

  // Arrays to hold split variant values
  let repsArray = [];
  let durationArray = [];
  let intensityArray = [];

  // Parse fields
  fields.forEach(field => {
    const val = values[field.name];
    if (val === undefined || val === null || val === '') return;

    switch (field.subtype) {
      case 'sets':
        sets = parseInt(val, 10);
        break;
      case 'reps_variant':
      case 'reps':
        repsArray = String(val).split(';').map(s => s.trim()).filter(Boolean);
        break;
      case 'duration_variant':
      case 'duration':
        durationArray = String(val).split(';').map(s => s.trim()).filter(Boolean);
        break;
      case 'intensity_string':
      case 'intensity_variant':
      case 'intensity':
        intensityArray = String(val).split(';').map(s => s.trim()).filter(Boolean);
        break;
      case 'intensity_type':
        intensityType = val;
        break;
      case 'tags':
        tags = String(val).split(';').map(s => s.trim().replace(/[#]/g, '')).filter(Boolean);
        break;
      default:
        otherFields.push({ label: field.label, value: val, id: field.id });
        break;
    }
  });

  // Calculate displaySetsCount
  const maxVariantLength = Math.max(repsArray.length, durationArray.length, intensityArray.length);
  const displaySetsCount = sets || (maxVariantLength > 0 ? maxVariantLength : 0);

  // Construct displaySets
  const displaySets = Array.from({ length: displaySetsCount }).map((_, i) => ({
    rep: repsArray[i] || repsArray[repsArray.length - 1] || null,
    duration: durationArray[i] || durationArray[durationArray.length - 1] || null,
    intensity: intensityArray[i] || intensityArray[intensityArray.length - 1] || null,
  }));

  // Determine if homogeneous
  const isHomogeneous = displaySets.every((set, _, arr) => 
    set.rep === arr[0].rep && 
    set.duration === arr[0].duration && 
    set.intensity === arr[0].intensity
  );

  // Render helpers
  const renderWork = (set) => {
    const parts = [];
    if (set.rep) parts.push(`${set.rep} Reps`);
    if (set.duration) parts.push(`${set.duration}`);
    if (set.intensity) parts.push(`@ ${set.intensity}${intensityType ? ' ' + intensityType : ''}`);
    return parts.join(' ');
  };

  const hasSetsData = displaySetsCount > 0;

  return (
    <div className="flex flex-col gap-1 w-full">
      {/* Sets Display */}
      {hasSetsData && (
        <div className="flex flex-wrap gap-1">
          {isHomogeneous ? (
            <div className="px-2 py-0.5 bg-zinc-800 text-zinc-300 text-[10px] font-medium rounded border border-zinc-700">
              {displaySetsCount} {displaySetsCount === 1 ? 'Set' : 'Sets'}{renderWork(displaySets[0]) ? ` × ${renderWork(displaySets[0])}` : ''}
            </div>
          ) : (
            displaySets.map((set, i) => (
              <div key={i} className="px-2 py-0.5 bg-zinc-800 text-zinc-300 text-[10px] font-medium rounded border border-zinc-700">
                <span className="text-zinc-500 mr-1">S{i + 1}:</span>
                {renderWork(set) || 'No metrics'}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tags Display */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-0.5">
          {tags.map((tag, i) => (
            <div key={i} className="px-1.5 py-0.5 bg-emerald-900/20 text-emerald-400 text-[10px] font-semibold rounded border border-emerald-800/30">
              {tag}
            </div>
          ))}
        </div>
      )}

      {/* Other Fields Display */}
      {otherFields.length > 0 && (
        <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
          {otherFields.map(field => (
            <div key={field.id} className="flex items-center gap-1">
              <span className="text-[10px] text-zinc-400">{field.label}:</span>
              <span className="text-[10px] font-medium text-zinc-500">{field.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExerciseDataDisplay;
