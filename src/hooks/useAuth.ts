import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const handleSignIn = () => {
    router.push('/auth/signin');
  };

  const handleSignUp = () => {
    router.push('/auth/signup');
  };

  return {
    session,
    status,
    isAuthenticated: !!session,
    isLoading: status === 'loading',
    handleSignOut,
    handleSignIn,
    handleSignUp,
  };
}
