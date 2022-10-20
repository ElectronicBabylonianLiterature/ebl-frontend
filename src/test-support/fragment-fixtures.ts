import { Factory } from 'fishery'
import { Chance } from 'chance'
import {
  Fragment,
  FragmentInfo,
  Measures,
  RecordEntry,
  UncuratedReference,
} from 'fragmentarium/domain/fragment'
import Folio from 'fragmentarium/domain/Folio'
import Museum from 'fragmentarium/domain/museum'
import { Genre, Genres } from 'fragmentarium/domain/Genres'
import { referenceFactory } from './bibliography-fixtures'
import { FolioPagerData, FragmentAndFolio } from 'fragmentarium/domain/pager'
import complexText from './complexTestText'
import { joinFactory } from './join-fixtures'
import { ManuscriptAttestation } from 'corpus/domain/manuscriptAttestation'
import { chapterIdFactory } from './chapter-fixtures'
import { manuscriptFactory } from './manuscript-fixtures'
import { Text, createText } from 'corpus/domain/text'

const defaultChance = new Chance()

function date(): string {
  return defaultChance.date().toISOString()
}

function dateRange(): string {
  return `${date()}/${date()}`
}

function description(): string {
  return `${defaultChance.sentence()}\n${defaultChance.sentence()}`
}

function editedInOraccProject(): string {
  return defaultChance.pickone(['ccp', 'dcclt', 'saao'])
}

function collection(): string {
  return defaultChance.pickone([
    'Babylon',
    'Kuyunjik',
    'Nippur',
    '',
    'Sippar',
    'Nimrud',
    'Ur',
    'Iraq',
    'Girsu',
    'Larsa',
    'Bābili',
    'Umma',
    'Kanesh',
    'uncertain',
    'Puzriš',
    'Shuruppak',
    'Kisurra',
    'Ešnunna',
    'Uruk',
    'Shibaniba',
    'Kalhu',
    'Tutub',
    'Susa',
    'Kish',
    'Anšan',
    'Lagash',
    'Assur',
    'Huzirina',
  ])
}

function script(): string {
  return defaultChance.pickone(['NA', 'NB'])
}

export const statisticsFactory = Factory.define<{
  transliteratedFragments: number
  lines: number
}>(() => ({
  transliteratedFragments: defaultChance.natural(),
  lines: defaultChance.natural(),
}))

class RecordFactory extends Factory<RecordEntry> {
  historical(date: string | null = null) {
    return this.params({
      date: date ?? dateRange(),
      type: 'HistoricalTransliteration',
    })
  }
}

export const recordFactory = RecordFactory.define(
  () =>
    new RecordEntry({
      user: defaultChance.last(),
      date: date(),
      type: defaultChance.pickone(['Transliteration', 'Collation', 'Revision']),
    })
)

export const measuresFactory = Factory.define<Measures>(() => ({
  length: defaultChance.floating({ min: 0, max: 100 }),
  width: defaultChance.floating({ min: 0, max: 100 }),
  thickness: defaultChance.floating({ min: 0, max: 100 }),
}))

export const folioFactory = Factory.define<Folio>(
  () =>
    new Folio({
      name: defaultChance.pickone(['WGL', 'FWG', 'EL', 'AKG', 'MJG']),
      number: defaultChance.string(),
    })
)

export const uncuratedReferenceFactory = Factory.define<UncuratedReference>(
  () => ({
    document: defaultChance.sentence(),
    pages: defaultChance.n(defaultChance.natural, 5),
  })
)

export const fragmentFactory = Factory.define<Fragment>(
  ({ associations, sequence }) => {
    const museumNumber = `${defaultChance.word()}.${sequence}`
    return new Fragment(
      museumNumber,
      defaultChance.word(),
      defaultChance.word(),
      defaultChance.word(),
      defaultChance.sentence({ words: 4 }),
      associations.joins ?? [
        [joinFactory.build({ museumNumber, isInFragmentarium: true })],
        [joinFactory.build()],
      ],
      description(),
      associations.measures ?? measuresFactory.build(),
      collection(),
      script(),
      associations.folios ?? folioFactory.buildList(2),
      associations.record ?? recordFactory.buildList(2),
      associations.text ?? complexText,
      defaultChance.sentence(),
      associations.museum ?? Museum.of('The British Museum'),
      associations.references ?? referenceFactory.buildList(2),
      associations.uncuratedReferences ?? null,
      '',
      defaultChance.bool(),
      associations.genres ??
        defaultChance.pickone([
          new Genres([
            new Genre(['ARCHIVE', 'Administrative', 'Lists'], false),
            new Genre(['Other', 'Fake', 'Certain'], false),
          ]),
          new Genres([new Genre(['Other', 'Fake', 'Certain'], false)]),
        ]),
      editedInOraccProject(),
      associations.introduction ?? {
        text: 'Introduction',
        parts: [{ type: 'StringPart', text: 'Introduction' }],
      }
    )
  }
)

export const fragmentInfoFactory = Factory.define<FragmentInfo>(
  ({ associations }) => ({
    number: defaultChance.word(),
    accession: defaultChance.word(),
    description: description(),
    script: script(),
    matchingLines: null,
    editor: defaultChance.last(),
    date: date(),
    // eslint-disable-next-line camelcase
    edition_date: date(),
    references: associations.references ?? [],
    editedInOraccProject: editedInOraccProject(),
    genres: new Genres([]),
  })
)

export const folioPagerEntryFactory = Factory.define<FragmentAndFolio>(() => ({
  fragmentNumber: defaultChance.string(),
  folioNumber: defaultChance.string(),
}))

export const folioPagerFactory = Factory.define<FolioPagerData>(
  ({ associations }) => ({
    previous: associations.previous ?? folioPagerEntryFactory.build(),
    next: associations.next ?? folioPagerEntryFactory.build(),
  })
)

export const textConfig: Partial<Text> = {
  genre: 'L',
  category: 1,
  index: 1,
  name: 'Palm and Vine',
  numberOfVerses: 930,
  approximateVerses: true,
  intro: 'Introduction',
  chapters: [],
  references: [],
}

type manuscriptAttestationTransientParams = {
  museumNumber?: string
}

export const manuscriptAttestationFactory = Factory.define<
  ManuscriptAttestation,
  manuscriptAttestationTransientParams
>(({ transientParams, associations }) => {
  const manuscript =
    associations.manuscript ??
    manuscriptFactory.build(transientParams.museumNumber ? transientParams : {})
  return new ManuscriptAttestation(
    associations.text ?? createText(textConfig),
    associations.chapterId ?? chapterIdFactory.build(),
    manuscript,
    manuscript.siglum
  )
})
