import { forwardRef } from 'react';

/**
 * Tactile-brutalist button. Hard offset shadow that collapses on press.
 * variant: primary | secondary | wa (whatsapp) | ghost
 * Renders a <button> by default, or `as` (e.g. 'a', Link) via the `as` prop.
 */
const VARIANT_CLASS = {
  primary: 'tb-btn tb-btn--primary tb-press',
  secondary: 'tb-btn tb-btn--secondary tb-press',
  wa: 'tb-btn tb-btn--wa tb-press',
  ghost: 'tb-btn tb-btn--ghost',
};

const TactileButton = forwardRef(function TactileButton(
  { as: Comp = 'button', variant = 'primary', className = '', children, ...props },
  ref
) {
  return (
    <Comp ref={ref} className={`${VARIANT_CLASS[variant] || VARIANT_CLASS.primary} ${className}`} {...props}>
      {children}
    </Comp>
  );
});

export default TactileButton;
