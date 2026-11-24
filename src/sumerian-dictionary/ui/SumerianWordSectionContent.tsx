import React from 'react'
import { SumerianWord } from 'sumerian-dictionary/domain/SumerianWord'
import {
  SumerianSectionId,
  SumerianSubsectionDefinition,
  SumerianSubsectionId,
  SumerianWordSection,
} from 'sumerian-dictionary/ui/sumerianWordSections'
import {
  AttingerMeanings,
  Epsd2Meanings,
} from 'sumerian-dictionary/ui/SumerianWordMeanings'
import {
  CitationForms,
  EmesalForms,
  VariantSpellings,
} from 'sumerian-dictionary/ui/SumerianWordForms'
import {
  AttestedSpellings,
  RedirectedForms,
} from 'sumerian-dictionary/ui/SumerianWordFormLists'
import {
  Compounds,
  NameCompounds,
} from 'sumerian-dictionary/ui/SumerianWordCompounds'
import SumerianWordCitations from 'sumerian-dictionary/ui/SumerianWordCitations'
import { SumerianWordSeeAlso } from 'sumerian-dictionary/ui/SumerianWordReferences'
import SumerianWordSigns from 'sumerian-dictionary/ui/SumerianWordSigns'
import SumerianWordSources from 'sumerian-dictionary/ui/SumerianWordSources'
import {
  SectionNote,
  SumerianSubsection,
} from 'sumerian-dictionary/ui/SumerianWordParts'

type WordContent = (props: { word: SumerianWord }) => JSX.Element

type SectionContent = (props: {
  word: SumerianWord
  parts: readonly SumerianSubsectionDefinition[]
}) => JSX.Element

export const attingerEdition =
  'P. Attinger, Glossaire sumérien–français, 3rd edition (manuscript)'

const subsectionContent: Record<SumerianSubsectionId, WordContent> = {
  'attinger-meanings': AttingerMeanings,
  'attinger-citation-forms': CitationForms,
  'attinger-aliases': RedirectedForms,
  'attinger-variants': VariantSpellings,
  'attinger-emesal': EmesalForms,
  'attinger-compounds': Compounds,
  'attinger-name-compounds': NameCompounds,
  'attinger-citations': SumerianWordCitations,
  'attinger-see-also': SumerianWordSeeAlso,
  'epsd2-meanings': Epsd2Meanings,
  'epsd2-spellings': AttestedSpellings,
}

function Subsections({
  word,
  parts,
}: {
  word: SumerianWord
  parts: readonly SumerianSubsectionDefinition[]
}): JSX.Element {
  return (
    <>
      {parts.map((part) => {
        const Content = subsectionContent[part.id]
        return (
          <SumerianSubsection key={part.id} part={part} word={word}>
            <Content word={word} />
          </SumerianSubsection>
        )
      })}
    </>
  )
}

function AttingerGlossaire({
  word,
  parts,
}: {
  word: SumerianWord
  parts: readonly SumerianSubsectionDefinition[]
}): JSX.Element {
  const entryId = word.sources.attinger?.entryId
  return (
    <>
      <SectionNote>
        {attingerEdition}
        {entryId && ` · entry ${entryId}`}. Everything in this section is
        Attinger’s.
      </SectionNote>
      <Subsections word={word} parts={parts} />
    </>
  )
}

const sectionContent: Record<SumerianSectionId, SectionContent> = {
  attinger: AttingerGlossaire,
  epsd2: Subsections,
  signs: SumerianWordSigns,
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
