import React, { useState } from 'react';
import { LoginForm } from '../components/LoginForm';
import { RegisterForm } from '../components/RegisterForm';

type AuthMode = 'login' | 'register';

interface AuthPageProps {
  initialMode?: AuthMode;
  onAuthSuccess?: () => void;
}

/**
 * Authentication page that handles both login and register forms
 */
export const AuthPage: React.FC<AuthPageProps> = ({ 
  initialMode = 'login', 
  onAuthSuccess 
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);

  const handleAuthSuccess = (): void => {
    onAuthSuccess?.();
  };

  const switchToLogin = (): void => {
    setMode('login');
  };

  const switchToRegister = (): void => {
    setMode('register');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
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
