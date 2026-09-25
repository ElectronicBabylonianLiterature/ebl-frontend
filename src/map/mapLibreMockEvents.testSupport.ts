export type MockMapEvent = {
  point: { x: number; y: number }
  lngLat?: { lng: number; lat: number }
}

export const mockGetCenter = jest.fn(() => ({ lng: 43.25, lat: 35.45 }))
interface MockBounds {
  getWest: () => number
  getSouth: () => number
  getEast: () => number
  getNorth: () => number
}
export const mockGetBounds = jest.fn<MockBounds, []>(() => ({
  getWest: () => 43,
  getSouth: () => 35,
  getEast: () => 44,
  getNorth: () => 36,
}))

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
