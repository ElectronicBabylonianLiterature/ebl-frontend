import { EntryNavSection } from 'common/ui/entry-page/entryNavSections'
import { SumerianWord } from 'sumerian-dictionary/domain/SumerianWord'
import { getKeyRenderingSpellings } from 'sumerian-dictionary/domain/sumerianRendering'

export const sumerianWordTopId = 'entry-top'

export type SumerianSectionId = 'attinger' | 'epsd2' | 'signs' | 'sources'

export type SumerianSubsectionId =
  | 'attinger-meanings'
  | 'attinger-citation-forms'
  | 'attinger-aliases'
  | 'attinger-variants'
  | 'attinger-emesal'
  | 'attinger-compounds'
  | 'attinger-name-compounds'
  | 'attinger-citations'
  | 'attinger-see-also'
  | 'epsd2-meanings'
  | 'epsd2-spellings'

export interface SumerianSubsectionDefinition {
  readonly id: SumerianSubsectionId
  readonly label: string
  readonly heading: string
  readonly note: (word: SumerianWord) => string
  readonly isPresent: (word: SumerianWord) => boolean
}

interface SumerianSectionDefinition {
  readonly id: SumerianSectionId
  readonly label: string
  readonly note: string
  readonly isPresent: (word: SumerianWord) => boolean
  readonly subsections: readonly SumerianSubsectionDefinition[]
}

export interface SumerianWordSection extends EntryNavSection {
  readonly id: SumerianSectionId
  readonly heading: string
  readonly note: string
  readonly parts: readonly SumerianSubsectionDefinition[]
}

function subsection(
  id: SumerianSubsectionId,
  label: string,
  isPresent: (word: SumerianWord) => boolean,
  note: (word: SumerianWord) => string = (): string => '',
): SumerianSubsectionDefinition {
  return { id, label, heading: label, note, isPresent }
}

function countNote(
  items: (word: SumerianWord) => readonly unknown[],
): (word: SumerianWord) => string {
  return (word) => `${items(word).length}`
}

const sectionDefinitions: readonly SumerianSectionDefinition[] = [
  {
    id: 'attinger',
    label: 'Attinger’s Glossaire',
    note: '',
    isPresent: (word) => word.sources.attinger !== null,
    subsections: [
      subsection(
        'attinger-meanings',
        'Meanings',
        (word) => word.attingerSenses.length > 0,
        (): string => 'French',
      ),
      subsection(
        'attinger-citation-forms',
        'Citation forms',
        (word) => getKeyRenderingSpellings(word.renderings).length > 0,
      ),
      subsection(
        'attinger-aliases',
        'Redirected forms',
        (word) => word.aliases.length > 0,
      ),
      subsection(
        'attinger-variants',
        'Variant spellings',
        (word) => word.attingerForms.length > 0,
      ),
      subsection('attinger-emesal', 'Emesal', (word) => word.emesal.length > 0),
      subsection(
        'attinger-compounds',
        'Compounds',
        (word) => word.compounds.length > 0,
        countNote((word) => word.compounds),
      ),
      subsection(
        'attinger-name-compounds',
        'In proper nouns',
        (word) => word.nameCompounds.length > 0,
        countNote((word) => word.nameCompounds),
      ),
      subsection(
        'attinger-citations',
        'Citations',
        (word) => word.citations.length > 0,
        countNote((word) => word.citations),
      ),
      subsection(
        'attinger-see-also',
        'See also',
        (word) => word.crossReferences.length > 0,
      ),
    ],
  },
  {
    id: 'epsd2',
    label: 'ePSD2',
    note: '',
    isPresent: (word) => word.sources.epsd2 !== null,
    subsections: [
      subsection(
        'epsd2-meanings',
        'Meanings',
        (word) => word.epsd2Senses.length > 0,
        (): string => 'English',
      ),
      subsection(
        'epsd2-spellings',
        'Attested spellings',
        (word) => word.epsd2Forms.length > 0,
      ),
    ],
  },
  {
    id: 'signs',
    label: 'Signs',
    note: 'from the eBL sign list',
    isPresent: (word) => word.signs.length > 0,
    subsections: [],
  },
  {
    id: 'sources',
    label: 'Sources',
    note: '',
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
    .map(({ definition, parts }) => ({
      id: definition.id,
      label: definition.label,
      heading: definition.label,
      note: definition.note,
      parts,
      subsections: parts.length > 1 ? parts : [],
    }))
}
