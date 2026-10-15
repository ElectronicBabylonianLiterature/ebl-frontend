import React, { FunctionComponent, PropsWithChildren } from 'react'
import classNames from 'classnames'
import { Gloss, Token, Variant, Word } from 'transliteration/domain/token'
import { isEnclosure, isAkkadianWord } from 'transliteration/domain/type-guards'
import { createModifierClasses } from 'transliteration/ui/modifiers'
import EnclosureFlags from 'transliteration/ui/EnclosureFlags'
import AkkadianWordComponent from 'akkadian/ui/akkadianWord'
import { PhoneticProps } from 'akkadian/application/phonetics/segments'
import { TokenProps, TokenWrapper } from 'transliteration/ui/DisplayTokenParts'
import {
  EgyptianMetricalFeetSeparatorComponent,
  GreekLetterComponent,
  LineBreakComponent,
  NamedSignComponent,
  signComponent,
  TabulationComponent,
  UnknownSignComponent,
} from 'transliteration/ui/DisplaySignTokens'

export { DamagedFlag } from 'transliteration/ui/DisplayTokenParts'
export type {
  TokenProps,
  TokenWrapper,
} from 'transliteration/ui/DisplayTokenParts'

function DefaultToken({ token, Wrapper }: TokenProps): JSX.Element {
  return (
    <EnclosureFlags token={token}>
      {token.parts ? (
        token.parts.map((token, index) => (
          <DisplayToken key={index} token={token} Wrapper={Wrapper} />
        ))
      ) : isEnclosure(token) ? (
        token.value
      ) : (
        <Wrapper>{token.value}</Wrapper>
      )}
    </EnclosureFlags>
  )
}

function VariantComponent({ token, Wrapper }: TokenProps): JSX.Element {
  return (
    <>
      {(token as Variant).tokens.map((token, index) => (
        <React.Fragment key={index}>
          {index > 0 ? <Wrapper>/</Wrapper> : null}
          <DisplayToken token={token} Wrapper={Wrapper} />
        </React.Fragment>
      ))}
    </>
  )
}

function GlossComponent({ token, Wrapper }: TokenProps): JSX.Element {
  const gloss = token as Gloss
  const GlossWrapper: TokenWrapper = ({
    children,
  }: PropsWithChildren<unknown>) => (
    <Wrapper>
      <sup>{children}</sup>
    </Wrapper>
  )
  return (
    <>
      <span
        className={classNames([
          'Transliteration__glossJoiner',
          ...createModifierClasses('glossJoiner', token.enclosureType),
        ])}
      >
        <GlossWrapper>.</GlossWrapper>
      </span>
      {gloss.parts.map((token, index) =>
        isEnclosure(token) ? (
          <DisplayToken key={index} token={token} />
        ) : (
          <DisplayToken key={index} token={token} Wrapper={GlossWrapper} />
        ),
      )}
    </>
  )
}

function WordComponent({
  token,
  Wrapper,
  phoneticProps,
}: TokenProps): JSX.Element {
  const word = token as Word
  return (
    <EnclosureFlags token={token}>
      {word.parts.map((token, index) => (
        <DisplayToken
          key={index}
          token={token}
          Wrapper={Wrapper}
          phoneticProps={phoneticProps}
        />
      ))}
    </EnclosureFlags>
  )
}

const tokens: ReadonlyMap<
  Token['type'],
  FunctionComponent<{
    token: Token
    Wrapper: TokenWrapper
  }>
> = new Map([
  ['UnknownNumberOfSigns', (): JSX.Element => <>…</>],
  ['Variant', VariantComponent],
  ['EgyptianMetricalFeetSeparator', EgyptianMetricalFeetSeparatorComponent],
  ['Reading', NamedSignComponent],
  ['Logogram', NamedSignComponent],
  ['Number', NamedSignComponent],
  ['Divider', signComponent('divider')],
  ['Grapheme', signComponent('name')],
  ['UnclearSign', UnknownSignComponent],
  ['UnidentifiedSign', UnknownSignComponent],
  ['Determinative', GlossComponent],
  ['PhoneticGloss', GlossComponent],
  ['LinguisticGloss', GlossComponent],
  ['WordOmitted', (): JSX.Element => <>ø</>],
  ['Tabulation', TabulationComponent],
  ['LineBreak', LineBreakComponent],
  ['GreekLetter', GreekLetterComponent],
  ['AkkadianWord', AkkadianWordComponent],
  ['Word', WordComponent],
])

interface DisplayTokenProps {
  token: Token
  bemModifiers?: readonly string[]
  Wrapper?: FunctionComponent<PropsWithChildren<unknown>>
  phoneticProps?: PhoneticProps
}

export default function DisplayToken({
  token,
  bemModifiers = [],
  Wrapper = ({ children }: PropsWithChildren<unknown>): JSX.Element => (
    <>{children}</>
  ),
  phoneticProps = {},
}: DisplayTokenProps): JSX.Element {
  const TokenComponent = tokens.get(token.type) ?? DefaultToken
  const tokenClasses = [
    `Transliteration__${token.type}`,
    ...createModifierClasses(token.type, bemModifiers),
  ]

  return (
    <span className={classNames(tokenClasses)}>
      <TokenComponent
        token={token}
        Wrapper={Wrapper}
        tokenClasses={tokenClasses}
        {...(isAkkadianWord(token) && { phoneticProps })}
      />
    </span>
  )
}
