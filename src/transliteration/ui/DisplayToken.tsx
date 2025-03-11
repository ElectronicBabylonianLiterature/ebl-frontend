import React, { FunctionComponent, PropsWithChildren } from 'react'
import classNames from 'classnames'
import _ from 'lodash'
import {
  effectiveEnclosure,
  EgyptianMetricalFeetSeparator,
  EnclosureType,
  Gloss,
  GreekLetter,
  NamedSign,
  Sign,
  Token,
  UnknownSign,
  Variant,
  Word,
} from 'transliteration/domain/token'
import { addAccents } from 'transliteration/domain/accents'
import {
  isEnclosure,
  isBreak,
  isAkkadianWord,
} from 'transliteration/domain/type-guards'
import { createModifierClasses, Modifiers } from './modifiers'
import EnclosureFlags from './EnclosureFlags'
import Flags from './Flags'
import SubIndex from 'transliteration/ui/Subindex'
import AkkadianWordComponent from 'akkadian/ui/akkadianWord'
import { PhoneticProps } from 'akkadian/application/phonetics/segments'

export type TokenWrapper = FunctionComponent<PropsWithChildren<unknown>>

export interface TokenProps {
  token: Token
  Wrapper: TokenWrapper
  tokenClasses?: readonly string[]
  showMeter?: boolean
  showIpa?: boolean
  phoneticProps?: PhoneticProps
}

export function DamagedFlag({
  sign: { flags },
  Wrapper,
  children,
}: PropsWithChildren<{
  sign: { flags: readonly string[] }
  Wrapper: TokenWrapper
}>): JSX.Element {
  return flags.includes('#') ? (
    <>
      <Wrapper>
        <span className="Transliteration__bracket">⸢</span>
      </Wrapper>
      {children}
      <Wrapper>
        <span className="Transliteration__bracket">⸣</span>
      </Wrapper>
    </>
  ) : (
    <>{children}</>
  )
}

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
        )
      )}
    </>
  )
}

function UnknownSignComponent({ token, Wrapper }: TokenProps): JSX.Element {
  const sign = token as UnknownSign
  const signs = {
    UnclearSign: sign.enclosureType.includes('BROKEN_AWAY') ? 'o' : 'x',
    UnidentifiedSign: 'X',
  }
  return (
    <DamagedFlag sign={sign} Wrapper={Wrapper}>
      <Wrapper>
        <EnclosureFlags token={sign}>
          {signs[sign.type]}
          <Flags flags={sign.flags} />
        </EnclosureFlags>
      </Wrapper>
    </DamagedFlag>
  )
}

function EgyptianMetricalFeetSeparatorComponent({
  token,
  Wrapper,
}: TokenProps): JSX.Element {
  const sign = token as EgyptianMetricalFeetSeparator
  return (
    <DamagedFlag sign={sign} Wrapper={Wrapper}>
      <Wrapper>
        <EnclosureFlags token={token}>
          <span className="Transliteration__EgyptianMetricalFeetSeparator--colored">
            {'•'}
          </span>
          <Flags flags={sign.flags} />
        </EnclosureFlags>
      </Wrapper>
    </DamagedFlag>
  )
}

function signComponent(nameProperty: string) {
  return function SignComponent({ token, Wrapper }: TokenProps): JSX.Element {
    const sign = token as Sign
    return (
      <DamagedFlag sign={sign} Wrapper={Wrapper}>
        <Wrapper>
          <EnclosureFlags token={token}>
            {sign[nameProperty]}
            <Modifiers modifiers={sign.modifiers} />
            <Flags flags={sign.flags} />
          </EnclosureFlags>
        </Wrapper>
      </DamagedFlag>
    )
  }
}

function NamedSignComponent({ token, Wrapper }: TokenProps): JSX.Element {
  const namedSign = token as NamedSign
  const effectiveEnclosures: EnclosureType[] = effectiveEnclosure(namedSign)
  const [parts, isSubIndexConverted] = addAccents(namedSign)
  const omitSubindex = namedSign.subIndex === 1 || isSubIndexConverted
  return (
    <DamagedFlag sign={namedSign} Wrapper={Wrapper}>
      <EnclosureFlags token={namedSign} enclosures={effectiveEnclosures}>
        {parts.map((token, index) =>
          isEnclosure(token) ? (
            <DisplayToken key={index} token={token} />
          ) : (
            <DisplayToken key={index} token={token} Wrapper={Wrapper} />
          )
        )}
        <Wrapper>
          {!omitSubindex && <SubIndex token={namedSign} />}
          <Modifiers modifiers={namedSign.modifiers} />
          <Flags flags={namedSign.flags} />
        </Wrapper>
        {namedSign.sign && (
          <>
            <span className="Transliteration__bracket">(</span>
            <DisplayToken token={namedSign.sign} Wrapper={Wrapper} />
            <span className="Transliteration__bracket">)</span>
          </>
        )}
        {namedSign.surrogate && !_.isEmpty(namedSign.surrogate) && (
          <>
            <span className="Transliteration__bracket">&lt;(</span>
            {namedSign.surrogate.map((token, index) => (
              <DisplayToken key={index} token={token} Wrapper={Wrapper} />
            ))}
            <span className="Transliteration__bracket">)&gt;</span>
          </>
        )}
      </EnclosureFlags>
    </DamagedFlag>
  )
}

function GreekLetterComponent({ token, Wrapper }: TokenProps): JSX.Element {
  const letter = token as GreekLetter
  return (
    <DamagedFlag sign={letter} Wrapper={Wrapper}>
      <Wrapper>
        <EnclosureFlags token={letter}>
          {letter.letter}
          <Flags flags={letter.flags} />
        </EnclosureFlags>
      </Wrapper>
    </DamagedFlag>
  )
}

function TabulationComponent({ Wrapper }: TokenProps): JSX.Element {
  return (
    <Wrapper>
      <span></span>
    </Wrapper>
  )
}

function LineBreakComponent({ Wrapper }: TokenProps): JSX.Element {
  return <Wrapper>|</Wrapper>
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
  showMeter?: boolean
  showIpa?: boolean
  phoneticProps?: PhoneticProps
}

export default function DisplayToken({
  token,
  bemModifiers = [],
  Wrapper = ({ children }: PropsWithChildren<unknown>): JSX.Element => (
    <>{children}</>
  ),
  showMeter = false,
  showIpa = false,
  phoneticProps = {},
}: DisplayTokenProps): JSX.Element {
  const TokenComponent = tokens.get(token.type) ?? DefaultToken
  const tokenClasses = [
    `Transliteration__${token.type}`,
    ...createModifierClasses(token.type, bemModifiers),
  ]

  return (
    <span
      className={classNames(tokenClasses, {
        hidden: isBreak(token) && !showMeter,
      })}
    >
      <TokenComponent
        token={token}
        Wrapper={Wrapper}
        tokenClasses={tokenClasses}
        showMeter={showMeter}
        showIpa={showIpa}
        {...(isAkkadianWord(token) && { phoneticProps })}
      />
    </span>
  )
}
