import React, { FunctionComponent, PropsWithChildren } from 'react'
import {
  EgyptianMetricalFeetSeparator,
  GreekLetter,
  Sign,
  Token,
  UnknownSign,
} from 'transliteration/domain/token'
import { Modifiers } from 'transliteration/ui/modifiers'
import EnclosureFlags from 'transliteration/ui/EnclosureFlags'
import Flags from 'transliteration/ui/Flags'
import { PhoneticProps } from 'akkadian/application/phonetics/segments'

export type TokenWrapper = FunctionComponent<PropsWithChildren<unknown>>

export interface TokenProps {
  token: Token
  Wrapper: TokenWrapper
  tokenClasses?: readonly string[]
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

export function signComponent(
  nameProperty: string,
): (props: TokenProps) => JSX.Element {
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
