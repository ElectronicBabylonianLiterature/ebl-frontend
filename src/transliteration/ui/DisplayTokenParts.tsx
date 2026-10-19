import React, { FunctionComponent, PropsWithChildren } from 'react'
import { Token } from 'transliteration/domain/token'
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
