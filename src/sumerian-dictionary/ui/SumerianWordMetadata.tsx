import React from 'react'
import MarkupService from 'markup/application/MarkupService'
import {
  EntryMetadata,
  EntryMetadataItem,
} from 'common/ui/entry-page/EntrySection'
import { SumerianWord } from 'sumerian-dictionary/domain/SumerianWord'
import {
  getPartOfSpeechCode,
  getPartOfSpeechLabel,
} from 'sumerian-dictionary/domain/sumerianDictionaryLabels'
import { getHeadCuneiform } from 'sumerian-dictionary/domain/sumerianRendering'
import { formatCount } from 'sumerian-dictionary/domain/sumerianWordHelpers'
import SumerianCitationForm from 'sumerian-dictionary/ui/SumerianCitationForm'
import { SumerianWordLink } from 'sumerian-dictionary/ui/SumerianWordParts'

function TranslitList({ values }: { values: readonly string[] }): JSX.Element {
  return (
    <span className="SumerianDictionary__translit">{values.join(', ')}</span>
  )
}

export function SumerianWordHeading({
  word,
  markupService,
}: {
  word: SumerianWord
  markupService: MarkupService
}): JSX.Element {
  const cuneiform = getHeadCuneiform(word)
  return (
    <h1 className="SumerianDictionary__heading">
      <span>
        <SumerianCitationForm
          citationForm={word.citationForm}
          atf={word.atf}
          markupService={markupService}
        />
        {word.homonym && (
          <span className="SumerianDictionary__homonym"> {word.homonym}</span>
        )}
      </span>
      {cuneiform && (
        <span className="SumerianDictionary__heading-cuneiform">
          {cuneiform}
        </span>
      )}
      {word.guideWord && (
        <span className="SumerianDictionary__guide-word">
          “{word.guideWord}”
        </span>
      )}
    </h1>
  )
}

export default function SumerianWordMetadata({
  word,
}: {
  word: SumerianWord
}): JSX.Element {
  const partOfSpeechCode = getPartOfSpeechCode(word)
  return (
    <EntryMetadata>
      {word.guideWord && (
        <EntryMetadataItem label="Guide word">
          {word.guideWord}
        </EntryMetadataItem>
      )}
      {partOfSpeechCode && (
        <EntryMetadataItem label="Part of speech">
          {getPartOfSpeechLabel(word)} ({partOfSpeechCode})
        </EntryMetadataItem>
      )}
      {word.atf && (
        <EntryMetadataItem label="eBL-ATF">
          <code className="SumerianDictionary__atf">{word.atf}</code>
        </EntryMetadataItem>
      )}
      {word.emesal.length > 0 && (
        <EntryMetadataItem label="Emesal">
          <TranslitList values={word.emesal.map((emesal) => emesal.form)} />
        </EntryMetadataItem>
      )}
      {word.stems.length > 0 && (
        <EntryMetadataItem label="Stems">
          <TranslitList values={word.stems} />
        </EntryMetadataItem>
      )}
      {word.determinatives.length > 0 && (
        <EntryMetadataItem label="Determinatives">
          <TranslitList values={word.determinatives} />
        </EntryMetadataItem>
      )}
      {word.caseFrame.length > 0 && (
        <EntryMetadataItem label="Case frame">
          {word.caseFrame.join(', ')}
        </EntryMetadataItem>
      )}
      {word.head && (
        <EntryMetadataItem label="Compound of">
          <SumerianWordLink link={word.head} />
        </EntryMetadataItem>
      )}
      {word.attestation.count > 0 && (
        <EntryMetadataItem label="ePSD2 instances">
          {formatCount(word.attestation.count)}
        </EntryMetadataItem>
      )}
      {word.uncertain && (
        <EntryMetadataItem label="Status">uncertain</EntryMetadataItem>
      )}
    </EntryMetadata>
  )
}
