import React from "react";
import { FiCheck } from "react-icons/fi";
import { HiOutlineUserCircle, HiOutlineRectangleStack, HiOutlineCalendar } from "react-icons/hi2";
import { motion } from "motion/react";

// ─── Intervention Workflow Placeholder ────────────────────────────────────────
// A minimal 3-step infographic shown whenever the user hasn't completed the
// full selection flow: patient → intervention → session.
//
// Props:
//   activeStep  0 = need patient, 1 = need intervention, 2 = need session

const STEPS = [
  {
    key: 'patient',
    icon: HiOutlineUserCircle,
    label: 'Select a Patient',
    description: 'Pick a patient from the Patients sidebar to get started.',
    color: 'blue',
  },
  {
    key: 'intervention',
    icon: HiOutlineRectangleStack,
    label: 'Select an Intervention',
    description: 'Choose an existing intervention or create a new one for this patient.',
    color: 'violet',
  },
  {
    key: 'session',
    icon: HiOutlineCalendar,
    label: 'Create your first Session',
    description: 'Add sessions inside your intervention to start logging exercises.',
    color: 'emerald',
  },
];

const colorMap = {
  blue:    { ring: 'ring-blue-500/40',    bg: 'bg-blue-500/10',    icon: 'text-blue-400',    dot: 'bg-blue-500',    label: 'text-blue-300',    line: 'bg-blue-500/30'   },
  violet:  { ring: 'ring-violet-500/40',  bg: 'bg-violet-500/10',  icon: 'text-violet-400',  dot: 'bg-violet-500',  label: 'text-violet-300',  line: 'bg-violet-500/30' },
  emerald: { ring: 'ring-emerald-500/40', bg: 'bg-emerald-500/10', icon: 'text-emerald-400', dot: 'bg-emerald-500', label: 'text-emerald-300', line: 'bg-emerald-500/30' },
};

function InterventionWorkflowPlaceholder({ activeStep }) {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-zinc-900 select-none px-8">
      {/* Title */}
      <div className="mb-10 text-center space-y-1">
        <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-600 font-semibold">Intervention Workflow</p>
        <h2 className="text-zinc-300 text-lg font-light">Get started in 3 steps</h2>
      </div>

      {/* Steps */}
      <div className="flex flex-col items-center gap-0 w-full max-w-xs">
        {STEPS.map((step, idx) => {
          const c = colorMap[step.color];
          const isDone   = idx < activeStep;
          const isActive = idx === activeStep;
          const Icon = step.icon;

          return (
            <React.Fragment key={step.key}>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.12, duration: 0.4, ease: 'easeOut' }}
                className={`
                  relative flex items-center gap-4 w-full rounded-xl px-4 py-3.5
                  border transition-all duration-300
                  ${isActive
                    ? `${c.bg} border-transparent ring-1 ${c.ring} shadow-lg shadow-black/30`
                    : isDone
                      ? 'bg-zinc-800/30 border-zinc-700/30'
                      : 'bg-transparent border-transparent opacity-35'
                  }
                `}
              >
                {/* Icon bubble */}
                <div className={`
                  flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                  ring-1 transition-all duration-300
                  ${isActive ? `${c.bg} ${c.ring}` : isDone ? 'bg-zinc-700/60 ring-zinc-700' : 'bg-zinc-800/40 ring-zinc-800'}
                `}>
                  {isDone ? (
                    <FiCheck size={16} className="text-zinc-400" />
                  ) : (
                    <Icon size={18} className={isActive ? c.icon : 'text-zinc-600'} />
                  )}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium leading-snug transition-colors duration-300 ${isActive ? c.label : isDone ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    {step.label}
                  </p>
                  {isActive && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-[11px] text-zinc-500 leading-relaxed mt-0.5"
                    >
                      {step.description}
                    </motion.p>
                  )}
                </div>

                {/* Active pulse dot */}
                {isActive && (
                  <span className="flex-shrink-0 relative flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${c.dot} opacity-50`} />
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${c.dot}`} />
                  </span>
                )}

                {/* Done checkmark */}
                {isDone && (
                  <span className="flex-shrink-0 text-[9px] font-bold text-zinc-600 font-mono">✓</span>
                )}
              </motion.div>

              {/* Connector line */}
              {idx < STEPS.length - 1 && (
                <div className={`w-px h-5 transition-all duration-500 ${idx < activeStep ? c.line : 'bg-zinc-800'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Bottom hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-10 text-[10px] text-zinc-700 text-center max-w-[220px] leading-relaxed"
      >
        Use the sidebar on the left to complete the highlighted step.
      </motion.p>
    </div>
  );
}

export default InterventionWorkflowPlaceholder;
