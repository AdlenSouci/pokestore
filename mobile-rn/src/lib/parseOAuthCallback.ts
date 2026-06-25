/** Parse query params depuis une URL de callback (exp://, pokestore://, https://). */
export function parseOAuthCallback(url: string): {
  token?: string;
  error?: string;
  sessionId?: string;
  payment?: string;
} {
  const queryIndex = url.indexOf('?');
  if (queryIndex === -1) {
    return {};
  }
  const query = url.slice(queryIndex + 1);
  const params = new URLSearchParams(query);
  return {
    token: params.get('token') ?? undefined,
    error: params.get('error') ?? undefined,
    sessionId: params.get('session_id') ?? undefined,
    payment: params.get('payment') ?? undefined,
  };
}
