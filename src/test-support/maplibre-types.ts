export type MapEventListener = (event?: unknown) => void

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
