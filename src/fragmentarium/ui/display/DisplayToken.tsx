import React, { FunctionComponent, PropsWithChildren } from 'react'
import classNames from 'classnames'
import _ from 'lodash'
import {
  Token,
  Variant,
  NamedSign,
  UnknownSign,
  Gloss,
  Sign,
  EnclosureType
} from 'fragmentarium/domain/token'
import addAccents from './addAccents'
import { isEnclosure } from './type-guards'

export type TokenWrapper = FunctionComponent<PropsWithChildren<{}>>

interface TokenProps {
  token: Token
  Wrapper: TokenWrapper
}

function Modifiers({
  modifiers
}: {
  modifiers: readonly string[]
}): JSX.Element {
  return (
    <sup className="Transliteration__modifier">
      {modifiers.map(modifier => modifier.slice(1)).join('')}
    </sup>
  )
}

function EnclosureFlags({
  token,
  enclosures,
  children
}: PropsWithChildren<{
  token: Token
  enclosures?: readonly EnclosureType[]
}>): JSX.Element {
  const element = `Transliteration__${token.type}`
  return (
    <span
      className={classNames(
        (enclosures ?? token.enclosureType).map(
          enclosureType => `${element}--${enclosureType}`
        )
      )}
    >
      {children}
    </span>
  )
}

function DamagedFlag({
  sign: { type, flags },
  Wrapper,
  children
}: PropsWithChildren<{
  sign: { type: string; flags: readonly string[] }
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

function Flags({ flags }: { flags: readonly string[] }): JSX.Element {
  return (
    <sup className="Transliteration__flag">
      {flags.filter(flag => flag !== '#').join('')}
    </sup>
  )
}

function DefaultToken({ token, Wrapper }: TokenProps): JSX.Element {
  return (
    <>
      {token.parts ? (
        token.parts.map((token, index) => (
          <DisplayToken key={index} token={token} Wrapper={Wrapper} />
        ))
      ) : isEnclosure(token) ? (
        token.value
      ) : (
        <Wrapper>{token.value}</Wrapper>
      )}
    </>
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
  const GlossWrapper: TokenWrapper = ({ children }) => (
    <Wrapper>
      <sup>{children}</sup>
    </Wrapper>
  )
  return (
    <>
      <span className="Transliteration__glossJoiner">
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
    UnidentifiedSign: 'X'
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
  const partEnclosures: (readonly EnclosureType[])[] = namedSign.nameParts.map(
    (part: Token): readonly EnclosureType[] => part.enclosureType
  )
  const effectiveEnclosures: EnclosureType[] = _.intersection(...partEnclosures)
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
          {!omitSubindex && (
            <sub className="Transliteration__subIndex">
              {namedSign.subIndex || 'x'}
            </sub>
          )}
          <Modifiers modifiers={namedSign.modifiers} />
          <Flags flags={namedSign.flags} />
        </Wrapper>
        {namedSign.sign && (
          <>
            <Wrapper>
              <span className="Transliteration__bracket">(</span>
            </Wrapper>
            <DisplayToken token={namedSign.sign} Wrapper={Wrapper} />
            <Wrapper>
              <span className="Transliteration__bracket">)</span>
            </Wrapper>
          </>
        )}
        {namedSign.surrogate && !_.isEmpty(namedSign.surrogate) && (
          <>
            <Wrapper>
              <span className="Transliteration__bracket">&lt;(</span>
            </Wrapper>
            {namedSign.surrogate.map((token, index) => (
              <DisplayToken key={index} token={token} Wrapper={Wrapper} />
            ))}
            <Wrapper>
              <span className="Transliteration__bracket">)&gt;</span>
            </Wrapper>
          </>
        )}
      </EnclosureFlags>
    </DamagedFlag>
  )
}

function TabulationComponent({ token, Wrapper }: TokenProps): JSX.Element {
  return (
    <Wrapper>
      <span></span>
    </Wrapper>
  )
}

const tokens: ReadonlyMap<
  string,
  FunctionComponent<{
    token: Token
    Wrapper: TokenWrapper
  }>
> = new Map([
  ['UnknownNumberOfSigns', (): JSX.Element => <>…</>],
  ['Variant', VariantComponent],
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
  ['Tabulation', TabulationComponent]
])

export default function DisplayToken({
  token,
  bemModifiers: modifiers = [],
  Wrapper = ({ children }: PropsWithChildren<{}>): JSX.Element => (
    <>{children}</>
  )
}: {
  token: Token
  bemModifiers?: readonly string[]
  Wrapper?: FunctionComponent<PropsWithChildren<{}>>
}): JSX.Element {
  const TokenComponent = tokens.get(token.type) ?? DefaultToken
  const element = `Transliteration__${token.type}`
  return (
    <span
      className={classNames([
        element,
        ...modifiers.map(modifier => `${element}--${modifier}`)
      ])}
    >
      <TokenComponent token={token} Wrapper={Wrapper} />
    </span>
  )
}
