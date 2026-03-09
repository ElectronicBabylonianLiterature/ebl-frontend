import { Factory } from 'fishery'
import Chance from 'chance'
import Reference, { ReferenceType } from 'bibliography/domain/Reference'
import BibliographyEntry, {
  CslData,
} from 'bibliography/domain/BibliographyEntry'
import { ReferenceDto } from 'bibliography/domain/referenceDto'

const defaultChance = new Chance()

function integer(min: number, max: number, chance?: Chance.Chance): number {
  return (chance || defaultChance).integer({ min: min, max: max })
}

function type(chance = defaultChance): ReferenceType {
  return chance.pickone([
    'EDITION',
    'DISCUSSION',
    'COPY',
    'PHOTO',
    'TRANSLATION',
    'ARCHAEOLOGY',
    'ACQUISITION',
    'SEAL',
  ])
}

const authorFactory = Factory.define<
  { given: string; family: string },
  { chance: Chance.Chance }
>(({ transientParams }) => {
  const chance = transientParams.chance ?? defaultChance
  return {
    given: chance.first(),
    family: chance.last(),
  }
})

export const cslDataFactory = Factory.define<
  CslData,
  { chance: Chance.Chance }
>(({ transientParams, associations }) => {
  const chance = transientParams.chance ?? defaultChance
  const issuedDate = chance.date()
  return {
    id: associations.id ?? chance.guid(),
    title: chance.sentence(),
    type: chance.pickone(['article-journal', 'paper-conference']),
    issued: {
      'date-parts': [
        [issuedDate.getFullYear(), issuedDate.getMonth(), issuedDate.getDate()],
      ],
    },
    volume: integer(1, 99, chance),
    page: `${integer(1, 99, chance)}-${integer(100, 999, chance)}`,
    issue: integer(1, 99, chance),
    'container-title': chance.sentence(),
    author: authorFactory.buildList(2, {}, { transient: { chance: chance } }),
    URL: chance.url(),
  }
})

export const cslDataWithContainerTitleShortFactory = cslDataFactory.params({
  'container-title-short': defaultChance.syllable(),
})

export const bibliographyEntryFactory = Factory.define<
  BibliographyEntry,
  CslData & { chance: Chance.Chance }
>(({ transientParams, associations }) => {
  const chance = transientParams.chance ?? defaultChance
  return new BibliographyEntry(
    cslDataFactory.build(transientParams, {
      transient: { chance },
      associations,
    }),
  )
})

export function buildBorger1957(): BibliographyEntry {
  return bibliographyEntryFactory.build(
    {},
    {
      transient: {
        author: [{ family: 'Borger' }],
        issued: { 'date-parts': [[1957]] },
      },
    },
  )
}

export const referenceDtoFactory = Factory.define<
  ReferenceDto,
  { chance: Chance.Chance }
>(({ associations, transientParams }) => {
  const chance = transientParams.chance ?? defaultChance
  return {
    id: chance.string(),
    type: type(chance),
    pages: `${chance.natural()}-${chance.natural()}`,
    notes: chance.sentence(),
    linesCited: chance.pickset(['1.', '2.', "3'.", "4'.2."], 2),
    document: associations.document ?? null,
  }
})

export const referenceFactory = Factory.define<
  Reference,
  { chance: Chance.Chance }
>(({ associations, transientParams }) => {
  const chance = transientParams.chance ?? defaultChance

  return new Reference(
    type(chance),
    `${chance.natural()}-${chance.natural()}`,
    chance.sentence(),
    chance.pickset(['1.', '2.', "3'.", "4'.2."], 2),
    associations.document ??
      bibliographyEntryFactory.build({}, { transient: { chance } }),
  )
})

export function buildReferenceWithContainerTitle(
  type: ReferenceType,
  cslData = {},
): Reference {
  return referenceFactory.build({
    type: type,
    document: bibliographyEntryFactory.build(
      {},
      { transient: cslDataWithContainerTitleShortFactory.build(cslData) },
    ),
  })
}

export function buildReferenceWithManyAuthors(): Reference {
  return referenceFactory.build({
    type: 'COPY',
    document: bibliographyEntryFactory.build(
      {},
      { transient: { author: authorFactory.buildList(4) } },
    ),
  })
}
