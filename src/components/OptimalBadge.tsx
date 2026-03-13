interface OptimalBadgeProps {
  label: string;
  value: number;
}

export function OptimalBadge({ label, value }: OptimalBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1 text-xs bg-emerald-400/15 text-emerald-400 px-2 py-0.5 rounded-full">
      {label}: {value.toFixed(1)}h
    </span>
  );
}
