import { forwardRef } from 'react';

const variants = {
  primary: 'bg-gradient-to-r from-accent to-amber-500 text-white shadow-lg shadow-accent/25 hover:shadow-accent/40 hover:-translate-y-0.5 border border-white/10',
  secondary: 'bg-glass-strong text-text-primary border border-glass-border hover:border-glass-border-strong hover:bg-white/[0.12] hover:-translate-y-0.5',
  outline: 'bg-transparent text-text-primary border border-glass-border hover:border-glass-border-strong hover:bg-glass hover:-translate-y-0.5',
  ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-glass border border-transparent',
  danger: 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 hover:-translate-y-0.5',
};

const sizes = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
};

const Button = forwardRef(function Button(
  { children, variant = 'primary', size = 'md', className = '', disabled = false, type = 'button', asChild, ...props },
  ref
) {
  const classes = `
    btn-pill
    ${variants[variant]}
    ${sizes[size]}
    ${disabled ? 'opacity-50 cursor-not-allowed hover:transform-none hover:shadow-none' : ''}
    ${className}
  `;

  if (asChild) {
    const child = children;
    if (!child || typeof child !== 'object') return null;
    return (
      <child.type
        ref={ref}
        {...child.props}
        {...props}
        className={`${classes} ${child.props.className || ''}`}
      >
        {child.props.children}
      </child.type>
    );
  }

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      className={classes}
      {...props}
    >
      {children}
    </button>
  );
});

export default Button;
