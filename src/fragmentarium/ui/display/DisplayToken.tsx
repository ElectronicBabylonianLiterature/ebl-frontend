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
} from 'fragmentarium/domain/text'

const graveAccent = '\u0300'
const acuteAccent = '\u0301'
const breve = '\u032E'
const vowels: readonly string[] = ['a', 'e', 'i', 'u', 'A', 'E', 'I', 'U']

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
  children
}: PropsWithChildren<{
  sign: { type: string; flags: readonly string[] }
}>): JSX.Element {
  return (
    <span
      className={classNames({
        [`Transliteration__${type}--damaged`]: flags.includes('#')
      })}
    >
      {children}
    </span>
  )
}

function Flags({ flags }: { flags: readonly string[] }): JSX.Element {
  return (
    <sup className="Transliteration__flag">
      {flags.filter(flag => flag !== '#').join('')}
    </sup>
  )
}

function DefaultToken({
  token: { parts, value }
}: {
  token: Token
}): JSX.Element {
  return (
    <>
      {parts
        ? parts.map((token, index) => (
            <DisplayToken key={index} token={token} />
          ))
        : value}
    </>
  )
}

function VariantComponent({ token }: { token: Token }): JSX.Element {
  return (
    <>
      {(token as Variant).tokens.map((token, index) => (
        <React.Fragment key={index}>
          {index > 0 ? '/' : null}
          <DisplayToken token={token} />
        </React.Fragment>
      ))}
    </>
  )
}

function GlossComponent({ token }: { token: Token }): JSX.Element {
  const gloss = token as Gloss
  return (
    <sup>
      {gloss.parts.map((token, index) => (
        <DisplayToken key={index} token={token} />
      ))}
    </sup>
  )
}

function UnknownSignComponent({ token }: { token: Token }): JSX.Element {
  const sign = token as UnknownSign
  const signs = {
    UnclearSign: sign.enclosureType.includes('BROKEN_AWAY') ? 'o' : 'x',
    UnidentifiedSign: 'X'
  }
  return (
    <DamagedFlag sign={sign}>
      <EnclosureFlags token={sign}>
        {signs[sign.type]}
        <Flags flags={sign.flags} />
      </EnclosureFlags>
    </DamagedFlag>
  )
}

function signComponent(nameProperty: string) {
  return function SignComponent({ token }: { token: Token }): JSX.Element {
    const sign = token as Sign
    return (
      <DamagedFlag sign={sign}>
        <EnclosureFlags token={token}>
          {sign[nameProperty]}
          <Modifiers modifiers={sign.modifiers} />
          <Flags flags={sign.flags} />
        </EnclosureFlags>
      </DamagedFlag>
    )
  }
}

function NamedSignComponent({ token }: { token: Token }): JSX.Element {
  const namedSign = token as NamedSign
  const partEnclosures: (readonly EnclosureType[])[] = namedSign.nameParts.map(
    (part: Token): readonly EnclosureType[] => part.enclosureType
  )
  const effectiveEnclosures: EnclosureType[] = _.intersection(...partEnclosures)
  let omitSubindex = namedSign.subIndex === 1
  return (
    <DamagedFlag sign={namedSign}>
      <EnclosureFlags token={namedSign} enclosures={effectiveEnclosures}>
        {namedSign.nameParts.map((token, index) => {
          if (token.type === 'ValueToken') {
            let firstVowel = true
            const letters: string[] = []
            for (const letter of token.value.split('')) {
              if (
                firstVowel &&
                namedSign.subIndex === 2 &&
                vowels.includes(letter)
              ) {
                letters.push(`${letter}${acuteAccent}`)
                firstVowel = false
                omitSubindex = true
              } else if (
                firstVowel &&
                namedSign.subIndex === 3 &&
                vowels.includes(letter)
              ) {
                letters.push(`${letter}${graveAccent}`)
                firstVowel = false
                omitSubindex = true
              } else if (letter === 'h') {
                letters.push(`${letter}${breve}`)
              } else {
                letters.push(letter)
              }
            }
            return (
              <DisplayToken
                key={index}
                token={{
                  ...token,
                  value: letters.join('')
                }}
              />
            )
          } else {
            return <DisplayToken key={index} token={token} />
          }
        })}
        {!omitSubindex && (
          <sub className="Transliteration__subIndex">
            {namedSign.subIndex || 'x'}
          </sub>
        )}
        <Modifiers modifiers={namedSign.modifiers} />
        <Flags flags={namedSign.flags} />
        {namedSign.sign && (
          <>
            <span className="Transliteration__bracket">(</span>
            <DisplayToken token={namedSign.sign} />
            <span className="Transliteration__bracket">)</span>
          </>
        )}
        {namedSign.surrogate && !_.isEmpty(namedSign.surrogate) && (
          <>
            <span className="Transliteration__bracket">&lt;(</span>
            {namedSign.surrogate.map((token, index) => (
              <DisplayToken key={index} token={token} />
            ))}
            <span className="Transliteration__bracket">)&gt;</span>
          </>
        )}
      </EnclosureFlags>
    </DamagedFlag>
  )
}

function TabulationComponent({ token }: { token: Token }): JSX.Element {
  return <span></span>
}

const tokens: ReadonlyMap<
  string,
  FunctionComponent<{
    token: Token
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

export function DisplayToken({
  token,
  container = 'span',
  bemModifiers: modifiers = []
}: {
  token: Token
  container?: string
  bemModifiers?: readonly string[]
}): JSX.Element {
  const TokenComponent = tokens.get(token.type) || DefaultToken
  const element = `Transliteration__${token.type}`
  return React.createElement(
    container,
    {
      className: classNames([
        element,
        ...modifiers.map(modifier => `${element}--${modifier}`)
      ])
    },
    <TokenComponent token={token} />
  )
}
