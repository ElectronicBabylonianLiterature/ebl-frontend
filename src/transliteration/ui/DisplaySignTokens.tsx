import React from 'react'
import _ from 'lodash'
import {
  effectiveEnclosure,
  EgyptianMetricalFeetSeparator,
  EnclosureType,
  GreekLetter,
  NamedSign,
  Sign,
  UnknownSign,
} from 'transliteration/domain/token'
import { addAccents } from 'transliteration/domain/accents'
import { isEnclosure } from 'transliteration/domain/type-guards'
import { Modifiers } from 'transliteration/ui/modifiers'
import EnclosureFlags from 'transliteration/ui/EnclosureFlags'
import Flags from 'transliteration/ui/Flags'
import SubIndex from 'transliteration/ui/Subindex'
import DisplayToken from 'transliteration/ui/DisplayToken'
import { DamagedFlag, TokenProps } from 'transliteration/ui/DisplayTokenParts'

export function UnknownSignComponent({
  token,
  Wrapper,
}: TokenProps): JSX.Element {
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

export function EgyptianMetricalFeetSeparatorComponent({
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

export function signComponent(nameProperty: string) {
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

export function NamedSignComponent({
  token,
  Wrapper,
}: TokenProps): JSX.Element {
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

export function GreekLetterComponent({
  token,
  Wrapper,
}: TokenProps): JSX.Element {
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

export function TabulationComponent({ Wrapper }: TokenProps): JSX.Element {
  return (
    <Wrapper>
      <span></span>
    </Wrapper>
  )
}

export function LineBreakComponent({ Wrapper }: TokenProps): JSX.Element {
  return <Wrapper>|</Wrapper>
}
