import React from 'react'
import { SumerianWord } from 'sumerian-dictionary/domain/SumerianWord'
import {
  SumerianSectionId,
  SumerianSubsectionDefinition,
  SumerianWordSection,
} from 'sumerian-dictionary/ui/sumerianWordSections'
import SumerianWordMeanings from 'sumerian-dictionary/ui/SumerianWordMeanings'
import SumerianWordForms from 'sumerian-dictionary/ui/SumerianWordForms'
import SumerianWordSigns from 'sumerian-dictionary/ui/SumerianWordSigns'
import SumerianWordSources from 'sumerian-dictionary/ui/SumerianWordSources'
import {
  SumerianWordAkkadian,
  SumerianWordCitations,
  SumerianWordCompounds,
  SumerianWordSeeAlso,
} from 'sumerian-dictionary/ui/SumerianWordReferences'

const sectionContent: Record<
  SumerianSectionId,
  (props: {
    word: SumerianWord
    parts: readonly SumerianSubsectionDefinition[]
  }) => JSX.Element
> = {
  meanings: SumerianWordMeanings,
  forms: SumerianWordForms,
  signs: SumerianWordSigns,
  akkadian: SumerianWordAkkadian,
  compounds: SumerianWordCompounds,
  citations: SumerianWordCitations,
  'see-also': SumerianWordSeeAlso,
  sources: SumerianWordSources,
}

export default function SumerianWordSectionContent({
  section,
  word,
}: {
  section: SumerianWordSection
  word: SumerianWord
}): JSX.Element {
  const Content = sectionContent[section.id]
  return <Content word={word} parts={section.parts} />
}
