import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, ChevronDown, Check, Loader2 } from 'lucide-react';
import { supabase, TABLES } from '../lib/supabaseClient';
import AMSColorPicker from './AMSColorPicker';
import toast from 'react-hot-toast';

const FIELD_COMPONENTS = {
  photo_upload: PhotoUploadField,
  text: TextField,
  textarea: TextareaField,
  select: SelectField,
  color_picker: ColorPickerField,
  ams_color: AMSColorField,
  number: NumberField,
  checkbox: CheckboxField,
  radio: RadioField,
};

function PhotoUploadField({ field, value, onChange }) {
  const [preview, setPreview] = useState(value || null);
  const MAX_FILE_SIZE_MB = 10;

  const handleFile = (file) => {
    if (!file) return;
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast.error(`File too large. Max ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      onChange(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <label className="text-text-secondary text-sm font-medium">{field.field_label}{field.is_required && <span className="text-error">*</span>}</label>
      <div className={`border-2 border-dashed rounded-2xl p-6 text-center transition-colors ${preview ? 'border-white bg-bg-card' : 'border-border-subtle hover:border-border-hover'}`}>
        {preview ? (
          <div className="flex flex-col items-center">
            <img src={preview} alt="Preview" className="w-40 h-40 object-cover rounded-xl mb-3 border border-border-subtle" />
            <button type="button" onClick={() => { setPreview(null); onChange(null); }} className="text-text-muted hover:text-white text-sm transition-colors">
              Remove & Upload Another
            </button>
          </div>
        ) : (
          <label className="cursor-pointer flex flex-col items-center" aria-label="Upload your photo">
            <div className="w-14 h-14 card rounded-2xl flex items-center justify-center mb-3">
              <Upload size={24} className="text-white" aria-hidden="true" />
            </div>
            <p className="text-white font-medium text-sm mb-1">Click to upload photo</p>
            <p className="text-text-muted text-xs">JPG, PNG up to {MAX_FILE_SIZE_MB}MB</p>
            <input type="file" accept="image/*" onChange={(e) => handleFile(e.target.files?.[0])} className="hidden" aria-label="Upload your photo" />
          </label>
        )}
      </div>
    </div>
  );
}

function TextField({ field, value, onChange }) {
  return (
    <div className="space-y-2">
      <label className="text-text-secondary text-sm font-medium">{field.field_label}{field.is_required && <span className="text-error">*</span>}</label>
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.field_placeholder || ''}
        className="input"
        aria-required={field.is_required}
      />
    </div>
  );
}

function TextareaField({ field, value, onChange }) {
  return (
    <div className="space-y-2">
      <label className="text-text-secondary text-sm font-medium">{field.field_label}{field.is_required && <span className="text-error">*</span>}</label>
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.field_placeholder || ''}
        rows={3}
        className="input resize-none"
        aria-required={field.is_required}
      />
    </div>
  );
}

function SelectField({ field, value, onChange }) {
  const options = field.options || [];
  return (
    <div className="space-y-2">
      <label className="text-text-secondary text-sm font-medium">{field.field_label}{field.is_required && <span className="text-error">*</span>}</label>
      <div className="relative">
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="input appearance-none cursor-pointer"
          aria-required={field.is_required}
        >
          <option value="">Select an option</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}{opt.price_adjustment > 0 ? ` (+₹${opt.price_adjustment})` : ''}
            </option>
          ))}
        </select>
        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" aria-hidden="true" />
      </div>
    </div>
  );
}

function ColorPickerField({ field, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const colors = ['#1a1a1a', '#f5f5f5', '#dc2626', '#2563eb', '#16a34a', '#eab308', '#f97316', '#7c3aed', '#ec4899', '#06b6d4', '#84cc16', '#14b8a6'];

  return (
    <div className="space-y-2">
      <label className="text-text-secondary text-sm font-medium">{field.field_label}{field.is_required && <span className="text-error">*</span>}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="input flex items-center gap-3 text-left"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          {value ? (
            <>
              <span className="w-6 h-6 rounded-full border border-border-subtle" style={{ backgroundColor: value }} aria-hidden="true" />
              <span className="text-text-primary">{value}</span>
            </>
          ) : (
            <span className="text-text-muted">Pick a color</span>
          )}
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-50 mt-2 p-3 bg-bg-card border border-border-subtle rounded-xl grid grid-cols-6 gap-2"
              role="listbox"
              aria-label="Color options"
            >
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => { onChange(c); setIsOpen(false); }}
                  className="w-8 h-8 rounded-full border-2 transition-all hover:scale-110"
                  style={{
                    backgroundColor: c,
                    borderColor: value === c ? '#f8fafc' : 'transparent',
                  }}
                  aria-label={`Select color ${c}`}
                  aria-selected={value === c}
                  role="option"
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function AMSColorField({ field, value, onChange }) {
  return (
    <div className="space-y-2">
      <label className="text-text-secondary text-sm font-medium">{field.field_label}{field.is_required && <span className="text-error">*</span>}</label>
      <AMSColorPicker selectedColor={value} onSelect={onChange} />
    </div>
  );
}

function NumberField({ field, value, onChange }) {
  return (
    <div className="space-y-2">
      <label className="text-text-secondary text-sm font-medium">{field.field_label}{field.is_required && <span className="text-error">*</span>}</label>
      <input
        type="number"
        value={value || ''}
        onChange={(e) => onChange(Number(e.target.value))}
        placeholder={field.field_placeholder || ''}
        className="input"
        aria-required={field.is_required}
      />
    </div>
  );
}

function CheckboxField({ field, value, onChange }) {
  const options = field.options || [];
  const selected = value || [];

  const toggle = (val) => {
    if (selected.includes(val)) {
      onChange(selected.filter((v) => v !== val));
    } else {
      onChange([...selected, val]);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-text-secondary text-sm font-medium">{field.field_label}{field.is_required && <span className="text-error">*</span>}</label>
      <div className="flex flex-wrap gap-2" role="group" aria-label={field.field_label}>
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selected.includes(opt.value)
                ? 'bg-gradient-brand text-white shadow-glow'
                : 'bg-bg-primary border border-border-subtle text-text-secondary hover:border-border-hover'
            }`}
            aria-pressed={selected.includes(opt.value)}
          >
            {opt.label}{opt.price_adjustment > 0 ? ` +₹${opt.price_adjustment}` : ''}
          </button>
        ))}
      </div>
    </div>
  );
}

