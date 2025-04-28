import React from 'react'
import { Fragment } from 'fragmentarium/domain/fragment'
import Glossary from 'transliteration/ui/Glossary'
import { Transliteration } from 'transliteration/ui/Transliteration'
import WordService from 'dictionary/application/WordService'
import { MarkupPart } from 'transliteration/domain/markup'
import { MarkupText } from 'markup/ui/markup'
import Select, { ValueType } from 'react-select'
import TranslationLine from 'transliteration/domain/translation-line'

interface Props {
  fragment: Fragment
  wordService: WordService
  activeLine: string
}

type LanguageOption = ValueType<{ label: string; value: string }, false>

const languages = [
  { label: 'English', value: 'en' },
  { label: 'Arabic', value: 'ar' },
  { label: 'German', value: 'de' },
  { label: 'Spanish', value: 'es' },
]

function MarkupSection({
  title,
  parts,
}: {
  title: string
  parts: readonly MarkupPart[]
}) {
  return (
    <section className="CuneiformFragment__markup-section">
      <h4>{title}</h4>
      {MarkupText(parts)}
    </section>
  )
}

function Display({ fragment, wordService, activeLine }: Props): JSX.Element {
  const languagesInFragment = new Set(
    fragment.text.lines
      .filter((line) => line.type === 'TranslationLine')
      .map((line) => (line as TranslationLine).language)
  )
  const availableLanguages = languages.filter((option) =>
    languagesInFragment.has(option.value)
  )
  const defaultLanguage = availableLanguages[0]
  const [language, setLanguage] = React.useState<LanguageOption | null>(
    defaultLanguage
  )

  return (
    <>
      {fragment.introduction.parts.length > 0 && (
        <MarkupSection
          title={'Introduction'}
          parts={fragment.introduction.parts}
        />
      )}
      {languagesInFragment.size > 1 && (
        <section>
          <Select
            aria-label="select-language"
            options={availableLanguages}
            onChange={setLanguage}
            value={language}
          />
        </section>
      )}
      <Transliteration
        text={fragment.text}
        activeLine={activeLine}
        translationStyle={'standoff'}
        translationLanguage={language?.value}
      />
      {fragment.notes.text.trim() && (
        <MarkupSection title={'eBL Notes'} parts={fragment.notes.parts} />
      )}
      <Glossary text={fragment.text} wordService={wordService} />
    </>
  )
}

export default Display
