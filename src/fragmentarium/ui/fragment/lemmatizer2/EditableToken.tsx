import React from 'react'
import './Lemmatizer.sass'
import { Badge } from 'react-bootstrap'
import { Token } from 'transliteration/domain/token'
import classNames from 'classnames'

export default class EditableToken {
  public index: number
  public token: Token
  public lineIndex: number
  public newLemmas: string[] | null = null
  public isSelected = false
  public isPending = false
  public isGlowing = false

  constructor(token: Token, index: number, lineIndex: number) {
    this.token = token
    this.index = index
    this.lineIndex = lineIndex
  }

  get isDirty(): boolean {
    return this.newLemmas !== null
  }
  get oldLemmas(): readonly string[] {
    return this.token.uniqueLemma || []
  }

  glow = (state = true): void => {
    this.isGlowing = state
    if (state) {
      setTimeout(() => this.glow(false), 200)
    }
  }

  updateLemmas = (lemmas: string[] | null): void => {
    this.newLemmas = lemmas
    this.glow()
  }

  get lemmas(): string[] {
    const lemmas =
      (this.isDirty ? this.newLemmas : this.token.uniqueLemma) || []
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

  markAsNew(lemma: string): boolean {
    return !this.oldLemmas.includes(lemma)
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
      >
        {children}
        {<this.DisplayLemmas />}
      </span>
    )
  }

  DisplayLemmas = (): JSX.Element => {
    const lemmas =
      this.lemmas.length === 0 && this.isDirty ? ['---'] : this.lemmas
    return (
      <>
        {lemmas.map((lemma, index) => (
          <span className={'lemmatizer__lemma-preview'} key={index}>
            {lemma}
            {this.markAsNew(lemma) && (
              <>
                &nbsp;
                <Badge variant="warning">New</Badge>
              </>
            )}
          </span>
        ))}
      </>
    )
  }
}