function RadioField({ field, value, onChange }) {
  const options = field.options || [];
  return (
    <div className="space-y-2">
      <label className="text-text-secondary text-sm font-medium">{field.field_label}{field.is_required && <span className="text-error">*</span>}</label>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={field.field_label}>
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              value === opt.value
                ? 'bg-gradient-brand text-white shadow-glow'
                : 'bg-bg-primary border border-border-subtle text-text-secondary hover:border-border-hover'
            }`}
            aria-checked={value === opt.value}
            role="radio"
          >
            {opt.label}{opt.price_adjustment > 0 ? ` +₹${opt.price_adjustment}` : ''}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function CustomizationForm({ productId, onSubmit, onPriceChange }) {
  const [configs, setConfigs] = useState([]);
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [basePrice, setBasePrice] = useState(0);

  // Load config on mount
  useEffect(() => {
    let cancelled = false;
    async function loadConfig() {
      setLoading(true);
      try {
        const { data: product } = await supabase
          .from(TABLES.PRODUCTS)
          .select('price')
          .eq('id', productId)
          .single();
        if (!cancelled) setBasePrice(product?.price || 0);

        const { data, error } = await supabase
          .from('product_customization_configs')
          .select('*')
          .eq('product_id', productId)
          .order('sort_order', { ascending: true });

        if (!cancelled) {
          if (error) throw error;
          setConfigs(data || []);
        }
      } catch (err) {
        console.error('Failed to load customization config:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadConfig();
    return () => { cancelled = true; };
  }, [productId]);

  // Calculate price when values change
  const calculatePrice = useCallback(() => {
    let total = basePrice;
    configs.forEach((config) => {
      const val = values[config.field_key];
      if (!val) return;

      if (config.field_type === 'select' || config.field_type === 'radio') {
        const option = (config.options || []).find((o) => o.value === val);
        if (option?.price_adjustment) total += option.price_adjustment;
      } else if (config.field_type === 'checkbox') {
        (val || []).forEach((v) => {
          const option = (config.options || []).find((o) => o.value === v);
          if (option?.price_adjustment) total += option.price_adjustment;
        });
      } else if (config.price_adjustment) {
        total += config.price_adjustment;
      }
    });
    return total;
  }, [values, configs, basePrice]);

  useEffect(() => {
    const total = calculatePrice();
    onPriceChange?.(total);
  }, [calculatePrice, onPriceChange]);

  const handleChange = (fieldKey, value) => {
    setValues((prev) => ({ ...prev, [fieldKey]: value }));
  };

  const validate = () => {
    for (const config of configs) {
      if (config.is_required) {
        const val = values[config.field_key];
        if (!val || (Array.isArray(val) && val.length === 0)) {
          toast.error(`${config.field_label} is required`);
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit?.(values);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10" role="status" aria-label="Loading customization options">
        <Loader2 size={28} className="animate-spin text-accent" aria-hidden="true" />
      </div>
    );
  }

  if (configs.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-text-muted text-sm">No customization options available for this product.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {configs.map((config, index) => {
        const Component = FIELD_COMPONENTS[config.field_type];
        if (!Component) return null;
        return (
          <motion.div
            key={config.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Component
              field={config}
              value={values[config.field_key]}
              onChange={(val) => handleChange(config.field_key, val)}
            />
          </motion.div>
        );
      })}

      <div className="pt-4 border-t border-border-subtle">
        <div className="flex items-center justify-between mb-4">
          <span className="text-text-secondary text-sm">Base Price</span>
          <span className="text-text-primary">₹{basePrice.toLocaleString('en-IN')}</span>
        </div>
        {configs.map((config) => {
          const val = values[config.field_key];
          if (!val) return null;
          let extra = 0;
          let label = '';

          if (config.field_type === 'select' || config.field_type === 'radio') {
            const option = (config.options || []).find((o) => o.value === val);
            if (option?.price_adjustment) {
              extra = option.price_adjustment;
              label = option.label;
            }
          } else if (config.field_type === 'checkbox') {
            (val || []).forEach((v) => {
              const option = (config.options || []).find((o) => o.value === v);
              if (option?.price_adjustment) {
                extra += option.price_adjustment;
                label = label ? `${label}, ${option.label}` : option.label;
              }
            });
          } else if (config.price_adjustment) {
            extra = config.price_adjustment;
            label = config.field_label;
          }

          if (extra === 0) return null;
          return (
            <div key={config.id} className="flex items-center justify-between mb-2">
              <span className="text-text-muted text-xs">{label}</span>
              <span className="text-accent text-xs">+₹{extra.toLocaleString('en-IN')}</span>
            </div>
          );
        })}
        <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
          <span className="text-white font-semibold">Total</span>
          <span className="text-white font-bold text-xl">
            ₹{(basePrice + configs.reduce((sum, config) => {
              const val = values[config.field_key];
              if (!val) return sum;
              let extra = 0;
              if (config.field_type === 'select' || config.field_type === 'radio') {
                const option = (config.options || []).find((o) => o.value === val);
                extra = option?.price_adjustment || 0;
              } else if (config.field_type === 'checkbox') {
                (val || []).forEach((v) => {
                  const option = (config.options || []).find((o) => o.value === v);
                  extra += option?.price_adjustment || 0;
                });
              } else {
                extra = config.price_adjustment || 0;
              }
              return sum + extra;
            }, 0)).toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="w-full btn-primary btn-gradient-shimmer py-3 rounded-xl font-semibold"
        aria-label="Confirm customizations"
      >
        <Check size={18} aria-hidden="true" /> Confirm Customizations
      </button>
    </div>
  );
}
