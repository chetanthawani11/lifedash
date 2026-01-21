'use client';

/**
 * APP ICON COMPONENT
 *
 * The main LifeDash icon - upward trending chart representing
 * life progress, growth, and discipline.
 * Used in header, landing page, and other branding locations.
 */

interface AppIconProps {
  size?: number;
  color?: string;
  className?: string;
}

export const AppIcon: React.FC<AppIconProps> = ({
  size = 24,
  color = 'currentColor',
  className,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Upward trending line */}
      <path
        d="M3 20L9 14L13 18L21 8"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Arrow head */}
      <path
        d="M17 8H21V12"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default AppIcon;
