import { LngLatBoundsMock } from 'test-support/maplibre-bounds-mock'

type MapEventListener = (event?: unknown) => void

export interface SourceMock {
  data: unknown
  readonly setData: jest.Mock<void, [unknown]>
  readonly getClusterExpansionZoom: jest.Mock<Promise<number>, [number]>
}

export interface CameraOptions {
  readonly center?: [number, number]
  readonly zoom?: number
  readonly bearing?: number
  readonly pitch?: number
}

let clusterExpansionZoom = 8
export class MapMock {
  readonly options: Record<string, unknown>
  readonly sources = new Map<string, SourceMock>()
  readonly layers = new Map<string, Record<string, unknown>>()
  readonly featureStates = new Map<string, Record<string, unknown>>()
  readonly controls: unknown[] = []
  readonly canvas: { style: Record<string, string> } = { style: {} }
  private readonly listeners = new Map<string, MapEventListener[]>()
  private camera: Required<CameraOptions>
  private styleLoaded = true
  private renderedFeatures: (layerIds: readonly string[]) => unknown[] =
    () => []

  readonly addControl = jest.fn((control: unknown) => {
    this.controls.push(control)
    return this
  })
  readonly fitBounds = jest.fn()
  readonly easeTo = jest.fn((options: CameraOptions) =>
    this.applyCamera(options),
  )
  readonly jumpTo = jest.fn((options: CameraOptions) =>
    this.applyCamera(options),
  )
  readonly setPaintProperty = jest.fn(
    (layerId: string, property: string, value: unknown) => {
      const layer = this.layers.get(layerId)
      if (layer) {
        this.layers.set(layerId, { ...layer, [property]: value })
      }
    },
  )
  readonly setLayoutProperty = jest.fn(
    (layerId: string, property: string, value: unknown) => {
      const layer = this.layers.get(layerId)
      if (layer) {
        this.layers.set(layerId, { ...layer, [property]: value })
      }
    },
  )
  readonly remove = jest.fn(() => {
    this.listeners.clear()
    this.removed = true
  })
  readonly setTerrain = jest.fn((terrain: unknown) => {
    this.terrain = terrain
  })
  readonly setPadding = jest.fn((padding: unknown) => {
    this.padding = padding
  })
  readonly resize = jest.fn()

  removed = false
  terrain: unknown = null
  padding: unknown = { top: 0, right: 0, bottom: 0, left: 0 }
  bounds: [number, number, number, number] = [43.24, 35.44, 43.27, 35.47]

  getBounds(): {
    getWest: () => number
    getSouth: () => number
    getEast: () => number
    getNorth: () => number
  } {
    const [west, south, east, north] = this.bounds
    return {
      getWest: () => west,
      getSouth: () => south,
      getEast: () => east,
      getNorth: () => north,
    }
  }

  constructor(options: Record<string, unknown> = {}) {
    this.options = options
    this.camera = {
      center: (options.center as [number, number]) ?? [0, 0],
      zoom: (options.zoom as number) ?? 0,
      bearing: (options.bearing as number) ?? 0,
      pitch: (options.pitch as number) ?? 0,
    }
    createdMaps.push(this)
  }

  private applyCamera(options: CameraOptions): void {
    this.camera = { ...this.camera, ...options }
  }

  on(event: string, listener: MapEventListener): this {
    this.listeners.set(event, [...(this.listeners.get(event) ?? []), listener])
    return this
  }

  once(event: string, listener: MapEventListener): this {
    return this.on(event, listener)
  }

  off(event: string, listener: MapEventListener): this {
    this.listeners.set(
      event,
      (this.listeners.get(event) ?? []).filter((entry) => entry !== listener),
    )
    return this
  }

  emit(event: string, payload?: unknown): void {
    for (const listener of this.listeners.get(event) ?? []) {
      listener(payload)
    }
  }

  listenerCount(event: string): number {
    return (this.listeners.get(event) ?? []).length
  }

  addSource(id: string, source: Record<string, unknown>): void {
    this.sources.set(id, {
      data: source.data,
      setData: jest.fn(function (this: SourceMock, data: unknown) {
        this.data = data
      }),
      getClusterExpansionZoom: jest.fn((_clusterId: number) =>
        Promise.resolve(clusterExpansionZoom),
      ),
    })
  }

  getSource(id: string): SourceMock | undefined {
    return this.sources.get(id)
  }

  removeSource(id: string): void {
    this.sources.delete(id)
  }

  addLayer(layer: Record<string, unknown>): void {
    this.layers.set(layer.id as string, layer)
  }

  getLayer(id: string): Record<string, unknown> | undefined {
    return this.layers.get(id)
  }

  removeLayer(id: string): void {
    this.layers.delete(id)
  }

  isStyleLoaded(): boolean {
    return this.styleLoaded
  }

  setStyleLoaded(loaded: boolean): void {
    this.styleLoaded = loaded
  }

  getCanvas(): { style: Record<string, string> } {
    return this.canvas
  }

  getCenter(): { lng: number; lat: number } {
    return { lng: this.camera.center[0], lat: this.camera.center[1] }
  }

  getZoom(): number {
    return this.camera.zoom
  }

  getBearing(): number {
    return this.camera.bearing
  }

  getPitch(): number {
    return this.camera.pitch
  }

  setFeatureState(
    target: { source: string; id: string | number },
    state: Record<string, unknown>,
  ): void {
    const key = `${target.source}:${target.id}`
    this.featureStates.set(key, { ...this.featureStates.get(key), ...state })
  }

  getFeatureState(target: {
    source: string
    id: string | number
  }): Record<string, unknown> {
    return this.featureStates.get(`${target.source}:${target.id}`) ?? {}
  }

  queryRenderedFeatures(
    _point: unknown,
    options: { layers: readonly string[] } = { layers: [] },
  ): unknown[] {
    return this.renderedFeatures(options.layers)
  }

  setRenderedFeatures(
    resolve: (layerIds: readonly string[]) => unknown[],
  ): void {
    this.renderedFeatures = resolve
  }
}

const createdMaps: MapMock[] = []

export function createdMapMocks(): readonly MapMock[] {
  return createdMaps
}

export function lastMapMock(): MapMock {
  const map = createdMaps[createdMaps.length - 1]
  if (!map) throw new Error('No MapLibre map was created')
  return map
}

export function setClusterExpansionZoom(zoom: number): void {
  clusterExpansionZoom = zoom
}

export function resetMapLibreMock(): void {
  createdMaps.length = 0
  clusterExpansionZoom = 8
}

export { LngLatBoundsMock }

export const NavigationControl = jest.fn()

const maplibreGlMock = {
  Map: MapMock,
  LngLatBounds: LngLatBoundsMock,
  NavigationControl,
}

export default maplibreGlMock
