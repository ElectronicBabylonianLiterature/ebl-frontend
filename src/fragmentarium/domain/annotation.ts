import { immerable } from 'immer'

export interface Geometry {
  readonly x: number
  readonly y: number
  readonly height: number
  readonly width: number
  readonly type: string
}
export enum AnnotationTokenType {
  CompoundGrapheme = 'CompoundGrapheme',
  HasSign = 'HasSign',
  Number = 'Number',
  SurfaceAtLine = 'SurfaceAtLine',
  RulingDollarLine = 'RulingDollarLine',
  Blank = 'Blank',
  Disabled = 'Disabled',
  PartiallyBroken = 'PartiallyBroken',
  CompletelyBroken = 'CompletelyBroken',
  Predicted = 'Predicted',
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
