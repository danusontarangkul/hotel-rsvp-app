const LEGEND = [
  { label: 'Available', swatch: 'border border-border bg-surface' },
  { label: 'Unavailable', swatch: 'border border-muted/50 bg-surface-muted' },
  { label: 'Selected', swatch: 'bg-primary' },
];

export default function CalendarLegend() {
  return (
    <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted">
      {LEGEND.map(({ label, swatch }) => (
        <li key={label} className="flex items-center gap-1.5">
          <span className={`size-3 rounded-sm ${swatch}`} />
          {label}
        </li>
      ))}
    </ul>
  );
}
