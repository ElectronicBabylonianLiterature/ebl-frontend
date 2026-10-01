import { AbstractLine, LineBaseDto } from 'transliteration/domain/abstract-line'
import { MarkupPart } from 'transliteration/domain/markup'

export interface NoteLineDto extends LineBaseDto {
  readonly type: 'NoteLine'
  readonly prefix: '#note: '
  readonly parts: readonly MarkupPart[]
}

export class NoteLine extends AbstractLine {
  readonly type = 'NoteLine'
  readonly parts: readonly MarkupPart[]

  constructor(data: Pick<NoteLineDto, 'content' | 'parts'>) {
    super('#note: ', data.content)
    this.parts = data.parts
  }
}
