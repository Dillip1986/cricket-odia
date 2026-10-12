/**
 * Verified live-scores client.
 *
 * Polls the same-origin backend (server.js /api/live-matches) for the
 * full list of current matches. Resolves to null when the backend has
 * no API key or is unreachable — callers show the "no match" state.
 */
import type { Match } from '../types/cricket';

interface LiveResponse {
  ok: boolean;
  reason?: string;
  matches?: Match[];
  fetchedAt?: number;
}

export async function fetchLiveMatches(): Promise<Match[] | null> {
  try {
    const res = await fetch('/api/live-matches', { cache: 'no-store' });
    if (!res.ok) return null;
    const json: LiveResponse = await res.json();
    if (!json.ok || !Array.isArray(json.matches)) return null;
    return json.matches;
  } catch {
    return null; // static host / offline — show "no match today"
  }
}
