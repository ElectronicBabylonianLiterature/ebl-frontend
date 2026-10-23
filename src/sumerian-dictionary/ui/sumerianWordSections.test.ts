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
  ).toEqual([{ heading: 'I. Sources', parts: [], subsections: [] }])
})

it('numbers present sections in order and lists sub-parts only when there are several', () => {
  const word = sumerianWordFactory.build({
    epsd2Senses: [{ num: '1.', meaning: 'king', lang: 'en' }],
    renderings: [renderingFactory.build({ kind: 'key' })],
    epsd2Forms: [{ spelling: 'lugal', count: 3, percent: 100 }],
    signs: [signEntryFactory.build()],
    akkadianEquivalents: [
      { wordId: 'šarru I', source: 'borger', indexNumbers: '' },
    ],
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
  expect(summarize(buildSumerianWordSections(word))).toEqual([
    { heading: 'I. Meanings', parts: ['meanings-epsd2'], subsections: [] },
    {
      heading: 'II. Forms',
      parts: ['forms-key', 'forms-epsd2'],
      subsections: ['forms-key', 'forms-epsd2'],
    },
    { heading: 'III. Signs', parts: [], subsections: [] },
    { heading: 'IV. Akkadian Equivalents', parts: [], subsections: [] },
    { heading: 'V. Compounds', parts: ['compounds-names'], subsections: [] },
    { heading: 'VI. Citations', parts: [], subsections: [] },
    { heading: 'VII. See Also', parts: [], subsections: [] },
    { heading: 'VIII. Sources', parts: [], subsections: [] },
  ])
})

it('gives compound sub-parts their counts as notes', () => {
  const word = sumerianWordFactory.build({
    compounds: wordLinkFactory.buildList(2),
    nameCompounds: wordLinkFactory.buildList(1),
  })
  const compounds = buildSumerianWordSections(word)[0]
  expect(compounds.parts.map((part) => [part.label, part.note(word)])).toEqual([
    ['Words', '2'],
    ['Proper nouns', '1'],
  ])
})
