import { ColumnLabel, SurfaceLabel, ObjectLabel } from './labels'
import { AbstractLine, DollarAndAtLineDto } from './abstract-line'

export abstract class AtLine extends AbstractLine {
  readonly displayValue: string

  constructor(data: DollarAndAtLineDto) {
    super('@', data.content)
    this.displayValue = `(${data.displayValue})`
  }
}

export interface SealAtLineDto extends DollarAndAtLineDto {
  readonly type: 'SealAtLine'
  readonly number: number
}

export class SealAtLine extends AtLine {
  readonly type = 'SealAtLine'
  readonly number: number

  constructor(data: SealAtLineDto) {
    super(data)
    this.number = data.number
  }
}

export interface HeadingAtLineDto extends DollarAndAtLineDto {
  readonly type: 'HeadingAtLine'
  readonly number: number
}

export class HeadingAtLine extends AtLine {
  readonly type = 'HeadingAtLine'
  readonly number: number

  constructor(data: HeadingAtLineDto) {
    super(data)
    this.number = data.number
  }
}

export interface ColumnAtLineDto extends DollarAndAtLineDto {
  readonly type: 'ColumnAtLine'
  readonly column_label: ColumnLabel
}

export class ColumnAtLine extends AtLine {
  readonly type = 'ColumnAtLine'
  readonly label: ColumnLabel

  constructor(data: ColumnAtLineDto) {
    super(data)
    this.label = data.column_label
  }
}

export interface DiscourseAtLineDto extends DollarAndAtLineDto {
  readonly type: 'DiscourseAtLine'
  readonly discourse_label: string
}

export class DiscourseAtLine extends AtLine {
  readonly type = 'DiscourseAtLine'
  readonly label: string

  constructor(data: DiscourseAtLineDto) {
    super(data)
    this.label = data.discourse_label
  }
}

export interface SurfaceAtLineDto extends DollarAndAtLineDto {
  readonly type: 'SurfaceAtLine'
  readonly surface_label: SurfaceLabel
}

export class SurfaceAtLine extends AtLine {
  readonly type = 'SurfaceAtLine'
  readonly label: SurfaceLabel

  constructor(data: SurfaceAtLineDto) {
    super(data)
    this.label = data.surface_label
  }
}

export interface ObjectAtLineDto extends DollarAndAtLineDto {
  readonly type: 'ObjectAtLine'
  readonly label: ObjectLabel
}

export class ObjectAtLine extends AtLine {
  readonly type = 'ObjectAtLine'
  readonly label: ObjectLabel

  constructor(data: ObjectAtLineDto) {
    super(data)
    this.label = data.label
  }
}

export interface DivisionAtLineDto extends DollarAndAtLineDto {
  readonly type: 'DivisionAtLine'
  readonly number: number | null
  readonly text: string
}

export class DivisionAtLine extends AtLine {
  readonly type = 'DivisionAtLine'
  readonly number: number | null
  readonly text: string

  constructor(data: DivisionAtLineDto) {
    super(data)
    this.number = data.number
    this.text = data.text
  }
}

export interface CompositeAtLineDto extends DollarAndAtLineDto {
  readonly type: 'CompositeAtLine'
  readonly composite: string
  readonly number: number | null
  readonly text: string
}

export class CompositeAtLine extends AtLine {
  readonly type = 'CompositeAtLine'
  readonly composite: string
  readonly number: number | null
  readonly text: string

  constructor(data: CompositeAtLineDto) {
    super(data)
    this.composite = data.composite
    this.number = data.number
    this.text = data.text
  }
}
