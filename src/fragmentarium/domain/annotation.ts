import { immerable } from 'immer'

export interface Geometry {
  readonly x: number
  readonly y: number
  readonly height: number
  readonly width: number
  readonly type: string
}

export function isBoundingBoxTooSmall(geometry: Geometry): boolean {
  const minSize = Math.min(geometry.height, geometry.width)
  return minSize >= 0.3
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
  Damaged = 'Damaged',
  CompletelyBroken = 'CompletelyBroken',
  Predicted = 'Predicted',
  Struct = 'Struct',
  UnclearSign = 'UnclearSign',
  ColumnAtLine = 'ColumnAtLine',
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
