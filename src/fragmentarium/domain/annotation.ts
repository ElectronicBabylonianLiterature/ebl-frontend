export interface Geometry {
  readonly x: number
  readonly y: number
  readonly height: number
  readonly width: number
  readonly type: string
}

export interface AnnotationData {
  readonly id?: string
  readonly value: string
  readonly path: readonly number[]
}

export default interface Annotation {
  readonly geometry: Geometry
  readonly data: AnnotationData
  readonly outdated?: boolean
}
