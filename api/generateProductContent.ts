import { authFetch } from '@/api/auth/authFetch';

export const generateProductContent = (id: string) =>
  authFetch(`/api/admin/products/${id}/generate`, { method: 'POST' });
