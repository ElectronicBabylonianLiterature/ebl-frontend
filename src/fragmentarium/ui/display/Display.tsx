import React from 'react'
import { Fragment } from 'fragmentarium/domain/fragment'
import Glossary from 'transliteration/ui/Glossary'
import { Transliteration } from 'transliteration/ui/Transliteration'
import WordService from 'dictionary/application/WordService'
import { MarkupPart } from 'transliteration/domain/markup'
import { MarkupText } from 'markup/ui/markup'
import { TranslationStyle } from 'transliteration/ui/TransliterationLines'
import { isTranslationLine } from 'transliteration/domain/type-guards'
import FragmentDisplaySettings, {
  LanguageOption,
} from 'fragmentarium/ui/display/FragmentDisplaySettings'
import { NamedEntityPreviewProvider } from 'fragmentarium/ui/text-annotation/NamedEntityPreviewContext'

interface Props {
  fragment: Fragment
  wordService: WordService
  activeLine: string
}

const languages: LanguageOption[] = [
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

function Display({ fragment, wordService, activeLine }: Props): JSX.Element {
  const languagesInFragment = new Set(
    fragment.text.lines.filter(isTranslationLine).map((line) => line.language),
  )
  const availableLanguages = languages.filter((option) =>
    languagesInFragment.has(option.value),
  )
  const [language, setLanguage] = React.useState<LanguageOption | null>(
    availableLanguages[0] || null,
  )
  const [layout, setLayout] = React.useState<TranslationStyle>('standoff')
  const [showNamedEntities, setShowNamedEntities] = React.useState(false)

  const transliteration = (
    <Transliteration
      text={fragment.text}
      activeLine={activeLine}
      translationStyle={layout}
      language={language?.value}
    />
  )

  return (
    <>
      {fragment.introduction.parts.length > 0 && (
        <MarkupSection
          title={'Introduction'}
          parts={fragment.introduction.parts}
        />
      )}

      <section>
        <FragmentDisplaySettings
          language={language}
          setLanguage={setLanguage}
          layout={layout}
          toggleLayout={() =>
            setLayout(layout === 'standoff' ? 'inline' : 'standoff')
          }
          languageOptions={availableLanguages}
          showNamedEntities={showNamedEntities}
          toggleNamedEntities={() => setShowNamedEntities(!showNamedEntities)}
        />
      </section>

      {showNamedEntities ? (
        <NamedEntityPreviewProvider fragment={fragment}>
          {transliteration}
        </NamedEntityPreviewProvider>
      ) : (
        transliteration
      )}

      {fragment.notes.text.trim() && (
        <MarkupSection title={'eBL Notes'} parts={fragment.notes.parts} />
      )}
      <Glossary text={fragment.text} wordService={wordService} />
    </>
  )
}

export default Display
