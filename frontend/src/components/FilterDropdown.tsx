import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export type FilterOption = { label: string; value: string };

type Props = {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
};

export function FilterDropdown({ label, value, options, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = options.find((o) => o.value === value) ?? options[0];

  return (
    <div ref={ref} className="relative flex flex-col gap-1 text-left">
      <span className="text-xs font-bold text-[#c4b5fd] uppercase tracking-wide">{label}</span>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 rounded-xl border-2 border-[#2d3561] bg-white/90 px-3 py-2 text-[#2d3561] font-sans focus-visible:ring-2 focus-visible:ring-[#7ec8a3] transition-shadow"
      >
        <span className="truncate text-left">{selected?.label ?? '—'}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>
      <div
        className={`absolute left-0 right-0 top-full z-30 mt-1 origin-top overflow-hidden rounded-xl border-2 border-[#5a4f99] bg-[#1e2448] shadow-2xl transition-all duration-200 ease-out ${
          open
            ? 'max-h-60 opacity-100 translate-y-0'
            : 'max-h-0 opacity-0 -translate-y-1 pointer-events-none'
        }`}
      >
        <ul className="max-h-60 overflow-y-auto py-1">
          {options.map((opt) => {
            const active = opt.value === value;
            return (
              <li key={opt.value || '__all__'}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-2 px-3 py-2.5 text-sm font-sans transition-colors hover:bg-white/10 ${
                    active ? 'text-[#7ec8a3] font-bold' : 'text-[#e0e7ff]'
                  }`}
                >
                  <span className="text-left">{opt.label}</span>
                  {active && <Check className="h-4 w-4 shrink-0" aria-hidden />}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
