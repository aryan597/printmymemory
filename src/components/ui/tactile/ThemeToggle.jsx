import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

/** Tactile theme toggle — light/paper ⇄ dark. */
export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      className={`tb-btn tb-btn--secondary tb-press !px-3 !py-2 ${className}`}
    >
      {isDark ? <Sun size={15} /> : <Moon size={15} />}
      <span className="text-xs">{isDark ? 'Light' : 'Dark'}</span>
    </button>
  );
}
