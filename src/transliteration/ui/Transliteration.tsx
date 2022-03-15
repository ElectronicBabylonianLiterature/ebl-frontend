import React from 'react'
import { Text } from 'transliteration/domain/text'
import './Transliteration.sass'
import TransliterationNotes from './TransliterationNotes'
import TransliterationLines from './TransliterationLines'

export function Transliteration({
  text,
  activeLine = '',
}: {
  text: Text
  activeLine?: string
}): JSX.Element {
  return (
    <section className="Transliteration">
      <TransliterationLines text={text} activeLine={activeLine} />
      <TransliterationNotes notes={text.notes} />
    </section>
  )
}
