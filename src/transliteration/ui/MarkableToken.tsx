import React from 'react'
import { Protocol, Token } from 'transliteration/domain/token'
import { isEnclosure } from 'transliteration/domain/type-guards'
import DisplayToken from './DisplayToken'
import { GlossWrapper } from './LineAccumulator'

export class MarkableToken {
  readonly token: Token
  readonly index: number
  readonly isInGloss: boolean
  readonly protocol: Protocol | null = null
  readonly language: string
  readonly hasLeadingWhitespace: boolean

  constructor(
    token: Token,
    index: number,
    isInGloss: boolean,
    protocol: Protocol | null,
    language: string,
    hasLeadingWhitespace?: boolean
  ) {
    this.token = token
    this.index = index
    this.isInGloss = isInGloss
    this.protocol = protocol
    this.language = language
    this.hasLeadingWhitespace = hasLeadingWhitespace || false
  }

  display(): JSX.Element {
    return (
      <>
        {this.hasLeadingWhitespace && ' '}
        <DisplayToken
          token={this.token}
          bemModifiers={
            this.protocol === null
              ? [this.language]
              : [
                  this.language,
                  this.protocol.replace('!', 'commentary-protocol-'),
                ]
          }
          Wrapper={
            this.isInGloss && !isEnclosure(this.token)
              ? GlossWrapper
              : undefined
          }
          isInPopover={true}
        />
      </>
    )
  }
}
