/**
 * Access token holder kept outside React state. Every query/mutation reads this
 * synchronously through `apiFetch`; putting it in Zustand/useState would re-render the
 * whole tree on every silent refresh.
 */
let accessToken: string | null = null;

export const tokenStore = {
  get(): string | null {
    return accessToken;
  },
  set(token: string | null) {
    accessToken = token;
  },
};
