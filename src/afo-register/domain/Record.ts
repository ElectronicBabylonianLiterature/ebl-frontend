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
  readonly textNumbers?: string[]

  constructor({
    text,
    textNumbers,
  }: {
    readonly text: string
    readonly textNumbers?: string[]
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

  get id(): string {
    return this.text + ' ' + this.textNumber
  }

  toMarkdownString(): string {
    const textNumber = this.textNumberToMarkdownString()
    const fragments = this.fragmentsToMarkdownString()
    const linesDiscussed = this.linesDiscussedToMarkdownString()
    const discussedBy = this.discussedByToMarkdownString()
    const discussedByNotes = this.discussedByNotesToMarkdownString()
    const footnote = this.footnotesToMarkdownString()
    const result = `${this.text}${textNumber}${fragments}${linesDiscussed}${discussedBy}${discussedByNotes}${footnote}`
    return result.replace(/\^([^^]+)\^/g, '<sup>$1</sup>')
  }

  setFragmentNumbers(fragmentNumbers: string[]): AfoRegisterRecord {
    return produce(this, (draft: Draft<AfoRegisterRecord>) => {
      draft.fragmentNumbers = fragmentNumbers
    })
  }

  private textNumberToMarkdownString(): string {
    return `${this.textNumber ? ` ${this.textNumber}` : ''}`
  }

  private fragmentsToMarkdownString(): string {
    if (!this.fragmentNumbers || this.fragmentNumbers?.length < 1) {
      return ''
    }
    const fragmentsString = this.fragmentNumbers
      .map(
        (fragmentNumber) =>
          `[${fragmentNumber}](/fragmentarium/${fragmentNumber})`
      )
      .join(', ')
    return ` (${fragmentsString})`
  }

  private linesDiscussedToMarkdownString(): string {
    return this.linesDiscussed ? `, ${this.linesDiscussed}` : ''
  }

  private discussedByToMarkdownString(): string {
    return this.discussedBy ? `: ${this.discussedBy}` : ''
  }

  private discussedByNotesToMarkdownString(): string {
    return this.discussedByNotes ? ` ${this.discussedByNotes}` : ''
  }

  private footnotesToMarkdownString(): string {
    return `<small class="text-black-50 ml-3">[${this.afoNumber}, ${this.page}]</small>`
  }
}
