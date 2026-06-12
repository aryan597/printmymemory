import { forwardRef } from 'react';

const variants = {
  primary: 'bg-white text-black hover:bg-neutral-200',
  secondary: 'bg-transparent text-white border border-border-subtle hover:border-text-secondary hover:bg-surface-hover',
  ghost: 'bg-transparent text-text-secondary hover:text-white',
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
        inline-flex items-center justify-center rounded-lg transition-all duration-200
        ${variants[variant]}
        ${sizes[size]}
        ${disabled ? 'opacity-40 cursor-not-allowed hover:transform-none' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
});

export default IconButton;
