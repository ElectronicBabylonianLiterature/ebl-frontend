import { Factory } from 'fishery'
import Chance from 'chance'
import Reference, { ReferenceType } from 'bibliography/domain/Reference'
import BibliographyEntry, {
  CslData,
} from 'bibliography/domain/BibliographyEntry'
import { ReferenceDto } from 'bibliography/domain/referenceDto'

const chance = new Chance()

function integer(min: number, max: number): number {
  return chance.integer({ min: min, max: max })
}

const authorFactory = Factory.define<{ given: string; family: string }>(() => ({
  given: chance.first(),
  family: chance.last(),
}))

export const cslDataFactory = Factory.define<CslData>(() => {
  const issuedDate = chance.date()
  return {
    id: chance.guid(),
    title: chance.sentence(),
    type: chance.pickone(['article-journal', 'paper-conference']),
    issued: {
      'date-parts': [
        [issuedDate.getFullYear(), issuedDate.getMonth(), issuedDate.getDate()],
      ],
    },
    volume: integer(1, 99).toString(),
    page: `${integer(1, 99)}-${integer(100, 999)}`,
    issue: integer(1, 99),
    'container-title': chance.sentence(),
    author: authorFactory.buildList(2),
    URL: chance.url(),
  }
})

export const cslDataWithContainerTitleShortFactory = cslDataFactory.params({
  'container-title-short': chance.syllable(),
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

export const referenceDtoFactory = Factory.define<ReferenceDto>(() => ({
  id: chance.string(),
  type: chance.pickone([
    'EDITION',
    'DISCUSSION',
    'COPY',
    'PHOTO',
    'TRANSLATION',
  ]),
  pages: `${chance.natural()}-${chance.natural()}`,
  notes: chance.sentence(),
  linesCited: chance.pickset(['1.', '2.', "3'.", "4'.2."], 2),
}))

export const referenceFactory = Factory.define<Reference>(
  () =>
    new Reference(
      chance.pickone(['EDITION', 'DISCUSSION', 'COPY', 'PHOTO', 'TRANSLATION']),
      `${chance.natural()}-${chance.natural()}`,
      chance.sentence(),
      chance.pickset(['1.', '2.', "3'.", "4'.2."], 2),
      bibliographyEntryFactory.build()
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
