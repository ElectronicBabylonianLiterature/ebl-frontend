import React from 'react'
import { SumerianWord } from 'sumerian-dictionary/domain/SumerianWord'

function SenseList({ meanings }: { meanings: readonly string[] }): JSX.Element {
  return (
    <ol className="SumerianDictionary__senses">
      {meanings.map((meaning, index) => (
        <li key={index}>{meaning}</li>
      ))}
    </ol>
  )
}

export function AttingerMeanings({
  word,
}: {
  word: SumerianWord
}): JSX.Element {
  return (
    <SenseList meanings={word.attingerSenses.map((sense) => sense.meaning)} />
  )
}

export function Epsd2Meanings({ word }: { word: SumerianWord }): JSX.Element {
  return <SenseList meanings={word.epsd2Senses.map((sense) => sense.meaning)} />
}
