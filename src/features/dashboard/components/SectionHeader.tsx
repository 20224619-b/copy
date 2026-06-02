interface SectionHeaderProps {
  title: string;
  right?: React.ReactNode;
}

export function SectionHeader({ title, right }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-2.5">
      <h2 className="font-display text-sm font-bold uppercase tracking-wider text-text-primary m-0">
        {title}
      </h2>
      {right && <div className="flex items-center gap-3">{right}</div>}
    </div>
  );
}
