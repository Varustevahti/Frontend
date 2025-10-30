import { useAuth } from '@clerk/clerk-expo';

export default function useApi() {
  const { getToken } = useAuth();

  

  const authFetch = async (url, init = {}) => {
    const token = await getToken();
    return fetch(url, {
      ...init,
      headers: {
        ...(init.headers || {}),
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  };

  const createItem = async (item) => {
    const response = await authFetch('backend url', {
      method: 'POST',
      body: JSON.stringify(item),
    });
    if (!response.ok) throw new Error('Save failed');
    return response.json();
  };

  const listMyItems = async () => {
    const response = await authFetch('backend url');
    return response.json();
  };

  return { createItem, listMyItems };
}
