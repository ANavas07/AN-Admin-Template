/**
 * EXAMPLE — copy + adapt for each resource.
 * Delete this file once you have real services.
 */

import { http } from './http'
import { sanitize } from './sanitize'

// ── Types ────────────────────────────────────────────────────────────────────

interface Tournament {
  id: string
  name: string
  startDate: string
  endDate: string
  status: 'draft' | 'active' | 'finished'
}

interface CreateTournamentDto {
  name: string
  startDate: string
  endDate: string
  description?: string
}

// ── Service ──────────────────────────────────────────────────────────────────

export const tournamentService = {
  getAll: (signal?: AbortSignal) =>
    http.get<Tournament[]>('/tournaments', { signal }),

  getById: (id: string) =>
    http.get<Tournament>(`/tournaments/${id}`),

  create: (data: CreateTournamentDto) =>
    // sanitize trims strings + drops empty/null/undefined fields
    http.post<Tournament>('/tournaments', sanitize(data)),

  update: (id: string, data: Partial<CreateTournamentDto>) =>
    http.patch<Tournament>(`/tournaments/${id}`, sanitize(data)),

  remove: (id: string) =>
    http.delete<void>(`/tournaments/${id}`),
}

// ── Usage in component ───────────────────────────────────────────────────────
//
// import { tournamentService } from '@/services/example.service'
// import { ApiError } from '@/services/http'
//
// useEffect(() => {
//   const controller = new AbortController()
//   tournamentService.getAll(controller.signal)
//     .then(setTournaments)
//     .catch(err => { if (err instanceof ApiError) console.error(err.status, err.data) })
//   return () => controller.abort()
// }, [])
