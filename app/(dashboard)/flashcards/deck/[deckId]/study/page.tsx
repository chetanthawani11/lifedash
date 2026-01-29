'use client';

// Study Session Page - Review flashcards with spaced repetition
// This is where the magic happens - you study your cards and they get scheduled intelligently!

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  getFlashcardDeck,
  getDeckFlashcards,
  recordFlashcardReview,
  updateDeckMasteredCount,
} from '@/lib/flashcard-service';
import {
  calculateNextReview,
  getDueCards,
  sortCardsForStudy,
  calculateSessionStats,
  DifficultyRating,
} from '@/lib/spaced-repetition';
import { Flashcard, FlashcardDeck } from '@/types';
import { FlashcardStudyCard } from '@/components/flashcards/FlashcardStudyCard';
import { Button } from '@/components/ui/Button';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import toast from 'react-hot-toast';

interface StudyPageProps {
  params: Promise<{ deckId: string }>;
}

export default function StudyPage({ params }: StudyPageProps) {
  const resolvedParams = use(params);
  const deckId = resolvedParams.deckId;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // State
  const [deck, setDeck] = useState<FlashcardDeck | null>(null);
  const [allCards, setAllCards] = useState<Flashcard[]>([]);
  const [studyQueue, setStudyQueue] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [studiedCards, setStudiedCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [showEndSessionConfirm, setShowEndSessionConfirm] = useState(false);

  // Load deck and flashcards
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);

        // Load deck info and all flashcards
        const [deckData, cardsData] = await Promise.all([
          getFlashcardDeck(user.uid, deckId),
          getDeckFlashcards(user.uid, deckId),
        ]);

        if (!deckData) {
          toast.error('Deck not found');
          router.push('/flashcards');
          return;
        }

        setDeck(deckData);
        setAllCards(cardsData);

        // Get cards that are due for review
        const dueCards = getDueCards(cardsData);

        if (dueCards.length === 0) {
          toast.success('No cards due for review. Great job');
          setSessionComplete(true);
          setLoading(false);
          return;
        }

        // Sort cards for optimal study order
        const sortedCards = sortCardsForStudy(dueCards);
        setStudyQueue(sortedCards);

        setLoading(false);
      } catch (error) {
        console.error('Error loading study session:', error);
        toast.error('Failed to load study session');
        setLoading(false);
      }
    };

    loadData();
  }, [user, authLoading, deckId, router]);

  // Handle card rating
  const handleRate = async (rating: DifficultyRating) => {
    if (!user || currentCardIndex >= studyQueue.length) return;

    try {
      const currentCard = studyQueue[currentCardIndex];

      // Calculate next review date using spaced repetition algorithm
      const reviewData = calculateNextReview(currentCard, rating);

      // Save the review to the database
      await recordFlashcardReview(user.uid, currentCard.id, reviewData);

      // Add to studied cards list
      setStudiedCards([...studiedCards, { ...currentCard, ...reviewData }]);

      // Move to next card
      if (currentCardIndex + 1 < studyQueue.length) {
        setCurrentCardIndex(currentCardIndex + 1);
      } else {
        // Session complete!
        await updateDeckMasteredCount(user.uid, deckId);
        setSessionComplete(true);
        toast.success(`Study session complete. You reviewed ${studyQueue.length} cards`);
      }
    } catch (error) {
      console.error('Error recording review:', error);
      toast.error('Failed to save review. Please try again.');
    }
  };

  // Loading state
  if (loading || authLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '4rem 0',
      }}>
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
          Loading study session...
        </div>
      </div>
    );
  }

  // No cards to study
  if (sessionComplete || studyQueue.length === 0) {
    const stats = calculateSessionStats(allCards, studiedCards);

    return (
      <div>
        {/* Header */}
        <div style={{
          marginBottom: '1.5rem',
          textAlign: 'center',
        }}>
          <h1 style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: '600',
            color: 'var(--text-primary)',
            marginBottom: '0.25rem',
          }}>
            {studiedCards.length > 0 ? 'Session Complete!' : 'All Caught Up!'}
          </h1>
          <p style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text-secondary)',
          }}>
            {deck?.name}
          </p>
        </div>

        {/* Session Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '0.75rem',
          marginBottom: '1.5rem',
        }}>
          <div style={{
            padding: '1rem',
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)',
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: '600',
              color: 'var(--primary-500)',
              marginBottom: '0.25rem',
            }}>
              {stats.cardsStudied}
            </div>
            <div style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--text-tertiary)',
            }}>
              Cards Studied
            </div>
          </div>

          <div style={{
            padding: '1rem',
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)',
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: '600',
              color: stats.accuracy >= 80 ? '#22c55e' : stats.accuracy >= 60 ? '#f59e0b' : '#ef4444',
              marginBottom: '0.25rem',
            }}>
              {stats.accuracy}%
            </div>
            <div style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--text-tertiary)',
            }}>
              Accuracy
            </div>
          </div>

          <div style={{
            padding: '1rem',
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)',
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: '600',
              color: 'var(--primary-500)',
              marginBottom: '0.25rem',
            }}>
              {stats.newCards}
            </div>
            <div style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--text-tertiary)',
            }}>
              New Cards
            </div>
          </div>

          <div style={{
            padding: '1rem',
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)',
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: '600',
              color: 'var(--primary-500)',
              marginBottom: '0.25rem',
            }}>
              {stats.reviewCards}
            </div>
            <div style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--text-tertiary)',
            }}>
              Due for Review
            </div>
          </div>
        </div>

        {/* Motivational Message */}
        {studiedCards.length > 0 && (
          <div style={{
            padding: '1rem',
            backgroundColor: 'var(--primary-50)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--primary-200)',
            marginBottom: '1.5rem',
            textAlign: 'center',
          }}>
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-primary)',
              marginBottom: '0.25rem',
            }}>
              {stats.accuracy >= 90 ? 'Outstanding work!' :
               stats.accuracy >= 75 ? 'Great job!' :
               stats.accuracy >= 60 ? 'Good effort!' :
               'Keep practicing!'}
            </p>
            <p style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--text-secondary)',
            }}>
              {stats.cardsCorrect > 0 && `You got ${stats.cardsCorrect} cards right. `}
              Come back later to review more cards!
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.75rem',
        }}>
          <Button
            onClick={() => router.push(`/flashcards/deck/${deckId}`)}
            variant="ghost"
            size="sm"
            fullWidth
          >
            Back to Deck
          </Button>
          <Button
            onClick={() => router.push('/flashcards')}
            variant="primary"
            size="sm"
            fullWidth
          >
            All Decks
          </Button>
        </div>
      </div>
    );
  }

  // Study mode - show current card
  const currentCard = studyQueue[currentCardIndex];
  const progress = ((currentCardIndex) / studyQueue.length) * 100;

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
      }}>
        <div>
          <h1 style={{
            fontSize: 'var(--text-xl)',
            fontWeight: '600',
            color: 'var(--text-primary)',
            marginBottom: '0.25rem',
          }}>
            Studying: {deck?.name}
          </h1>
          <p style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--text-secondary)',
          }}>
            {studyQueue.length} cards due for review
          </p>
        </div>

        <Button
          onClick={() => setShowEndSessionConfirm(true)}
          variant="ghost"
          size="sm"
        >
          End Session
        </Button>
      </div>

      {/* Progress Bar */}
      <div style={{
        width: '100%',
        height: '6px',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-full)',
        marginBottom: '1.5rem',
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${progress}%`,
          height: '100%',
          backgroundColor: 'var(--primary-500)',
          transition: 'width 0.3s ease',
          borderRadius: 'var(--radius-full)',
        }} />
      </div>

      {/* Study Card */}
      <FlashcardStudyCard
        flashcard={currentCard}
        onRate={handleRate}
        cardNumber={currentCardIndex + 1}
        totalCards={studyQueue.length}
      />

      {/* Study Stats (below card) */}
      <div style={{
        marginTop: '1.5rem',
        padding: '0.75rem',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
            Studied
          </div>
          <div style={{ fontSize: 'var(--text-base)', fontWeight: '600', color: 'var(--text-primary)' }}>
            {currentCardIndex}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
            Remaining
          </div>
          <div style={{ fontSize: 'var(--text-base)', fontWeight: '600', color: 'var(--text-primary)' }}>
            {studyQueue.length - currentCardIndex}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
            Total
          </div>
          <div style={{ fontSize: 'var(--text-base)', fontWeight: '600', color: 'var(--text-primary)' }}>
            {allCards.length}
          </div>
        </div>
      </div>

      {/* End Session Confirmation Modal */}
      <ConfirmationModal
        isOpen={showEndSessionConfirm}
        onClose={() => setShowEndSessionConfirm(false)}
        onConfirm={() => router.push(`/flashcards/deck/${deckId}`)}
        title="End Study Session"
        message={<>Are you sure you want to end this study session? You&apos;ve studied <strong>{currentCardIndex}</strong> of <strong>{studyQueue.length}</strong> cards.</>}
        confirmText="End Session"
        cancelText="Continue Studying"
        variant="warning"
      />
    </div>
  );
}
