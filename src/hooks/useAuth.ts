import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const router = useRouter();

  useEffect(() => {
    // Check if user has an access token or login token
    const hasAccessToken = typeof window !== 'undefined' && localStorage.getItem('accessToken');
    const hasLoginToken = typeof window !== 'undefined' && localStorage.getItem('loginToken');

    if (!hasAccessToken && !hasLoginToken) {
      // No authentication found, redirect to sign-in
      router.push('/signin');
    }
  }, [router]);
}
