import { buildSumerianWordSections } from 'sumerian-dictionary/ui/sumerianWordSections'
import {
  renderingFactory,
  signEntryFactory,
  sumerianWordFactory,
  wordLinkFactory,
} from 'test-support/sumerian-dictionary-fixtures'

interface SectionSummary {
  readonly heading: string
  readonly parts: readonly string[]
  readonly subsections: readonly string[]
}

function summarize(
  sections: ReturnType<typeof buildSumerianWordSections>,
): readonly SectionSummary[] {
  return sections.map((section) => ({
    heading: section.heading,
    parts: section.parts.map((part) => part.id),
    subsections: section.subsections.map((subsection) => subsection.id),
  }))
}

it('keeps only Sources for an empty word', () => {
  expect(
    summarize(buildSumerianWordSections(sumerianWordFactory.build())),
  ).toEqual([{ heading: 'Sources', parts: [], subsections: [] }])
})

it('groups the parts by source and lists sub-parts only when there are several', () => {
  const word = sumerianWordFactory.build({
    epsd2Senses: [{ num: '1.', meaning: 'king', lang: 'en' }],
    renderings: [renderingFactory.build({ kind: 'key' })],
    epsd2Forms: [{ spelling: 'lugal', count: 3, percent: 100 }],
    signs: [signEntryFactory.build()],
    nameCompounds: [wordLinkFactory.build()],
    citations: [{ work: 'ELA', passage: '1', etcsl: '', compositionId: '' }],
    crossReferences: [
      {
        relation: 'see',
        target: 'x',
        targets: [],
        nameTargets: [],
        method: 'm',
        ambiguous: false,
      },
    ],
  })
  const attingerParts = [
    'attinger-citation-forms',
    'attinger-name-compounds',
    'attinger-citations',
    'attinger-see-also',
  ]
  expect(summarize(buildSumerianWordSections(word))).toEqual([
    {
      heading: 'Attinger’s Glossaire',
      parts: attingerParts,
      subsections: attingerParts,
    },
    {
      heading: 'ePSD2',
      parts: ['epsd2-meanings', 'epsd2-spellings'],
      subsections: ['epsd2-meanings', 'epsd2-spellings'],
    },
    { heading: 'Signs', parts: [], subsections: [] },
    { heading: 'Sources', parts: [], subsections: [] },
  ])
})

it('keeps a source section for its source alone and notes the sign list', () => {
  const sections = buildSumerianWordSections(
    sumerianWordFactory.build({
      signs: [signEntryFactory.build()],
      sources: {
        attinger: null,
        epsd2: { oid: 'o1', headword: 'lugal[king]N', builds: [] },
      },
    }),
  )
  expect(sections.map((section) => [section.heading, section.note])).toEqual([
    ['ePSD2', ''],
    ['Signs', 'from the eBL sign list'],
    ['Sources', ''],
  ])
})

it('gives the meanings their language and the counted parts their counts', () => {
  const word = sumerianWordFactory.build({
    attingerSenses: [{ meaning: 'roi', lang: 'fr', entryId: 'att-1' }],
    epsd2Senses: [{ num: '1.', meaning: 'king', lang: 'en' }],
    compounds: wordLinkFactory.buildList(2),
    nameCompounds: wordLinkFactory.buildList(1),
    citations: [{ work: 'ELA', passage: '1', etcsl: '', compositionId: '' }],
  })
  const notes = buildSumerianWordSections(word).flatMap((section) =>
    section.parts.map((part) => [part.id, part.note(word)]),
  )
  expect(notes).toEqual([
    ['attinger-meanings', 'French'],
    ['attinger-compounds', '2'],
    ['attinger-name-compounds', '1'],
    ['attinger-citations', '1'],
    ['epsd2-meanings', 'English'],
  ])
})
