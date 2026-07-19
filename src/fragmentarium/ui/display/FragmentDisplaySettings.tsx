import React from 'react'
import Button from 'react-bootstrap/Button'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import classNames from 'classnames'
import { TranslationStyle } from 'transliteration/ui/TransliterationLines'
import { realiaIcon } from 'realia/ui/realiaIcon'

export type LanguageOption = { label: string; value: string }

function getNext<T>(seq: T[], item: T): T {
  const index = (seq.indexOf(item) + 1) % seq.length
  return seq[index]
}

function TranslationControls({
  layout,
  toggleLayout,
  language,
  setLanguage,
  languageOptions,
}: {
  layout: TranslationStyle
  toggleLayout: () => void
  language: LanguageOption
  setLanguage: (option: LanguageOption) => void
  languageOptions: LanguageOption[]
}): JSX.Element {
  const setNextLanguage = () => setLanguage(getNext(languageOptions, language))

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        onClick={toggleLayout}
        title={'Toggle layout'}
        aria-label={'toggle-layout'}
      >
        <i
          className={classNames('fas', {
            'fa-table-columns': layout === 'inline',
            'fa-align-justify': layout === 'standoff',
          })}
        ></i>
      </Button>

      <Button
        variant="secondary"
        size="sm"
        onClick={setNextLanguage}
        disabled={languageOptions.length <= 1}
        title={'Switch language'}
        aria-label={'switch-language'}
      >
        {language.label}
      </Button>
    </>
  )
}

export default function FragmentDisplaySettings({
  layout,
  toggleLayout,
  language,
  setLanguage,
  languageOptions,
  showNamedEntities,
  toggleNamedEntities,
}: {
  layout: TranslationStyle
  toggleLayout: () => void
  language: LanguageOption | null
  setLanguage: (option: LanguageOption) => void
  languageOptions: LanguageOption[]
  showNamedEntities: boolean
  toggleNamedEntities: () => void
}): JSX.Element {
  return (
    <ButtonGroup>
      {language && (
        <TranslationControls
          layout={layout}
          toggleLayout={toggleLayout}
          language={language}
          setLanguage={setLanguage}
          languageOptions={languageOptions}
        />
      )}

      <Button
        variant="secondary"
        size="sm"
        active={showNamedEntities}
        aria-pressed={showNamedEntities}
        onClick={toggleNamedEntities}
        title={'Toggle named entities'}
        aria-label={'toggle-named-entities'}
      >
        {realiaIcon}
      </Button>
    </ButtonGroup>
  )
}
