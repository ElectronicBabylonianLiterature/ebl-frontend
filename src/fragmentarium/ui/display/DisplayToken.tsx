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

function createModifierClasses(
  element: string,
  modifiers: readonly string[]
): readonly string[] {
  return modifiers.map(modifier => `Transliteration__${element}--${modifier}`)
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
  return (
    <span
      className={classNames(
        createModifierClasses(token.type, enclosures ?? token.enclosureType)
      )}
    >
      {children}
    </span>
  )
}

function DamagedFlag({
  sign: { flags },
  Wrapper,
  children
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

function Flags({ flags }: { flags: readonly string[] }): JSX.Element {
  return (
    <sup className="Transliteration__flag">
      {flags.filter(flag => flag !== '#').join('')}
    </sup>
  )
}

function SubIndex({ token }: { token: NamedSign }): JSX.Element {
  const unicodeSubscript: ReadonlyMap<string, string> = new Map([
    ['0', '₀'],
    ['1', '₁'],
    ['2', '₂'],
    ['3', '₃'],
    ['4', '₄'],
    ['5', '₅'],
    ['6', '₆'],
    ['7', '₇'],
    ['8', '₈'],
    ['9', '₉']
  ])

  const subIndex =
    token.subIndex
      ?.toString()
      .split('')
      .map(number => unicodeSubscript.get(number))
      .join('') ?? 'ₓ'
  return <span className="Transliteration__subIndex">{subIndex}</span>
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
  const GlossWrapper: TokenWrapper = ({ children }: PropsWithChildren<{}>) => (
    <Wrapper>
      <sup>{children}</sup>
    </Wrapper>
  )
  return (
    <>
      <span
        className={classNames([
          'Transliteration__glossJoiner',
          ...createModifierClasses('glossJoiner', token.enclosureType)
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
  return (
    <span
      className={classNames([
        `Transliteration__${token.type}`,
        ...createModifierClasses(token.type, modifiers)
      ])}
    >
      <TokenComponent token={token} Wrapper={Wrapper} />
    </span>
  )
}
