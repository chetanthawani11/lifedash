'use client';

/**
 * REGISTER FORM COMPONENT
 *
 * Beautiful registration form with real-time validation
 * Features:
 * - Password strength indicator
 * - Password confirmation matching
 * - Clean design matching LifeDash aesthetics
 * - Helpful error messages
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AuthFormData } from '@/types/auth';
import { createUserProfile } from '@/lib/user-service';
import toast from 'react-hot-toast';

export const RegisterForm = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<AuthFormData & { confirmPassword: string }>();

  const password = watch('password');

  // Calculate password strength
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: '', color: '' };

    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;

    if (score <= 2) return { score, label: 'Weak', color: '#ef4444' };
    if (score === 3) return { score, label: 'Fair', color: '#f59e0b' };
    if (score === 4) return { score, label: 'Good', color: '#10b981' };
    return { score, label: 'Strong', color: '#22c55e' };
  };

  const passwordStrength = getPasswordStrength(password || '');

  const onSubmit = async (data: AuthFormData & { confirmPassword: string }) => {
    setLoading(true);

    try {
      // Create user with Firebase
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      // Update profile with display name if provided
      if (data.displayName) {
        await updateProfile(userCredential.user, {
          displayName: data.displayName,
        });
      }

      // Create user profile in Firestore
      await createUserProfile(
        userCredential.user.uid,
        data.email,
        data.displayName || data.email.split('@')[0]
      );

      toast.success('Account created successfully! 🎉');
      router.push('/dashboard');
    } catch (error: any) {
      let errorMessage = 'Registration failed. Please try again.';

      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Use at least 6 characters.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled.';
          break;
        default:
          errorMessage = error.message || 'Registration failed. Please try again.';
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Display Name */}
      <Input
        label="Display Name (Optional)"
        type="text"
        placeholder="John Doe"
        error={errors.displayName?.message}
        helperText="This is how you'll appear in the app"
        {...register('displayName')}
      />


      {/* Email */}
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

      {/* Password */}
      <div>
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          helperText="At least 6 characters"
          {...register('password', {
            required: 'Password is required',
            minLength: {
              value: 6,
              message: 'Password must be at least 6 characters',
            },
          })}
        />

        {/* Password Strength Indicator */}
        {password && password.length > 0 && (
          <div style={{ marginTop: '0.75rem' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem',
            }}>
              <span style={{
                fontSize: 'var(--text-xs)',
                fontWeight: '500',
                color: passwordStrength.color,
              }}>
                Strength: {passwordStrength.label}
              </span>
              <span style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--text-tertiary)',
              }}>
                {passwordStrength.score}/5
              </span>
            </div>
            <div style={{
              height: '4px',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${(passwordStrength.score / 5) * 100}%`,
                backgroundColor: passwordStrength.color,
                transition: 'all var(--transition-base)',
              }} />
            </div>
          </div>
        )}
      </div>

      {/* Confirm Password */}
      <Input
        label="Confirm Password"
        type="password"
        placeholder="••••••••"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword', {
          required: 'Please confirm your password',
          validate: (value) =>
            value === password || 'Passwords do not match',
        })}
      />

      {/* Submit Button */}
      <Button
        type="submit"
        loading={loading}
        fullWidth
        variant="primary"
        size="lg"
      >
        {loading ? 'Creating account...' : 'Create Account'}
      </Button>
    </form>
  );
};
