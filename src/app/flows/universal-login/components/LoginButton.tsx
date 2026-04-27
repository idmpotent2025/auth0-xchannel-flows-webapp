'use client';

import { useAuth } from '@/lib/hooks/useAuth';

export function LoginButton() {
  const { login } = useAuth();

  return (
    <button
      onClick={login}
      className="w-full bg-primary hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
    >
      Login with Auth0
    </button>
  );
}
