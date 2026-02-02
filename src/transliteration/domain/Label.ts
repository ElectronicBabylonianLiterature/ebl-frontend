import { produce, immerable, Draft, castDraft } from 'immer'
import { LineNumber, LineNumberRange } from './line-number'
import { ObjectLabel, SurfaceLabel, ColumnLabel } from './labels'

export default class Label {
  readonly [immerable] = true
  readonly object: ObjectLabel | null = null
  readonly surface: SurfaceLabel | null = null
  readonly column: ColumnLabel | null = null
  readonly line: LineNumber | LineNumberRange | null = null

  constructor(
    object: ObjectLabel | null = null,
    surface: SurfaceLabel | null = null,
    column: ColumnLabel | null = null,
    line: LineNumber | LineNumberRange | null = null,
  ) {
    this.object = object
    this.surface = surface
    this.column = column
    this.line = line
  }

  setObject(object: ObjectLabel): Label {
    return produce(this, (draft: Draft<Label>) => {
      draft.object = castDraft(object)
    })
  }

  setSurface(surface: SurfaceLabel): Label {
    return produce(this, (draft: Draft<Label>) => {
      draft.surface = castDraft(surface)
    })
  }

  setColumn(column: ColumnLabel): Label {
    return produce(this, (draft: Draft<Label>) => {
      draft.column = castDraft(column)
    })
  }

  setLineNumber(line: LineNumber | LineNumberRange): Label {
    return produce(this, (draft: Draft<Label>) => {
      draft.line = castDraft(line)
    })
  }
}
