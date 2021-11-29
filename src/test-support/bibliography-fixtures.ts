import { Factory } from 'fishery'
import Chance from 'chance'
import Reference, { ReferenceType } from 'bibliography/domain/Reference'
import BibliographyEntry, {
  CslData,
} from 'bibliography/domain/BibliographyEntry'
import { ReferenceDto } from 'bibliography/domain/referenceDto'

const defaultChance = new Chance()

function integer(min: number, max: number): number {
  return defaultChance.integer({ min: min, max: max })
}

function type(chance = defaultChance): ReferenceType {
  return chance.pickone([
    'EDITION',
    'DISCUSSION',
    'COPY',
    'PHOTO',
    'TRANSLATION',
  ])
}

const authorFactory = Factory.define<{ given: string; family: string }>(() => ({
  given: defaultChance.first(),
  family: defaultChance.last(),
}))

export const cslDataFactory = Factory.define<CslData>(() => {
  const issuedDate = defaultChance.date()
  return {
    id: defaultChance.guid(),
    title: defaultChance.sentence(),
    type: defaultChance.pickone(['article-journal', 'paper-conference']),
    issued: {
      'date-parts': [
        [issuedDate.getFullYear(), issuedDate.getMonth(), issuedDate.getDate()],
      ],
    },
    volume: integer(1, 99),
    page: `${integer(1, 99)}-${integer(100, 999)}`,
    issue: integer(1, 99),
    'container-title': defaultChance.sentence(),
    author: authorFactory.buildList(2),
    URL: defaultChance.url(),
  }
})

export const cslDataWithContainerTitleShortFactory = cslDataFactory.params({
  'container-title-short': defaultChance.syllable(),
})

export const bibliographyEntryFactory = Factory.define<
  BibliographyEntry,
  CslData
>(
  ({ transientParams }) =>
    new BibliographyEntry(cslDataFactory.build(transientParams))
)

export function buildBorger1957(): BibliographyEntry {
  return bibliographyEntryFactory.build(
    {},
    {
      transient: {
        author: [{ family: 'Borger' }],
        issued: { 'date-parts': [[1957]] },
      },
    }
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

export const referenceFactory = Factory.define<Reference>(
  ({ associations }) =>
    new Reference(
      type(),
      `${defaultChance.natural()}-${defaultChance.natural()}`,
      defaultChance.sentence(),
      defaultChance.pickset(['1.', '2.', "3'.", "4'.2."], 2),
      associations.document ?? bibliographyEntryFactory.build()
    )
)

export function buildReferenceWithContainerTitle(
  type: ReferenceType,
  cslData = {}
): Reference {
  return referenceFactory.build({
    type: type,
    document: bibliographyEntryFactory.build(
      {},
      { transient: cslDataWithContainerTitleShortFactory.build(cslData) }
    ),
  })
}

export function buildReferenceWithManyAuthors(): Reference {
  return referenceFactory.build({
    type: 'COPY',
    document: bibliographyEntryFactory.build(
      {},
      { transient: { author: authorFactory.buildList(4) } }
    ),
  })
}
