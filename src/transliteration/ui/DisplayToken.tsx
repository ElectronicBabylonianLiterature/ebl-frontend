import React, { FunctionComponent, PropsWithChildren } from 'react'
import classNames from 'classnames'
import _ from 'lodash'
import {
  effectiveEnclosure,
  EnclosureType,
  Gloss,
  NamedSign,
  Token,
  Variant,
  Word,
} from 'transliteration/domain/token'
import { addAccents } from 'transliteration/domain/accents'
import { isEnclosure, isAkkadianWord } from 'transliteration/domain/type-guards'
import { createModifierClasses, Modifiers } from 'transliteration/ui/modifiers'
import EnclosureFlags from 'transliteration/ui/EnclosureFlags'
import Flags from 'transliteration/ui/Flags'
import SubIndex from 'transliteration/ui/Subindex'
import AkkadianWordComponent from 'akkadian/ui/akkadianWord'
import { PhoneticProps } from 'akkadian/application/phonetics/segments'
import {
  DamagedFlag,
  EgyptianMetricalFeetSeparatorComponent,
  GreekLetterComponent,
  LineBreakComponent,
  signComponent,
  TabulationComponent,
  TokenProps,
  TokenWrapper,
  UnknownSignComponent,
} from 'transliteration/ui/SignTokens'

export { DamagedFlag } from 'transliteration/ui/SignTokens'
export type { TokenProps, TokenWrapper } from 'transliteration/ui/SignTokens'

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
          ),
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
