import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuthUser } from '../store/authStore';

type Props = { children: ReactNode };

export function ProtectedRoute({ children }: Props) {
  const user = useAuthUser();
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <>{children}</>;
}
