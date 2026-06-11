import { forwardRef } from 'react';

const variants = {
  primary: 'bg-gradient-to-br from-accent to-amber-500 text-white shadow-lg shadow-accent/20 hover:shadow-accent/35 hover:-translate-y-0.5 border border-white/10',
  secondary: 'bg-glass-strong text-text-primary border border-glass-border hover:border-glass-border-strong hover:bg-white/[0.12] hover:-translate-y-0.5',
  ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-glass',
  danger: 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20',
};

const sizes = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
};

const IconButton = forwardRef(function IconButton(
  { children, variant = 'secondary', size = 'md', className = '', disabled = false, type = 'button', ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center rounded-full transition-all duration-200
        ${variants[variant]}
        ${sizes[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed hover:transform-none hover:shadow-none' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
});

export default IconButton;
