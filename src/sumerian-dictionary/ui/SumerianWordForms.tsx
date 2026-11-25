import React from 'react'
import { SumerianWord } from 'sumerian-dictionary/domain/SumerianWord'
import { getKeyRenderingSpellings } from 'sumerian-dictionary/domain/sumerianRendering'
import SumerianCuneiform from 'sumerian-dictionary/ui/SumerianCuneiform'

export function CitationForms({ word }: { word: SumerianWord }): JSX.Element {
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

export function VariantSpellings({
  word,
}: {
  word: SumerianWord
}): JSX.Element {
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

export function EmesalForms({ word }: { word: SumerianWord }): JSX.Element {
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
