/**
 * Verified live-scores client.
 *
 * Polls the same-origin backend (server.js /api/live-matches).
 * Resolves to null when the backend has no API key or is unreachable —
 * callers must fall back to simulation/demo mode.
 */
import type { Match } from '../types/cricket';

export interface ScorePatch {
  matchId: string;
  status?: Match['status'];
  statusTextOdia?: string;
  liveSummaryEn?: string;
  isVerifiedApi?: boolean;
  team1?: Partial<Match['team1']>;
  team2?: Partial<Match['team2']>;
}

interface LiveResponse {
  ok: boolean;
  reason?: string;
  patches?: ScorePatch[];
  fetchedAt?: number;
}

export async function fetchLivePatches(): Promise<ScorePatch[] | null> {
  try {
    const res = await fetch('/api/live-matches', { cache: 'no-store' });
    if (!res.ok) return null;
    const json: LiveResponse = await res.json();
    if (!json.ok || !Array.isArray(json.patches)) return null;
    return json.patches;
  } catch {
    return null; // static host / offline — stay in demo mode
  }
}
