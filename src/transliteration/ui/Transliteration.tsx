import React from 'react'
import { Text } from 'transliteration/domain/text'
import 'transliteration/ui/Transliteration.sass'
import TransliterationNotes from 'transliteration/ui/TransliterationNotes'
import TransliterationLines, {
  TranslationStyle,
} from 'transliteration/ui/TransliterationLines'

export function Transliteration({
  text,
  activeLine = '',
  translationStyle = 'inline',
  translationLanguage,
}: {
  text: Text
  activeLine?: string
  translationStyle?: TranslationStyle
  translationLanguage?: string
}): JSX.Element {
  return (
    <section className="Transliteration">
      <TransliterationLines
        text={text}
        activeLine={activeLine}
        translationStyle={translationStyle}
        translationLanguage={translationLanguage}
      />
      <TransliterationNotes notes={text.notes} />
    </section>
  )
}
