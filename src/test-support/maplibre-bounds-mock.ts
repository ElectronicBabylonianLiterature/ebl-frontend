export class LngLatBoundsMock {
  private southWest: [number, number] | null = null
  private northEast: [number, number] | null = null

  extend(coordinates: [number, number]): this {
    const [longitude, latitude] = coordinates
    if (!this.southWest || !this.northEast) {
      this.southWest = [longitude, latitude]
      this.northEast = [longitude, latitude]
      return this
    }

    this.southWest = [
      Math.min(this.southWest[0], longitude),
      Math.min(this.southWest[1], latitude),
    ]
    this.northEast = [
      Math.max(this.northEast[0], longitude),
      Math.max(this.northEast[1], latitude),
    ]
    return this
  }

  isEmpty(): boolean {
    return this.southWest === null
  }

  toArray(): [[number, number], [number, number]] | null {
    return this.southWest && this.northEast
      ? [this.southWest, this.northEast]
      : null
  }
}
