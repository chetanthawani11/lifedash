'use client';

/**
 * RESET PASSWORD FORM COMPONENT
 *
 * Beautiful password reset form with success state
 * Features:
 * - Clean, modern design
 * - Success confirmation screen
 * - Helpful messaging
 * - Easy navigation back to login
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface ResetFormData {
  email: string;
}

export const ResetPasswordForm = ({ onBack }: { onBack: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ResetFormData>();

  const onSubmit = async (data: ResetFormData) => {
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, data.email);
      setEmailSent(true);
      toast.success('Password reset email sent');
    } catch (error: any) {
      let errorMessage = 'Failed to send reset email.';

      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many requests. Please try again later.';
          break;
        default:
          errorMessage = error.message || 'Failed to send reset email.';
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Success state
  if (emailSent) {
    return (
      <div style={{ textAlign: 'center' }}>
        {/* Success Icon */}
        <div style={{
          width: '56px',
          height: '56px',
          margin: '0 auto 1rem',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 20px rgba(16, 185, 129, 0.25)',
        }}>
          <svg style={{ width: '28px', height: '28px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Success Message */}
        <h2 style={{
          fontSize: '1.25rem',
          fontWeight: '700',
          color: 'var(--text-primary)',
          marginBottom: '0.5rem',
        }}>
          Email Sent!
        </h2>
        <p style={{
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          marginBottom: '1.5rem',
          lineHeight: '1.5',
        }}>
          Check your inbox at<br />
          <strong style={{ color: 'var(--text-primary)' }}>{getValues('email')}</strong>
        </p>

        {/* Back Button */}
        <Button onClick={onBack} variant="primary" fullWidth size="md">
          Back to Login
        </Button>
      </div>
    );
  }

  // Reset form
  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Header */}
      <p style={{
        fontSize: '0.875rem',
        color: 'var(--text-secondary)',
        lineHeight: '1.5',
        marginBottom: '0.25rem',
      }}>
        Enter your email and we'll send you a reset link.
      </p>

      {/* Email Input */}
      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        {...register('email', {
          required: 'Email is required',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Invalid email address',
          },
        })}
      />

      {/* Submit Button */}
      <Button
        type="submit"
        loading={loading}
        fullWidth
        variant="primary"
        size="md"
      >
        {loading ? 'Sending...' : 'Send Reset Email'}
      </Button>

      {/* Back Button */}
      <Button
        type="button"
        onClick={onBack}
        variant="ghost"
        fullWidth
        size="md"
      >
        Back to Login
      </Button>
    </form>
  );
};
