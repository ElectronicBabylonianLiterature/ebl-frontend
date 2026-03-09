import React, { PropsWithChildren } from 'react'
import classNames from 'classnames'
import { Token, EnclosureType } from 'transliteration/domain/token'
import { createModifierClasses } from './modifiers'

export default function EnclosureFlags({
  token,
  enclosures,
  children,
}: PropsWithChildren<{
  token: Token
  enclosures?: readonly EnclosureType[]
}>): JSX.Element {
  return (
    <span
      className={classNames(
        createModifierClasses(token.type, enclosures ?? token.enclosureType),
      )}
    >
      {children}
    </span>
  )
}
