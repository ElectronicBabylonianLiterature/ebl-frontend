import _ from 'lodash'
import { LineOutline } from 'corpus/application/edit-lite/chapterOutline'

const translationPrefix = /^#tr\.[^:]*:\s*/

export function firstRow(text: string): string {
  return text.split('\n', 1)[0]
}

export function stripTranslationPrefix(row: string): string {
  return row.replace(translationPrefix, '')
}

export function summarizeReconstruction(line: LineOutline): string {
  return firstRow(line.variants[0]?.reconstruction ?? '')
}

export function summarizeTranslation(line: LineOutline): string {
  return stripTranslationPrefix(firstRow(line.translation))
}

export function countManuscriptLines(line: LineOutline): number {
  return _.sumBy(line.variants, (variant) => variant.manuscriptIds.length)
}

export function pluralize(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? '' : 's'}`
}
