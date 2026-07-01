const items = [
  '3D Face Miniatures',
  'Lithophane Lamps',
  'Custom Keychains',
  'Name Plates',
  'Couple Gifts',
  'Corporate Gifts',
  'Desk Decor',
  'Pet Portraits',
  'Baby Gifts',
  'Anniversary Gifts',
];

export default function MarqueeTicker() {
  const doubled = [...items, ...items]; // double for seamless loop

  return (
    <div
      className="py-4 bg-bg-secondary border-y border-border-subtle overflow-hidden"
      aria-hidden="true"
    >
      <div className="flex animate-marquee whitespace-nowrap" style={{ width: 'max-content' }}>
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-3 mx-6">
            <span className="w-1 h-1 rounded-full bg-accent inline-block" />
            <span className="text-[12px] font-semibold uppercase tracking-widest text-text-muted">
              {item}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
