import React from 'react'
import { SumerianWord } from 'sumerian-dictionary/domain/SumerianWord'
import { getKeyRenderingSpellings } from 'sumerian-dictionary/domain/sumerianRendering'
import SumerianCuneiform from 'sumerian-dictionary/ui/SumerianCuneiform'
import { SumerianSubsectionDefinition } from 'sumerian-dictionary/ui/sumerianWordSections'
import { SumerianSubsection } from 'sumerian-dictionary/ui/SumerianWordParts'
import {
  AttestedSpellings,
  RedirectedForms,
} from 'sumerian-dictionary/ui/SumerianWordFormLists'

function CitationForms({ word }: { word: SumerianWord }): JSX.Element {
  return (
    <ul className="SumerianDictionary__links">
      {getKeyRenderingSpellings(word.renderings).map((spelling) => (
        <li key={spelling} className="SumerianDictionary__pill">
          <span className="SumerianDictionary__translit">{spelling}</span>
          <SumerianCuneiform
            renderings={word.renderings}
            source="attinger"
            spelling={spelling}
          />
        </li>
      ))}
    </ul>
  )
}

function VariantSpellings({ word }: { word: SumerianWord }): JSX.Element {
  return (
    <ul className="SumerianDictionary__variants">
      {word.attingerForms.map((form, index) => (
        <li key={index}>
          <div className="SumerianDictionary__variant-head">
            <span className="SumerianDictionary__translit">
              {form.spelling}
            </span>
            <SumerianCuneiform
              renderings={word.renderings}
              source="attinger"
              spelling={form.spelling}
            />
          </div>
          {form.attestations && (
            <p className="SumerianDictionary__attestations">
              {form.attestations}
            </p>
          )}
        </li>
      ))}
    </ul>
  )
}

function EmesalForms({ word }: { word: SumerianWord }): JSX.Element {
  return (
    <ul className="SumerianDictionary__links">
      {word.emesal.map((emesal, index) => (
        <li
          key={index}
          className="SumerianDictionary__pill SumerianDictionary__translit"
        >
          {emesal.form}
        </li>
      ))}
    </ul>
  )
}

const formContent: Record<
  string,
  (props: { word: SumerianWord }) => JSX.Element
> = {
  'forms-key': CitationForms,
  'forms-aliases': RedirectedForms,
  'forms-attinger': VariantSpellings,
  'forms-emesal': EmesalForms,
  'forms-epsd2': AttestedSpellings,
}

export default function SumerianWordForms({
  word,
  parts,
}: {
  word: SumerianWord
  parts: readonly SumerianSubsectionDefinition[]
}): JSX.Element {
  return (
    <>
      {parts.map((part) => {
        const Content = formContent[part.id]
        return (
          <SumerianSubsection key={part.id} part={part} word={word}>
            <Content word={word} />
          </SumerianSubsection>
        )
      })}
    </>
  )
}
