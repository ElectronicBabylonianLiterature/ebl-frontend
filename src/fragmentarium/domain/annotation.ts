import { immerable } from 'immer'

export interface Geometry {
  readonly x: number
  readonly y: number
  readonly height: number
  readonly width: number
  readonly type: string
}

export interface AnnotationData {
  readonly id?: string
  readonly sign?: string
  readonly value: string
  readonly path: readonly number[]
}

export interface RawAnnotation {
  readonly geometry?: Geometry
  readonly data?: AnnotationData
}

export default class Annotation implements RawAnnotation {
  [immerable] = true
  readonly geometry: Geometry
  readonly data: AnnotationData
  readonly outdated: boolean

  constructor(geometry: Geometry, data: AnnotationData) {
    this.geometry = geometry
    this.data = data
    this.outdated = false
  }
}
