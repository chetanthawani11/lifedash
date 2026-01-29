'use client';

/**
 * SectionSkeleton - Loading placeholder for lazy-loaded sections
 */

interface SectionSkeletonProps {
  height?: string;
  variant?: 'default' | 'cards' | 'stats' | 'testimonials';
}

export function SectionSkeleton({
  height = '600px',
  variant = 'default'
}: SectionSkeletonProps) {
  return (
    <div
      style={{
        minHeight: height,
        padding: '80px 24px',
        backgroundColor: 'var(--bg-primary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '24px',
      }}
    >
      {/* Header Skeleton */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div
          style={{
            width: '100px',
            height: '32px',
            backgroundColor: 'var(--bg-tertiary)',
            borderRadius: '100px',
            margin: '0 auto 16px',
            animation: 'pulse 2s ease-in-out infinite',
          }}
        />
        <div
          style={{
            width: '300px',
            height: '40px',
            backgroundColor: 'var(--bg-tertiary)',
            borderRadius: '8px',
            margin: '0 auto 12px',
            animation: 'pulse 2s ease-in-out infinite',
          }}
        />
        <div
          style={{
            width: '200px',
            height: '20px',
            backgroundColor: 'var(--bg-tertiary)',
            borderRadius: '6px',
            margin: '0 auto',
            opacity: 0.6,
            animation: 'pulse 2s ease-in-out infinite',
          }}
        />
      </div>

      {/* Content Skeleton based on variant */}
      {variant === 'cards' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
            width: '100%',
            maxWidth: '1200px',
          }}
        >
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              style={{
                height: '200px',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '16px',
                animation: 'pulse 2s ease-in-out infinite',
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      )}

      {variant === 'stats' && (
        <div
          style={{
            display: 'flex',
            gap: '48px',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              style={{
                textAlign: 'center',
                animation: 'pulse 2s ease-in-out infinite',
                animationDelay: `${i * 0.1}s`,
              }}
            >
              <div
                style={{
                  width: '80px',
                  height: '60px',
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: '8px',
                  marginBottom: '12px',
                }}
              />
              <div
                style={{
                  width: '100px',
                  height: '16px',
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: '4px',
                  opacity: 0.6,
                }}
              />
            </div>
          ))}
        </div>
      )}

      {variant === 'testimonials' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
            width: '100%',
            maxWidth: '1200px',
          }}
        >
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              style={{
                padding: '24px',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '16px',
                animation: 'pulse 2s ease-in-out infinite',
                animationDelay: `${i * 0.15}s`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  marginBottom: '16px',
                }}
              >
                {[...Array(5)].map((_, j) => (
                  <div
                    key={j}
                    style={{
                      width: '16px',
                      height: '16px',
                      backgroundColor: 'var(--bg-tertiary)',
                      borderRadius: '2px',
                    }}
                  />
                ))}
              </div>
              <div
                style={{
                  width: '100%',
                  height: '60px',
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: '8px',
                  marginBottom: '16px',
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--bg-tertiary)',
                  }}
                />
                <div>
                  <div
                    style={{
                      width: '80px',
                      height: '14px',
                      backgroundColor: 'var(--bg-tertiary)',
                      borderRadius: '4px',
                      marginBottom: '6px',
                    }}
                  />
                  <div
                    style={{
                      width: '60px',
                      height: '12px',
                      backgroundColor: 'var(--bg-tertiary)',
                      borderRadius: '4px',
                      opacity: 0.6,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {variant === 'default' && (
        <div
          style={{
            width: '100%',
            maxWidth: '800px',
            height: '300px',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '16px',
            animation: 'pulse 2s ease-in-out infinite',
          }}
        />
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}
