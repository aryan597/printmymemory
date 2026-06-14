// AMSColorPicker doesn't use React state directly - colors are passed as props
// eslint-disable-next-line no-unused-vars
import { useState } from 'react';

const AMS_COLORS = [
  { name: 'Black', hex: '#1a1a1a' },
  { name: 'White', hex: '#f5f5f5' },
  { name: 'Red', hex: '#dc2626' },
  { name: 'Blue', hex: '#2563eb' },
  { name: 'Green', hex: '#16a34a' },
  { name: 'Yellow', hex: '#eab308' },
  { name: 'Orange', hex: '#f97316' },
  { name: 'Purple', hex: '#7c3aed' },
  { name: 'Pink', hex: '#ec4899' },
  { name: 'Cyan', hex: '#06b6d4' },
  { name: 'Lime', hex: '#84cc16' },
  { name: 'Teal', hex: '#14b8a6' },
  { name: 'Indigo', hex: '#4f46e5' },
  { name: 'Magenta', hex: '#d946ef' },
  { name: 'Gold', hex: '#ca8a04' },
  { name: 'Silver', hex: '#9ca3af' },
];

export default function AMSColorPicker({ selectedColor, onSelect, label, size = 'md' }) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  return (
    <div className="space-y-2">
      {label && <p className="text-text-secondary text-sm font-medium">{label}</p>}
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Choose AMS color">
        {AMS_COLORS.map((color) => (
          <button
            key={color.hex}
            type="button"
            onClick={() => onSelect(color.hex)}
            className={`${sizeClasses[size]} rounded-full border-2 transition-all duration-200 relative`}
            style={{
              backgroundColor: color.hex,
              borderColor: selectedColor === color.hex ? '#f8fafc' : 'transparent',
              transform: selectedColor === color.hex ? 'scale(1.15)' : 'scale(1)',
              boxShadow: selectedColor === color.hex ? `0 0 12px ${color.hex}80` : 'none',
            }}
            title={color.name}
            aria-label={`Select ${color.name}`}
            aria-checked={selectedColor === color.hex}
            role="radio"
          >
            {selectedColor === color.hex && (
              <span className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color.hex === '#f5f5f5' ? '#1a1a1a' : '#ffffff'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export { AMS_COLORS };
