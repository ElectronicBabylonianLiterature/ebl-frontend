import React from 'react'

export default function Flags({
  flags
}: {
  flags: readonly string[]
}): JSX.Element {
  return (
    <sup className="Transliteration__flag">
      {flags.filter(flag => flag !== '#').join('')}
    </sup>
  )
}
