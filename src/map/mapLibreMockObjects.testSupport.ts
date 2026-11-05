export const mockSetLngLat = jest.fn()
export const mockSetDOMContent = jest.fn()
export const mockSetHTML = jest.fn()
export const mockPopupAddTo = jest.fn()
export const mockBoundsExtend = jest.fn()

export class MockLngLatBounds {
  private points: [number, number][] = []

  extend(coordinates: [number, number]) {
    this.points.push(coordinates)
    mockBoundsExtend(coordinates)
    return this
  }

  isEmpty() {
    return this.points.length === 0
  }
}

export class MockPopup {
  setLngLat(coordinates: [number, number]) {
    mockSetLngLat(coordinates)
    return this
  }

  setDOMContent(content: Node) {
    mockSetDOMContent(content)
    return this
  }

  setHTML(content: string) {
    mockSetHTML(content)
    return this
  }

  addTo(map: unknown) {
    mockPopupAddTo(map)
    return this
  }
}
