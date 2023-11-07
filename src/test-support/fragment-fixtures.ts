import { Factory } from 'fishery'
import { Chance } from 'chance'
import {
  Fragment,
  FragmentInfo,
  Measures,
  Script,
  UncuratedReference,
} from 'fragmentarium/domain/fragment'
import { RecordEntry } from 'fragmentarium/domain/RecordEntry'
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
import { periodModifiers, periods } from 'common/period'
import { ExternalNumbers } from 'fragmentarium/domain/FragmentDtos'
import { MesopotamianDate } from 'fragmentarium/domain/Date'
import { mesopotamianDateFactory } from './date-fixtures'
import {
  Archaeology,
  CommentedDateRange,
  ExcavationPlan,
  Findspot,
  excavationSites,
} from 'fragmentarium/domain/archaeology'

const defaultChance = new Chance()

function date(chance: Chance.Chance = defaultChance): string {
  return chance.date().toISOString()
}

function dateRange(): string {
  return `${date()}/${date()}`
}

function description(chance: Chance.Chance = defaultChance): string {
  return `${chance.sentence()}\n${chance.sentence()}`
}

function editedInOraccProject(chance: Chance.Chance = defaultChance): string {
  return chance.pickone(['ccp', 'dcclt', 'saao'])
}

function collection(chance: Chance.Chance = defaultChance): string {
  return chance.pickone([
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

export const recordFactory = RecordFactory.define(({ transientParams }) => {
  const chance = transientParams.chance ?? defaultChance

  return new RecordEntry({
    user: chance.last(),
    date: date(chance),
    type: chance.pickone(['Transliteration', 'Collation', 'Revision']),
  })
})

export const measuresFactory = Factory.define<Measures>(
  ({ transientParams }) => {
    const chance = transientParams.chance ?? defaultChance
    return {
      length: chance.floating({ min: 0, max: 100 }),
      width: chance.floating({ min: 0, max: 100 }),
      thickness: chance.floating({ min: 0, max: 100 }),
    }
  }
)

export const folioFactory = Factory.define<Folio>(
  ({ associations, transientParams }) => {
    const chance = transientParams.chance ?? defaultChance

    return new Folio({
      name:
        associations.name ?? chance.pickone(['WGL', 'FWG', 'EL', 'AKG', 'MJG']),
      number: associations.number ?? chance.string(),
    })
  }
)

export const uncuratedReferenceFactory = Factory.define<UncuratedReference>(
  () => ({
    document: defaultChance.sentence(),
    pages: defaultChance.n(defaultChance.natural, 5),
  })
)

export const scriptFactory = Factory.define<Script>(
  ({ associations, transientParams }) => {
    const chance = transientParams.chance ?? defaultChance
    return {
      period: associations.period ?? chance.pickone([...periods]),
      periodModifier:
        associations.periodModifier ?? chance.pickone([...periodModifiers]),
      uncertain: associations.uncertain ?? chance.bool(),
    }
  }
)

export const externalNumbersFactory = Factory.define<ExternalNumbers>(
  ({ associations, transientParams }) => {
    const chance = transientParams.chance ?? defaultChance
    return {
      cdliNumber: associations.cdliNumber ?? chance.string(),
      bmIdNumber: associations.bmIdNumber ?? chance.string(),
      archibabNumber: associations.archibabNumber ?? chance.string(),
      bdtnsNumber: associations.bdtnsNumber ?? chance.string(),
      urOnlineNumber: associations.urOnlineNumber ?? chance.string(),
      hilprechtJenaNumber: associations.hilprechtJenaNumber ?? chance.string(),
      hilprechtHeidelbergNumber:
        associations.hilprechtHeidelbergNumber ?? chance.string(),
      metropolitanNumber: associations.metropolitanNumber ?? chance.string(),
      louvreNumber: associations.louvreNumber ?? chance.string(),
      philadelphiaNumber: associations.philadelphiaNumber ?? chance.string(),
      achemenetNumber: associations.achemenetNumber ?? chance.string(),
      yalePeabodyNumber: associations.yalePeabodyNumber ?? chance.string(),
    }
  }
)

export const dateRangeFactory = Factory.define<CommentedDateRange>(
  ({ transientParams }) => {
    const chance = transientParams.chance ?? defaultChance
    return {
      start: chance.pickone([null, chance.integer({ min: -800, max: -750 })]),
      end: chance.pickone([null, chance.integer({ min: -740, max: -600 })]),
      notes: chance.sentence({ words: 2 }),
    }
  }
)

export const excavationPlanFactory = Factory.define<ExcavationPlan>(
  ({ transientParams }) => {
    const chance = transientParams.chance ?? defaultChance
    return {
      svg: '<svg></svg>',
      references: referenceFactory.buildList(1, {}, { transient: chance }),
    }
  }
)

export const findspotFactory = Factory.define<Findspot>(
  ({ transientParams, sequence }) => {
    const chance = transientParams.chance ?? defaultChance

    return new Findspot(
      sequence,
      chance.pickone(Object.values(excavationSites)),
      chance.word(),
      chance.word(),
      chance.pickone(['RESIDENTIAL', 'TEMPLE', 'UNKNOWN']),
      chance.pickone(['I', 'II', undefined]),
      dateRangeFactory.build(),
      excavationPlanFactory.buildList(1),
      chance.word(),
      chance.word(),
      chance.bool(),
      chance.sentence({ words: 3 })
    )
  }
)

export const archaeologyFactory = Factory.define<Archaeology>(
  ({ transientParams, sequence, associations }) => {
    const chance = transientParams.chance ?? defaultChance
    return {
      excavationNumber: `${chance.word()}.${sequence}`,
      site: chance.pickone(Object.values(excavationSites)),
      isRegularExcavation: chance.bool(),
      findspot: associations.findspot,
      findspotId: associations.findspot?.id,
    }
  }
)

export const fragmentFactory = Factory.define<Fragment>(
  ({ associations, sequence, transientParams }) => {
    const chance = transientParams.chance ?? defaultChance
    const museumNumber = `${chance.word()}.${sequence}`
    return new Fragment(
      museumNumber,
      chance.word(),
      chance.sentence({ words: 4 }),
      associations.joins ?? [
        [
          joinFactory.build(
            { museumNumber, isInFragmentarium: true },
            { transient: { chance } }
          ),
        ],
        [joinFactory.build({}, { transient: { chance } })],
      ],
      description(chance),
      associations.measures ??
        measuresFactory.build({}, { transient: { chance } }),
      collection(chance),
      chance.pickone(['NA', 'NB']),
      associations.folios ??
        folioFactory.buildList(2, {}, { transient: { chance } }),
      associations.record ??
        recordFactory.buildList(2, {}, { transient: { chance } }),
      associations.text ?? complexText,
      associations.notes ?? {
        text: 'Lorem @i{ipsum}',
        parts: [
          { text: 'Lorem ', type: 'StringPart' },
          { text: 'ipsum', type: 'EmphasisPart' },
        ],
      },
      associations.museum ?? Museum.of('The British Museum'),
      associations.references ??
        referenceFactory.buildList(2, {}, { transient: { chance } }),
      associations.uncuratedReferences ?? null,
      '',
      chance.bool(),
      associations.genres ??
        chance.pickone([
          new Genres([
            new Genre(['ARCHIVE', 'Administrative', 'Lists'], false),
            new Genre(['Other', 'Fake', 'Certain'], false),
          ]),
          new Genres([new Genre(['Other', 'Fake', 'Certain'], false)]),
        ]),
      editedInOraccProject(chance),
      associations.introduction ?? {
        text: 'Introduction',
        parts: [{ type: 'StringPart', text: 'Introduction' }],
      },
      associations.script ?? scriptFactory.build({}, { transient: { chance } }),
      associations.externalNumbers ??
        externalNumbersFactory.build({}, { transient: { chance } }),

      associations.projects ?? [],
      associations.date ??
        new MesopotamianDate(
          { value: '1' },
          { value: '1' },
          { value: '1' },
          undefined,
          undefined,
          true
        ),
      associations.datesInText ?? undefined,
      associations.archaeology ??
        archaeologyFactory.build({}, { transient: { chance } })
    )
  }
)

export const fragmentInfoFactory = Factory.define<FragmentInfo>(
  ({ associations }) => ({
    number: defaultChance.word(),
    accession: defaultChance.word(),
    description: description(),
    script: scriptFactory.build(),
    matchingLines: null,
    editor: defaultChance.last(),
    date: mesopotamianDateFactory.build(),
    datesInText: Array.from(
      {
        length: Math.floor(Math.random() * 6),
      },
      () => mesopotamianDateFactory.build()
    ),
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
