import { forwardRef } from 'react';

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'inline-flex items-center justify-center gap-2 text-text-secondary hover:text-white text-sm font-medium transition-colors',
  outline: 'inline-flex items-center justify-center gap-2 bg-transparent text-white border border-border-subtle hover:border-white px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 active:scale-[0.98]',
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
    ${variants[variant]}
    ${variant === 'primary' || variant === 'secondary' || variant === 'outline' ? sizes[size] : ''}
    ${disabled ? 'opacity-40 cursor-not-allowed hover:transform-none' : ''}
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
