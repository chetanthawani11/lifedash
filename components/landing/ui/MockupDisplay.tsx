'use client';

import { ReactNode, CSSProperties } from 'react';
import { motion } from 'framer-motion';

type DeviceType = 'browser' | 'laptop' | 'phone';

interface MockupDisplayProps {
  type?: DeviceType;
  src?: string;
  alt?: string;
  children?: ReactNode;
  url?: string;
  className?: string;
  style?: CSSProperties;
  animate?: boolean;
  glowColor?: string;
}

/**
 * MockupDisplay - Renders content in beautiful device frames
 *
 * @param type - Device type: 'browser', 'laptop', or 'phone'
 * @param src - Image source URL (optional if using children)
 * @param alt - Alt text for image
 * @param children - React children to render inside the frame
 * @param url - URL to display in browser address bar
 * @param animate - Whether to animate on hover
 * @param glowColor - Color for the glow effect behind the mockup
 */
export function MockupDisplay({
  type = 'browser',
  src,
  alt = 'App screenshot',
  children,
  url = 'lifedash.app',
  className = '',
  style,
  animate = true,
  glowColor = 'rgba(102, 126, 234, 0.3)',
}: MockupDisplayProps) {
  const Wrapper = animate ? motion.div : 'div';
  const wrapperProps = animate
    ? {
        whileHover: { y: -5, scale: 1.01 },
        transition: { duration: 0.3 },
      }
    : {};

  return (
    <Wrapper
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        ...style,
      }}
      {...wrapperProps}
    >
      {/* Glow Effect */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          height: '80%',
          background: `radial-gradient(ellipse, ${glowColor} 0%, transparent 70%)`,
          filter: 'blur(40px)',
          zIndex: -1,
          pointerEvents: 'none',
        }}
      />

      {type === 'browser' && (
        <BrowserFrame src={src} alt={alt} url={url}>
          {children}
        </BrowserFrame>
      )}

      {type === 'laptop' && (
        <LaptopFrame src={src} alt={alt}>
          {children}
        </LaptopFrame>
      )}

      {type === 'phone' && (
        <PhoneFrame src={src} alt={alt}>
          {children}
        </PhoneFrame>
      )}
    </Wrapper>
  );
}

/**
 * Browser Frame - Chrome-like window with traffic lights
 */
function BrowserFrame({
  src,
  alt,
  url,
  children,
}: {
  src?: string;
  alt?: string;
  url?: string;
  children?: ReactNode;
}) {
  return (
    <div
      style={{
        backgroundColor: 'var(--bg-primary)',
        borderRadius: '12px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
        overflow: 'hidden',
      }}
    >
      {/* Browser Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 16px',
          backgroundColor: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-primary)',
        }}
      >
        {/* Traffic Lights */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#ff5f57',
              boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)',
            }}
          />
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#ffbd2e',
              boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)',
            }}
          />
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#28ca41',
              boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)',
            }}
          />
        </div>

        {/* URL Bar */}
        <div
          style={{
            flex: 1,
            marginLeft: '12px',
            padding: '6px 12px',
            backgroundColor: 'var(--bg-tertiary)',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {/* Lock Icon */}
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: '#10b981', flexShrink: 0 }}
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-tertiary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {url}
          </span>
        </div>

        {/* Browser Actions */}
        <div style={{ display: 'flex', gap: '8px', marginLeft: '8px' }}>
          <div
            style={{
              width: '16px',
              height: '16px',
              borderRadius: '4px',
              backgroundColor: 'var(--bg-tertiary)',
            }}
          />
          <div
            style={{
              width: '16px',
              height: '16px',
              borderRadius: '4px',
              backgroundColor: 'var(--bg-tertiary)',
            }}
          />
        </div>
      </div>

      {/* Content Area */}
      <div
        style={{
          aspectRatio: '16 / 10',
          backgroundColor: 'var(--bg-primary)',
          overflow: 'hidden',
        }}
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : children ? (
          children
        ) : (
          <PlaceholderContent />
        )}
      </div>
    </div>
  );
}

/**
 * Laptop Frame - MacBook-style with bezel
 */
function LaptopFrame({
  src,
  alt,
  children,
}: {
  src?: string;
  alt?: string;
  children?: ReactNode;
}) {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
      }}
    >
      {/* Screen */}
      <div
        style={{
          backgroundColor: '#1a1a1a',
          borderRadius: '16px 16px 0 0',
          padding: '12px 12px 0 12px',
          boxShadow: '0 -2px 20px rgba(0,0,0,0.2)',
        }}
      >
        {/* Camera */}
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#333',
            margin: '0 auto 8px',
            boxShadow: 'inset 0 0 2px rgba(0,0,0,0.5)',
          }}
        />

        {/* Screen Content */}
        <div
          style={{
            backgroundColor: 'var(--bg-primary)',
            borderRadius: '4px 4px 0 0',
            overflow: 'hidden',
            aspectRatio: '16 / 10',
          }}
        >
          {src ? (
            <img
              src={src}
              alt={alt}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : children ? (
            children
          ) : (
            <PlaceholderContent />
          )}
        </div>
      </div>

      {/* Base */}
      <div
        style={{
          height: '14px',
          background: 'linear-gradient(180deg, #e0e0e0 0%, #c0c0c0 50%, #d0d0d0 100%)',
          borderRadius: '0 0 4px 4px',
          position: 'relative',
        }}
      >
        {/* Notch */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '-1px',
            transform: 'translateX(-50%)',
            width: '80px',
            height: '4px',
            backgroundColor: '#c0c0c0',
            borderRadius: '0 0 4px 4px',
          }}
        />
      </div>

      {/* Bottom Lip */}
      <div
        style={{
          height: '6px',
          backgroundColor: '#d0d0d0',
          borderRadius: '0 0 8px 8px',
          marginTop: '-2px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        }}
      />
    </div>
  );
}

