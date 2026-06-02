interface FilterGroupProps {
  label: string;
  children: React.ReactNode;
}

export function FilterGroup({ label, children }: FilterGroupProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="text-[10px] uppercase tracking-wider font-semibold text-text-muted">
        {label}
      </div>
      <div>{children}</div>
    </div>
  );
}
