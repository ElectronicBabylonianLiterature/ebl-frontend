interface Dependencies {
  readonly mapInstance: object
  readonly constructionError: () => unknown
  readonly boundsExtend: (coordinates: [number, number]) => void
  readonly setLngLat: (coordinates: [number, number]) => void
  readonly setDOMContent: (content: Node) => void
  readonly setHTML: (content: string) => void
  readonly addPopupTo: (map: unknown) => void
}

let dependencies: Dependencies | null = null

function configuredDependencies(): Dependencies {
  if (dependencies === null) {
    throw new Error('MapLibre test double is not configured')
  }
  return dependencies
}

class MockMap {
  constructor() {
    const configured = configuredDependencies()
    const error = configured.constructionError()
    if (error) throw error
    return configured.mapInstance
  }
}

class MockLngLatBounds {
  private points: [number, number][] = []

  extend(coordinates: [number, number]) {
    this.points.push(coordinates)
    configuredDependencies().boundsExtend(coordinates)
    return this
  }

  isEmpty() {
    return this.points.length === 0
  }
}

class MockPopup {
  setLngLat(coordinates: [number, number]) {
    configuredDependencies().setLngLat(coordinates)
    return this
  }

  setDOMContent(content: Node) {
    configuredDependencies().setDOMContent(content)
    return this
  }

  setHTML(content: string) {
    configuredDependencies().setHTML(content)
    return this
  }

  addTo(map: unknown) {
    configuredDependencies().addPopupTo(map)
    return this
  }
}

export function createMapLibreTestDouble(configuration: Dependencies) {
  dependencies = configuration
  return {
    Map: MockMap,
    NavigationControl: jest.fn(),
    LngLatBounds: MockLngLatBounds,
    Popup: MockPopup,
  }
}
