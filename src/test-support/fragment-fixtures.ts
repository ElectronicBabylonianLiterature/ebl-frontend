import { Factory } from 'fishery'
import { Chance } from 'chance'
import { Fragment, FragmentInfo } from 'fragmentarium/domain/fragment'
import { Museums } from 'fragmentarium/domain/museum'
import { Genre, Genres } from 'fragmentarium/domain/Genres'
import { referenceFactory } from './bibliography-fixtures'
import complexText from './complexTestText'
import { joinFactory } from './join-fixtures'
import { ManuscriptAttestation } from 'corpus/domain/manuscriptAttestation'
import { chapterIdFactory } from './chapter-fixtures'
import { manuscriptFactory } from './manuscript-fixtures'
import { Text, createText } from 'corpus/domain/text'
import { MesopotamianDate } from 'chronology/domain/Date'
import { mesopotamianDateFactory } from './date-fixtures'
import {
  archaeologyFactory,
  externalNumbersFactory,
  folioFactory,
  fragmentCollection,
  fragmentDate,
  fragmentDescription,
  measuresFactory,
  recordFactory,
  scriptFactory,
} from './fragment-data-fixtures'

const defaultChance = new Chance()

export const fragmentFactory = Factory.define<Fragment>(
  ({ associations, sequence, transientParams }) => {
    const chance = transientParams.chance ?? defaultChance
    const museumNumber = `${chance.word()}.${sequence}`
    const museum = associations.museum ?? Museums['THE_BRITISH_MUSEUM']

    return new Fragment(
      museumNumber,
      `${chance.word()}.${sequence}`,
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
      fragmentDescription(chance),
      associations.measures ??
        measuresFactory.build({}, { transient: { chance } }),
      fragmentCollection(chance),
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
      museum,
      associations.references ??
        referenceFactory.buildList(2, {}, { transient: { chance } }),
      associations.uncuratedReferences ?? null,
      [],
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
      associations.introduction ?? {
        text: 'Introduction',
        parts: [{ type: 'StringPart', text: 'Introduction' }],
      },
      associations.script ?? scriptFactory.build({}, { transient: { chance } }),
      associations.externalNumbers ??
        externalNumbersFactory.build({}, { transient: { chance } }),

      associations.projects ?? [],
      associations.dossiers ?? [],
      associations.date ??
        new MesopotamianDate({
          year: { value: '1' },
          month: { value: '1' },
          day: { value: '1' },
          isSeleucidEra: true,
        }),
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
    description: fragmentDescription(),
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
    edition_date: fragmentDate(),
    references: associations.references ?? [],
    genres: new Genres([]),
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
