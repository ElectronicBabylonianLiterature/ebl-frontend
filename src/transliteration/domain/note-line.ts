import { AbstractLine, LineBaseDto } from './abstract-line'
import { MarkupPart } from './markup'

export interface NoteLineDto extends LineBaseDto {
  readonly type: 'NoteLine'
  readonly prefix: '#note: '
  readonly parts: readonly MarkupPart[]
}

export class NoteLine extends AbstractLine {
  readonly type = 'NoteLine'
  readonly parts: readonly MarkupPart[]

  constructor(data: NoteLineDto) {
    super('#note: ', data.content)
    this.parts = data.parts
  }
}
