/**
 * Tactile-brutalist primitive components. Thin wrappers over the .tb-* classes
 * in index.css so pages compose consistently. See docs/ui-revamp-prd.md.
 */

export function SpecimenCard({ className = '', pressable = false, children, ...props }) {
  return (
    <div className={`tb-card ${pressable ? 'tb-press' : 'tb-shadow'} ${className}`} {...props}>
      {children}
    </div>
  );
}

export function StickerBadge({ tone = 'default', className = '', children, ...props }) {
  const toneClass = tone === 'orange' ? 'tb-sticker--orange' : tone === 'ink' ? 'tb-sticker--ink' : '';
  return (
    <span className={`tb-sticker ${toneClass} ${className}`} {...props}>
      {children}
    </span>
  );
}

export function SpecChip({ className = '', children, ...props }) {
  return (
    <span className={`tb-chip ${className}`} {...props}>
      {children}
    </span>
  );
}

export function Tag({ className = '', children, ...props }) {
  return (
    <span className={`tb-tag ${className}`} {...props}>
      {children}
    </span>
  );
}

export function TactileInput({ className = '', ...props }) {
  return <input className={`tb-input ${className}`} {...props} />;
}
