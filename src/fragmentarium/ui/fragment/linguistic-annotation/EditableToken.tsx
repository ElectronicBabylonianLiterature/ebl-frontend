import React, { PropsWithChildren } from 'react'
import { Badge } from 'react-bootstrap'
import { Token } from 'transliteration/domain/token'
import classNames from 'classnames'
import { LemmaOption } from 'fragmentarium/ui/lemmatization/LemmaSelectionForm'
import _ from 'lodash'

function DisplayLemmaEntry({
  showBatch,
  isSuggestion = false,
  children,
}: PropsWithChildren<{
  showBatch: boolean
  isSuggestion?: boolean
}>): JSX.Element {
  return (
    <span className={'lemmatizer__lemma-preview'}>
      {children}
      {showBatch && (
        <>
          &nbsp;
          {isSuggestion ? (
            <Badge bg="warning">
              New
              <i className={'fas fa-wand-magic-sparkles'}></i>
            </Badge>
          ) : (
            <Badge bg="success">New</Badge>
          )}
        </>
      )}
    </span>
  )
}

function isEquivalent(
  a: readonly LemmaOption[] | null,
  b: readonly LemmaOption[] | null,
): boolean {
  return _.isEqual(_.map(a, 'value'), _.map(b, 'value'))
}

export default class EditableToken {
  public indexInText: number
  public indexInLine: number
  public token: Token
  public lineIndex: number
  public initialLemmas: readonly LemmaOption[]
  public newLemmas: LemmaOption[] | null = null
  public isSelected = false
  public isPending = false
  public isGlowing = false

  constructor(
    token: Token,
    indexInText: number,
    indexInLine: number,
    lineIndex: number,
    lemmas: readonly LemmaOption[],
  ) {
    this.token = token
    this.indexInText = indexInText
    this.indexInLine = indexInLine
    this.lineIndex = lineIndex
    this.initialLemmas = lemmas
  }

  get isDirty(): boolean {
    return this.newLemmas !== null
  }

  glow = (state = true): void => {
    this.isGlowing = state
    if (state) {
      setTimeout(() => this.glow(false), 200)
    }
  }

  updateLemmas = (lemmas: LemmaOption[] | null): void => {
    if (!isEquivalent(this.initialLemmas, lemmas)) {
      this.newLemmas = lemmas
      this.glow()
    } else {
      this.newLemmas = null
    }
  }

  confirmSuggestion = (): void => {
    if (_.some(this.newLemmas, 'isSuggestion')) {
      this.updateLemmas(
        this.newLemmas?.map((lemma) => lemma.unsetSuggestion()) || null,
      )
    }
  }

  get lemmas(): LemmaOption[] {
    const lemmas = (this.isDirty ? this.newLemmas : this.initialLemmas) || []
    return [...lemmas]
  }

  get cleanValue(): string {
    return this.token.cleanValue
  }

  select(): EditableToken {
    this.isSelected = true
    return this
  }

  unselect(): EditableToken {
    this.isSelected = false
    return this
  }

  private isNewLemma(lemma: LemmaOption): boolean {
    return !_.some(this.initialLemmas, (other) => lemma.value === other.value)
  }

  get isConfirmed(): boolean {
    return !_.some(this.lemmas, 'isSuggestion')
  }

  Display = ({
    onClick,
    children,
  }: {
    onClick: () => void
    children: React.ReactNode
  }): JSX.Element => {
    return (
      <span
        className={classNames('lemmatizer__token-wrapper', 'editable', {
          selected: this.isSelected,
          pending: this.isPending,
          glowing: this.isGlowing,
        })}
        onClick={onClick}
        role="button"
      >
        {children}
        {<this.DisplayLemmas />}
      </span>
    )
  }

  DisplayLemmas = (): JSX.Element => {
    return (
      <>
        {_.isEmpty(this.lemmas) ? (
          this.isDirty ? (
            <DisplayLemmaEntry showBatch={true}>---</DisplayLemmaEntry>
          ) : (
            <Badge bg="danger">Empty</Badge>
          )
        ) : (
          this.lemmas.map((lemma, index) => (
            <DisplayLemmaEntry
              showBatch={this.isNewLemma(lemma)}
              isSuggestion={lemma.isSuggestion}
              key={index}
            >
              {lemma.value}
            </DisplayLemmaEntry>
          ))
        )}
      </>
    )
  }
}
