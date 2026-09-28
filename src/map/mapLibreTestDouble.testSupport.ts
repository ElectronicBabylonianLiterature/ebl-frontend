interface Dependencies {
  readonly mapInstance: object
  readonly constructionError: () => unknown
  readonly boundsExtend: (coordinates: [number, number]) => void
  readonly setLngLat: (coordinates: [number, number]) => void
  readonly setDOMContent: (content: Node) => void
  readonly setHTML: (content: string) => void
  readonly addPopupTo: (map: unknown) => void
}

export function createMapLibreTestDouble(dependencies: Dependencies) {
  class MockMap {
    constructor() {
      const error = dependencies.constructionError()
      if (error) throw error
      return dependencies.mapInstance
    }
  }

  class MockLngLatBounds {
    private points: [number, number][] = []

    extend(coordinates: [number, number]) {
      this.points.push(coordinates)
      dependencies.boundsExtend(coordinates)
      return this
    }

    isEmpty() {
      return this.points.length === 0
    }
  }

  class MockPopup {
    setLngLat(coordinates: [number, number]) {
      dependencies.setLngLat(coordinates)
      return this
    }

    setDOMContent(content: Node) {
      dependencies.setDOMContent(content)
      return this
    }

    setHTML(content: string) {
      dependencies.setHTML(content)
      return this
    }

    addTo(map: unknown) {
      dependencies.addPopupTo(map)
      return this
    }
  }

  return {
    Map: MockMap,
    NavigationControl: jest.fn(),
    LngLatBounds: MockLngLatBounds,
    Popup: MockPopup,
  }
}
