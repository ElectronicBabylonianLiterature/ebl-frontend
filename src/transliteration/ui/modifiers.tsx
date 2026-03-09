import React from 'react'

export function createModifierClasses(
  element: string,
  modifiers: readonly string[],
): readonly string[] {
  return modifiers.map((modifier) => `Transliteration__${element}--${modifier}`)
}

export function Modifiers({
  modifiers,
}: {
  modifiers: readonly string[]
}): JSX.Element {
  return (
    <sup className="Transliteration__modifier">
      {modifiers.map((modifier) => modifier.slice(1)).join('')}
    </sup>
  )
}
