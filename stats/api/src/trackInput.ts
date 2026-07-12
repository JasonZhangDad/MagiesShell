export type TrackInput = {
  eventType: 'page_view' | 'download'
  ua: string | null
  downloadOs: string | null
  downloadArch: string | null
  downloadFile: string | null
  path: string
  referrer: string | null
  sessionId: string | null
}

function boundedString(value: unknown, maxLength: number): string | null {
  return typeof value === 'string' ? value.slice(0, maxLength) : null
}

export function normalizeTrackInput(value: unknown): TrackInput {
  const input = value && typeof value === 'object'
    ? value as Record<string, unknown>
    : {}

  return {
    eventType: input.eventType === 'download' ? 'download' : 'page_view',
    ua: boundedString(input.ua, 1_024),
    downloadOs: boundedString(input.downloadOs, 32),
    downloadArch: boundedString(input.downloadArch, 32),
    downloadFile: boundedString(input.downloadFile, 255),
    path: boundedString(input.path, 300) ?? '/',
    referrer: boundedString(input.referrer, 500),
    sessionId: boundedString(input.sessionId, 80),
  }
}
