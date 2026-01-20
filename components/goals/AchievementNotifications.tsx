'use client';

/**
 * ACHIEVEMENT NOTIFICATIONS
 *
 * Shows celebration popups when users complete goals or hit milestones.
 * Includes confetti animation for major achievements.
 */

import { useState, useEffect, useCallback } from 'react';
import { Achievement } from '@/types/goal';
import { getUnseenAchievements, markAchievementSeen } from '@/lib/goal-service';
import { useAuth } from '@/lib/auth-context';

export const AchievementNotifications: React.FC = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const loadAchievements = useCallback(async () => {
    if (!user?.uid) return;

    try {
      const unseen = await getUnseenAchievements(user.uid);
      if (unseen.length > 0) {
        setAchievements(unseen);
        setCurrentIndex(0);
        setShowConfetti(unseen[0]?.type === 'goal_completed');
      }
    } catch (error) {
      console.error('Failed to load achievements:', error);
    }
  }, [user?.uid]);

  useEffect(() => {
    loadAchievements();

    // Check for new achievements every 30 seconds
    const interval = setInterval(loadAchievements, 30000);
    return () => clearInterval(interval);
  }, [loadAchievements]);

  const handleDismiss = async () => {
    if (!user?.uid || currentIndex >= achievements.length) return;

    const currentAchievement = achievements[currentIndex];

    try {
      await markAchievementSeen(user.uid, currentAchievement.id);

      if (currentIndex < achievements.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setShowConfetti(achievements[currentIndex + 1]?.type === 'goal_completed');
      } else {
        setAchievements([]);
        setCurrentIndex(0);
        setShowConfetti(false);
      }
    } catch (error) {
      console.error('Failed to mark achievement as seen:', error);
    }
  };

  if (achievements.length === 0 || currentIndex >= achievements.length) {
    return null;
  }

  const achievement = achievements[currentIndex];

  const getAchievementEmoji = (type: Achievement['type']): string => {
    switch (type) {
      case 'goal_completed':
        return '🎉';
      case 'streak_milestone':
        return '🔥';
      case 'personal_best':
        return '🏆';
      case 'first_goal':
        return '🌟';
      default:
        return '✨';
    }
  };

  const getAchievementColor = (type: Achievement['type']): string => {
    switch (type) {
      case 'goal_completed':
        return '#22c55e';
      case 'streak_milestone':
        return '#f59e0b';
      case 'personal_best':
        return '#a855f7';
      case 'first_goal':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  return (
    <>
      {/* Confetti Effect */}
      {showConfetti && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 100,
            overflow: 'hidden',
          }}
        >
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: '10px',
                height: '10px',
                backgroundColor: ['#22c55e', '#3b82f6', '#f59e0b', '#a855f7', '#ec4899'][i % 5],
                left: `${Math.random() * 100}%`,
                top: '-20px',
                borderRadius: Math.random() > 0.5 ? '50%' : '0',
                animation: `confetti-fall ${2 + Math.random() * 2}s ease-out forwards`,
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Achievement Popup */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 60,
          animation: 'achievement-pop 0.5s ease-out',
        }}
      >
        <div
          style={{
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: '16px',
            padding: '2rem',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            border: `3px solid ${getAchievementColor(achievement.type)}`,
            minWidth: '300px',
            maxWidth: '400px',
          }}
        >
          {/* Emoji */}
          <div
            style={{
              fontSize: '4rem',
              marginBottom: '1rem',
              animation: 'achievement-bounce 0.5s ease-out 0.2s both',
            }}
          >
            {getAchievementEmoji(achievement.type)}
          </div>

          {/* Title */}
          <h2
            style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: getAchievementColor(achievement.type),
              margin: '0 0 0.5rem',
            }}
          >
            {achievement.title}
          </h2>

          {/* Message */}
          <p
            style={{
              fontSize: '0.95rem',
              color: 'var(--text-secondary)',
              margin: '0 0 1.5rem',
              lineHeight: '1.5',
            }}
          >
            {achievement.message}
          </p>

          {/* Dismiss Button */}
          <button
            onClick={handleDismiss}
            style={{
              backgroundColor: getAchievementColor(achievement.type),
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 2rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}
          >
            {currentIndex < achievements.length - 1 ? 'Next' : 'Awesome!'}
          </button>

          {/* Counter */}
          {achievements.length > 1 && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: '1rem 0 0' }}>
              {currentIndex + 1} of {achievements.length}
            </p>
          )}
        </div>
      </div>

      {/* Backdrop */}
      <div
        onClick={handleDismiss}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          zIndex: 55,
        }}
      />

      {/* Animations */}
      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        @keyframes achievement-pop {
          0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 0;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.1);
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
        }

        @keyframes achievement-bounce {
          0% {
            transform: scale(0);
          }
          50% {
            transform: scale(1.3);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );
};

export default AchievementNotifications;
