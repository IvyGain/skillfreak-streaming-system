import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { LoginForm } from '@/components/LoginForm';
import { RegisterForm } from '@/components/RegisterForm';
import { useAuth } from '@/hooks/useAuth';

/**
 * Authentication modes
 */
type AuthMode = 'login' | 'register';

/**
 * Authentication page component
 * @returns JSX element
 */
const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  /**
   * Handle successful authentication
   */
  const handleAuthSuccess = (): void => {
    router.push('/dashboard');
  };

  /**
   * Switch to registration mode
   */
  const switchToRegister = (): void => {
    setMode('register');
  };

  /**
   * Switch to login mode
   */
  const switchToLogin = (): void => {
    setMode('login');
  };

  // Show loading while checking authentication status
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Don't render if user is authenticated (will redirect)
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {mode === 'login' ? (
          <LoginForm
            onSuccess={handleAuthSuccess}
            onSwitchToRegister={switchToRegister}
          />
        ) : (
          <RegisterForm
            onSuccess={handleAuthSuccess}
            onSwitchToLogin={switchToLogin}
          />
        )}
      </div>
    </div>
  );
};

export default AuthPage;