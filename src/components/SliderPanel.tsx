import { OptimalBadge } from './OptimalBadge';
import type { Activity } from '../model/optimizer';

interface SliderPanelProps {
  values: { effort: number; sleep: number; leisure: number };
  optimals: { effort: number; sleep: number; leisure: number };
  onChange: (activity: Activity, hours: number) => void;
  onReset: () => void;
}

const ACTIVITIES: { key: Activity; label: string; color: string }[] = [
  { key: 'effort', label: 'Effort', color: 'accent-blue-500' },
  { key: 'sleep', label: 'Sleep', color: 'accent-indigo-500' },
  { key: 'leisure', label: 'Leisure', color: 'accent-amber-500' },
];

export function SliderPanel({ values, optimals, onChange, onReset }: SliderPanelProps) {
  return (
    <div className="bg-slate-900 rounded-2xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-100">Hours Allocation</h2>
        <button
          onClick={onReset}
          className="text-xs text-emerald-400 hover:text-emerald-300 border border-emerald-400/30 hover:border-emerald-400/60 px-3 py-1 rounded-full transition-colors"
        >
          Reset to Optimal
        </button>
      </div>

      {ACTIVITIES.map(({ key, label, color }) => (
        <div key={key} className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-300">{label}</label>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono text-slate-100 tabular-nums">
                {values[key].toFixed(1)}h
              </span>
              <OptimalBadge label="Optimal" value={optimals[key]} />
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={24}
            step={0.1}
            value={values[key]}
            onChange={(e) => onChange(key, parseFloat(e.target.value))}
            className={`w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer ${color}`}
          />
        </div>
      ))}

      <div className="text-xs text-slate-500 text-center pt-2 border-t border-slate-800">
        Total: {(values.effort + values.sleep + values.leisure).toFixed(1)}h / 24h
      </div>
    </div>
  );
}
