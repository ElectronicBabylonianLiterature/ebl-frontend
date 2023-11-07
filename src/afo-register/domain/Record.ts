import { immerable } from 'immer'
import { Fragment } from 'fragmentarium/domain/fragment'

interface RecordData {
  readonly afoNumber: string
  readonly page: string
  readonly text: string
  readonly textNumber: string
  readonly linesDiscussed?: string
  readonly discussedBy?: string
  readonly discussedByNotes?: string
}

export default class AfoRegisterRecord {
  [immerable] = true

  readonly afoNumber: string
  readonly page: string
  readonly text: string
  readonly textNumber: string
  readonly linesDiscussed?: string
  readonly discussedBy?: string
  readonly discussedByNotes?: string

  constructor({
    afoNumber,
    page,
    text,
    textNumber,
    linesDiscussed,
    discussedBy,
    discussedByNotes,
  }: RecordData) {
    this.afoNumber = afoNumber
    this.page = page
    this.text = text
    this.textNumber = textNumber
    this.linesDiscussed = linesDiscussed
    this.discussedBy = discussedBy
    this.discussedByNotes = discussedByNotes
  }

  toMarkdownString(fragments: Fragment[]): string {
    let result = this.text + (this.textNumber ? ' ' + this.textNumber : '')
    const linkToFragment = this.findLinkToFragment(fragments)
    if (linkToFragment) result += `(${linkToFragment})`
    if (this.linesDiscussed) result += ', ' + this.linesDiscussed
    if (this.discussedBy) result += ': ' + this.discussedBy
    if (this.discussedByNotes) result += ' ' + this.discussedByNotes

    result += `<small class="text-black-50 ml-3">${
      this.afoNumber + this.page
    }</small>`

    result = result.replace(/\^([^^]+)\^/g, '<sup>$1</sup>')
    return result
  }

  findLinkToFragment(fragments: Fragment[]): string {
    const reference = this.text + ' ' + this.textNumber
    const matchingFragments = fragments.filter((fragment) =>
      fragment.traditionalReferences.includes(reference)
    )
    if (matchingFragments.length === 0) return ''
    return matchingFragments.map((fragment) => fragment.number).join(', ')
  }
}
