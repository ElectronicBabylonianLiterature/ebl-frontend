import { romanize } from 'romans'
import { EntryNavSection } from 'common/ui/entry-page/entryNavSections'
import { SumerianWord } from 'sumerian-dictionary/domain/SumerianWord'
import { getKeyRenderingSpellings } from 'sumerian-dictionary/domain/sumerianRendering'

export const sumerianWordTopId = 'entry-top'

export type SumerianSectionId =
  | 'meanings'
  | 'forms'
  | 'signs'
  | 'akkadian'
  | 'compounds'
  | 'citations'
  | 'see-also'
  | 'sources'

export interface SumerianSubsectionDefinition {
  readonly id: string
  readonly label: string
  readonly heading: string
  readonly note: (word: SumerianWord) => string
  readonly isPresent: (word: SumerianWord) => boolean
}

interface SumerianSectionDefinition {
  readonly id: SumerianSectionId
  readonly label: string
  readonly isPresent: (word: SumerianWord) => boolean
  readonly subsections: readonly SumerianSubsectionDefinition[]
}

export interface SumerianWordSection extends EntryNavSection {
  readonly id: SumerianSectionId
  readonly heading: string
  readonly parts: readonly SumerianSubsectionDefinition[]
}

function subsection(
  id: string,
  label: string,
  heading: string,
  note: string | ((word: SumerianWord) => string),
  isPresent: (word: SumerianWord) => boolean,
): SumerianSubsectionDefinition {
  return {
    id,
    label,
    heading,
    note: typeof note === 'string' ? (): string => note : note,
    isPresent,
  }
}

const sectionDefinitions: readonly SumerianSectionDefinition[] = [
  {
    id: 'meanings',
    label: 'Meanings',
    isPresent: () => false,
    subsections: [
      subsection(
        'meanings-attinger',
        'Attinger',
        'Attinger, Glossaire sumérien–français',
        'French',
        (word) => word.attingerSenses.length > 0,
      ),
      subsection(
        'meanings-epsd2',
        'ePSD2',
        'ePSD2',
        'English',
        (word) => word.epsd2Senses.length > 0,
      ),
    ],
  },
  {
    id: 'forms',
    label: 'Forms',
    isPresent: () => false,
    subsections: [
      subsection(
        'forms-key',
        'Citation forms',
        'Citation forms',
        'Attinger',
        (word) => getKeyRenderingSpellings(word.renderings).length > 0,
      ),
      subsection(
        'forms-aliases',
        'Redirected forms',
        'Redirected forms',
        'Attinger',
        (word) => word.aliases.length > 0,
      ),
      subsection(
        'forms-attinger',
        'Variant spellings',
        'Variant spellings',
        'Attinger',
        (word) => word.attingerForms.length > 0,
      ),
      subsection(
        'forms-emesal',
        'Emesal',
        'Emesal',
        'Attinger',
        (word) => word.emesal.length > 0,
      ),
      subsection(
        'forms-epsd2',
        'Attested spellings',
        'Attested spellings',
        'ePSD2',
        (word) => word.epsd2Forms.length > 0,
      ),
    ],
  },
  {
    id: 'signs',
    label: 'Signs',
    isPresent: (word) => word.signs.length > 0,
    subsections: [],
  },
  {
    id: 'akkadian',
    label: 'Akkadian Equivalents',
    isPresent: (word) => word.akkadianEquivalents.length > 0,
    subsections: [],
  },
  {
    id: 'compounds',
    label: 'Compounds',
    isPresent: () => false,
    subsections: [
      subsection(
        'compounds-lexical',
        'Words',
        'Compounds',
        (word) => `${word.compounds.length}`,
        (word) => word.compounds.length > 0,
      ),
      subsection(
        'compounds-names',
        'Proper nouns',
        'In proper nouns',
        (word) => `${word.nameCompounds.length}`,
        (word) => word.nameCompounds.length > 0,
      ),
    ],
  },
  {
    id: 'citations',
    label: 'Citations',
    isPresent: (word) => word.citations.length > 0,
    subsections: [],
  },
  {
    id: 'see-also',
    label: 'See Also',
    isPresent: (word) => word.crossReferences.length > 0,
    subsections: [],
  },
  {
    id: 'sources',
    label: 'Sources',
    isPresent: () => true,
    subsections: [],
  },
]

export function buildSumerianWordSections(
  word: SumerianWord,
): readonly SumerianWordSection[] {
  return sectionDefinitions
    .map((definition) => ({
      definition,
      parts: definition.subsections.filter((part) => part.isPresent(word)),
    }))
    .filter(
      ({ definition, parts }) => parts.length > 0 || definition.isPresent(word),
    )
    .map(({ definition, parts }, index) => ({
      id: definition.id,
      label: definition.label,
      heading: `${romanize(index + 1)}. ${definition.label}`,
      parts,
      subsections: parts.length > 1 ? parts : [],
    }))
}
