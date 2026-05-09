import { apiClient } from './client';
import type { AuthUser } from '../store/authStore';

type LoginResponse = {
  token: string;
  user: AuthUser;
  expiresIn: number;
};

export async function login(username: string): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>('/auth/login', {
    username,
  });
  return data;
}
