export type MockMapEvent = { point: { x: number; y: number } }

export type MockErrorEvent = {
  error?: { message?: string; url?: string }
  sourceId?: string
  layer?: { id?: string }
  tile?: unknown
}

export interface MockEventHandler {
  (event?: MockMapEvent | MockErrorEvent): void
  originalHandler?: MockEventHandler
}
