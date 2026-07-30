import type { CacheItem, CacheProvider } from "@node-saml/node-saml";

export type CacheEntry = {
  key: string;
  value: string;
  createdAt: number;
};

export class RequestCookieCache implements CacheProvider {
  private readonly entries = new Map<string, CacheEntry>();

  constructor(
    initial: CacheEntry[] = [],
    private readonly expirationMs = 10 * 60 * 1_000,
  ) {
    for (const entry of initial) this.entries.set(entry.key, entry);
  }

  async saveAsync(key: string, value: string): Promise<CacheItem | null> {
    this.prune();
    if (this.entries.has(key)) return null;
    const entry = { key, value, createdAt: Date.now() };
    this.entries.set(key, entry);
    return { value, createdAt: entry.createdAt };
  }

  async getAsync(key: string): Promise<string | null> {
    this.prune();
    return this.entries.get(key)?.value ?? null;
  }

  async removeAsync(key: string | null): Promise<string | null> {
    if (!key || !this.entries.delete(key)) return null;
    return key;
  }

  snapshot() {
    this.prune();
    return [...this.entries.values()];
  }

  private prune() {
    const oldestAllowed = Date.now() - this.expirationMs;
    for (const [key, entry] of this.entries) {
      if (entry.createdAt < oldestAllowed) this.entries.delete(key);
    }
  }
}
