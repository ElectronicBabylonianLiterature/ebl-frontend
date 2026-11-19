import _ from 'lodash'
import { toLineDto } from 'corpus/application/chapterDtoSerialization'
import { LinesUpdateDto } from 'corpus/application/edit-lite/ChapterEditSource'
import { Line } from 'corpus/domain/line'

export function toLineEditsDto(index: number, line: Line): LinesUpdateDto {
  return {
    new: [],
    deleted: [],
    edited: [{ index, line: toLineDto(line) }],
  }
}

export function areLinesEqual(first: Line, second: Line): boolean {
  return _.isEqual(toLineDto(first), toLineDto(second))
}
