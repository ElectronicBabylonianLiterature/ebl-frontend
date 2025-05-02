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
  language,
}: {
  text: Text
  activeLine?: string
  translationStyle?: TranslationStyle
  language?: string
}): JSX.Element {
  return (
    <section className="Transliteration">
      <TransliterationLines
        text={text}
        activeLine={activeLine}
        translationStyle={translationStyle}
        language={language}
      />
      <TransliterationNotes notes={text.notes} />
    </section>
  )
}