/**
 * Phone Frame - iPhone-style with notch
 */
function PhoneFrame({
  src,
  alt,
  children,
}: {
  src?: string;
  alt?: string;
  children?: ReactNode;
}) {
  return (
    <div
      style={{
        position: 'relative',
        width: '280px',
        margin: '0 auto',
      }}
    >
      {/* Phone Body */}
      <div
        style={{
          backgroundColor: '#1a1a1a',
          borderRadius: '40px',
          padding: '12px',
          boxShadow:
            '0 25px 50px -12px rgba(0, 0, 0, 0.4), inset 0 0 0 2px #333, inset 0 0 0 4px #1a1a1a',
        }}
      >
        {/* Screen */}
        <div
          style={{
            position: 'relative',
            backgroundColor: 'var(--bg-primary)',
            borderRadius: '32px',
            overflow: 'hidden',
            aspectRatio: '9 / 19.5',
          }}
        >
          {/* Dynamic Island / Notch */}
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100px',
              height: '28px',
              backgroundColor: '#000',
              borderRadius: '20px',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              paddingRight: '10px',
              gap: '6px',
            }}
          >
            {/* Camera */}
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: '#1a3a5c',
                boxShadow: 'inset 0 0 2px rgba(255,255,255,0.3)',
              }}
            />
          </div>

          {/* Content */}
          <div
            style={{
              width: '100%',
              height: '100%',
              paddingTop: '48px',
            }}
          >
            {src ? (
              <img
                src={src}
                alt={alt}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : children ? (
              children
            ) : (
              <PlaceholderContent variant="phone" />
            )}
          </div>

          {/* Home Indicator */}
          <div
            style={{
              position: 'absolute',
              bottom: '8px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '120px',
              height: '4px',
              backgroundColor: '#000',
              borderRadius: '2px',
              opacity: 0.3,
            }}
          />
        </div>
      </div>

      {/* Side Buttons */}
      {/* Volume Up */}
      <div
        style={{
          position: 'absolute',
          left: '-2px',
          top: '100px',
          width: '3px',
          height: '30px',
          backgroundColor: '#333',
          borderRadius: '2px 0 0 2px',
        }}
      />
      {/* Volume Down */}
      <div
        style={{
          position: 'absolute',
          left: '-2px',
          top: '140px',
          width: '3px',
          height: '30px',
          backgroundColor: '#333',
          borderRadius: '2px 0 0 2px',
        }}
      />
      {/* Power Button */}
      <div
        style={{
          position: 'absolute',
          right: '-2px',
          top: '120px',
          width: '3px',
          height: '50px',
          backgroundColor: '#333',
          borderRadius: '0 2px 2px 0',
        }}
      />
    </div>
  );
}

/**
 * Placeholder Content - Shows when no src or children provided
 */
function PlaceholderContent({ variant = 'desktop' }: { variant?: 'desktop' | 'phone' }) {
  const isPhone = variant === 'phone';

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)',
        padding: isPhone ? '16px' : '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: isPhone ? '12px' : '16px',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div
            style={{
              width: isPhone ? '80px' : '120px',
              height: isPhone ? '14px' : '18px',
              backgroundColor: 'var(--bg-tertiary)',
              borderRadius: '4px',
              marginBottom: '6px',
            }}
          />
          <div
            style={{
              width: isPhone ? '50px' : '80px',
              height: isPhone ? '10px' : '12px',
              backgroundColor: 'var(--bg-tertiary)',
              borderRadius: '4px',
              opacity: 0.6,
            }}
          />
        </div>
        <div
          style={{
            width: isPhone ? '28px' : '36px',
            height: isPhone ? '28px' : '36px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        />
      </div>

      {/* Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isPhone ? '1fr' : 'repeat(2, 1fr)',
          gap: isPhone ? '10px' : '12px',
          flex: 1,
        }}
      >
        {[
          { color: '#667eea', label: 'Journal' },
          { color: '#10b981', label: 'Expenses' },
          ...(isPhone ? [] : [
            { color: '#f59e0b', label: 'Tasks' },
            { color: '#8b5cf6', label: 'Learning' },
          ]),
        ].map((card, index) => (
          <div
            key={index}
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderRadius: isPhone ? '10px' : '12px',
              padding: isPhone ? '12px' : '16px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid var(--border-primary)',
            }}
          >
            <div
              style={{
                width: isPhone ? '24px' : '32px',
                height: isPhone ? '24px' : '32px',
                borderRadius: '8px',
                backgroundColor: `${card.color}20`,
                marginBottom: isPhone ? '8px' : '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: isPhone ? '12px' : '16px',
                  height: isPhone ? '12px' : '16px',
                  borderRadius: '4px',
                  backgroundColor: card.color,
                }}
              />
            </div>
            <div
              style={{
                width: '60%',
                height: isPhone ? '8px' : '10px',
                backgroundColor: 'var(--bg-tertiary)',
                borderRadius: '3px',
                marginBottom: '6px',
              }}
            />
            <div
              style={{
                width: '40%',
                height: isPhone ? '14px' : '18px',
                backgroundColor: 'var(--bg-tertiary)',
                borderRadius: '4px',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// Export individual frames for flexibility
export { BrowserFrame, LaptopFrame, PhoneFrame, PlaceholderContent };
