import _ from 'lodash'
import { toLineDto } from 'corpus/application/chapterDtoSerialization'
import { LinesUpdateDto } from 'corpus/application/edit-lite/ChapterEditSource'
import { Line } from 'corpus/domain/line'

export const noLineChanges: LinesUpdateDto = {
  new: [],
  deleted: [],
  edited: [],
}

export function toLineEditsDto(index: number, line: Line): LinesUpdateDto {
  return { ...noLineChanges, edited: [{ index, line: toLineDto(line) }] }
}

export function toNewLineDto(line: Line): LinesUpdateDto {
  return { ...noLineChanges, new: [toLineDto(line)] }
}

export function toDeletedLineDto(index: number): LinesUpdateDto {
  return { ...noLineChanges, deleted: [index] }
}

export function areLinesEqual(first: Line, second: Line): boolean {
  return _.isEqual(toLineDto(first), toLineDto(second))
}
