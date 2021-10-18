import { immerable } from 'immer'
import { AnnotationTokenType } from 'fragmentarium/ui/image-annotation/annotation-tool/annotation-token'

export interface Geometry {
  readonly x: number
  readonly y: number
  readonly height: number
  readonly width: number
  readonly type: string
}

export interface AnnotationData {
  readonly id?: string
  readonly type: AnnotationTokenType
  readonly signName: string
  readonly value: string
  readonly path: readonly number[]
}

interface Selection {
  mode: 'SELECTING' | 'EDITING'
  anchorX: number
  anchorY: number
  showEditor?: boolean
}

export interface RawAnnotation {
  readonly selection?: Selection
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
