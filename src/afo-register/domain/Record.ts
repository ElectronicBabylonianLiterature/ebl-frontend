import produce, { Draft, immerable } from 'immer'

interface RecordData {
  readonly afoNumber: string
  readonly page: string
  readonly text: string
  readonly textNumber: string
  readonly linesDiscussed?: string
  readonly discussedBy?: string
  readonly discussedByNotes?: string
  readonly fragmentNumbers?: string[]
}

export class AfoRegisterRecordSuggestion {
  [immerable] = true

  readonly text: string
  readonly textNumbers: string[]

  constructor({
    text,
    textNumbers,
  }: {
    readonly text: string
    readonly textNumbers: string[]
  }) {
    this.text = text
    this.textNumbers = textNumbers
  }
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
  readonly fragmentNumbers?: string[]

  constructor({
    afoNumber,
    page,
    text,
    textNumber,
    linesDiscussed,
    discussedBy,
    discussedByNotes,
    fragmentNumbers,
  }: RecordData) {
    this.afoNumber = afoNumber
    this.page = page
    this.text = text
    this.textNumber = textNumber
    this.linesDiscussed = linesDiscussed
    this.discussedBy = discussedBy
    this.discussedByNotes = discussedByNotes
    this.fragmentNumbers = fragmentNumbers
  }

  toMarkdownString(): string {
    let result = `${this.text}${this.textNumber ? ` ${this.textNumber}` : ''}`
    const fragments =
      this.fragmentNumbers && this.fragmentNumbers.length > 0
        ? ` (${this.fragmentsToMarkdownString()})`
        : ''
    const linesDiscussed = this.linesDiscussed ? `, ${this.linesDiscussed}` : ''
    const discussedBy = this.discussedBy ? `: ${this.discussedBy}` : ''
    const discussedByNotes = this.discussedByNotes
      ? ` ${this.discussedByNotes}`
      : ''
    const footnote = `<small class="text-black-50 ml-3">[${this.afoNumber}, ${this.page}]</small>`
    result = `${result}${fragments}${linesDiscussed}${discussedBy}${discussedByNotes}${footnote}`
    return result.replace(/\^([^^]+)\^/g, '<sup>$1</sup>')
  }

  private fragmentsToMarkdownString(): string {
    if (!this.fragmentNumbers) {
      return ''
    }
    return this.fragmentNumbers
      .map(
        (fragmentNumber) =>
          `[${fragmentNumber}](/fragmentarium/${fragmentNumber})`
      )
      .join(', ')
  }

  setFragmentNumbers(fragmentNumbers: string[]): AfoRegisterRecord {
    return produce(this, (draft: Draft<AfoRegisterRecord>) => {
      draft.fragmentNumbers = fragmentNumbers
    })
  }
}
