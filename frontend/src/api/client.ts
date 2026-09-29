const baseUrl = '/api';

export const getJson = async <T>(path: string, signal?: AbortSignal): Promise<T> => {
  const response = await fetch(`${baseUrl}${path}`, { signal });
  if (!response.ok) throw new Error(`The API answered ${response.status}.`);

  return (await response.json()) as T;
};
