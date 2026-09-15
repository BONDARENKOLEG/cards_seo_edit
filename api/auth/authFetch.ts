import { ROUTES } from '@/constants';

export const authFetch = async (
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> => {
  const response = await fetch(input, init);

  if (response.status === 401) {
    window.location.href = ROUTES.LOGIN;
  }

  return response;
};
