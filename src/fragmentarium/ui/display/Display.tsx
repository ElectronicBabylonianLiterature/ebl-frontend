import React from 'react'
import { Fragment } from 'fragmentarium/domain/fragment'
import Glossary from 'transliteration/ui/Glossary'
import { Transliteration } from 'transliteration/ui/Transliteration'
import WordService from 'dictionary/application/WordService'
import { MarkupPart } from 'transliteration/domain/markup'
import { MarkupText } from 'markup/ui/markup'
import TranslationLine from 'transliteration/domain/translation-line'
import Button from 'react-bootstrap/Button'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import { TranslationStyle } from 'transliteration/ui/TransliterationLines'
import classNames from 'classnames'
import './Display.sass'

interface Props {
  fragment: Fragment
  wordService: WordService
  activeLine: string
}

type LanguageOption = { label: string; value: string }

const languages = [
  { label: 'English', value: 'en' },
  { label: 'العربية', value: 'ar' },
  { label: 'Deutsch', value: 'de' },
  { label: 'Español', value: 'es' },
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

function getNext<T>(seq: T[], item: T): T {
  const index = (seq.indexOf(item) + 1) % seq.length
  return seq[index]
}

function FragmentDisplaySettings({
  layout,
  toggleLayout,
  selectedLanguage,
  setLanguage,
  languageOptions,
}: {
  layout: TranslationStyle
  toggleLayout: () => void
  selectedLanguage: LanguageOption | null
  setLanguage: (option: LanguageOption) => void
  languageOptions: LanguageOption[]
}) {
  const nextLanguage = getNext<LanguageOption | null>(
    languageOptions,
    selectedLanguage
  )
  const setNextLanguage = () => {
    if (nextLanguage) {
      setLanguage(nextLanguage)
    }
  }
  return (
    <ButtonGroup>
      <Button
        variant="secondary"
        onClick={toggleLayout}
        title={'Toggle layout'}
        aria-label={'toggle-layout'}
      >
        <i
          className={classNames('fas', {
            'fa-table': layout === 'inline',
            'fa-align-justify': layout === 'standoff',
          })}
        ></i>
      </Button>

      {
        <Button
          variant="secondary"
          onClick={setNextLanguage}
          disabled={languageOptions.length <= 1}
          title={'Switch language'}
        >
          {selectedLanguage === null ? (
            <i className={'fas fa-globe'}></i>
          ) : (
            selectedLanguage.label
          )}
        </Button>
      }
    </ButtonGroup>
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
  const defaultLanguage = availableLanguages[0] || null
  const [language, setLanguage] = React.useState<LanguageOption | null>(
    defaultLanguage
  )
  const [layout, setLayout] = React.useState<TranslationStyle>('standoff')

  return (
    <>
      {fragment.introduction.parts.length > 0 && (
        <MarkupSection
          title={'Introduction'}
          parts={fragment.introduction.parts}
        />
      )}

      {defaultLanguage && (
        <section className={'Display__fragment-layout-options'}>
          <FragmentDisplaySettings
            selectedLanguage={language}
            layout={layout}
            toggleLayout={() =>
              setLayout(layout === 'standoff' ? 'inline' : 'standoff')
            }
            setLanguage={setLanguage}
            languageOptions={availableLanguages}
          />
        </section>
      )}
      <Transliteration
        text={fragment.text}
        activeLine={activeLine}
        translationStyle={layout}
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
