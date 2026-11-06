import React from 'react'
import { SumerianWord } from 'sumerian-dictionary/domain/SumerianWord'
import { SumerianSubsectionDefinition } from 'sumerian-dictionary/ui/sumerianWordSections'
import { SumerianSubsection } from 'sumerian-dictionary/ui/SumerianWordParts'

function SenseList({ meanings }: { meanings: readonly string[] }): JSX.Element {
  return (
    <ol className="SumerianDictionary__senses">
      {meanings.map((meaning, index) => (
        <li key={index}>{meaning}</li>
      ))}
    </ol>
  )
}

export default function SumerianWordMeanings({
  word,
  parts,
}: {
  word: SumerianWord
  parts: readonly SumerianSubsectionDefinition[]
}): JSX.Element {
  const meaningsById: Record<string, readonly string[]> = {
    'meanings-attinger': word.attingerSenses.map((sense) => sense.meaning),
    'meanings-epsd2': word.epsd2Senses.map((sense) => sense.meaning),
  }
  return (
    <>
      {parts.map((part) => (
        <SumerianSubsection key={part.id} part={part} word={word}>
          <SenseList meanings={meaningsById[part.id]} />
        </SumerianSubsection>
      ))}
    </>
  )
}
