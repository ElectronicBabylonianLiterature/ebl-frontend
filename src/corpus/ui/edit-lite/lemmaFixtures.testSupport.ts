import MemorySession from 'auth/Session'
import {
  createLine,
  createManuscriptLine,
  createVariant,
  Line,
} from 'corpus/domain/line'
import {
  buildEditLiteLines,
  EditLiteRenderOptions,
  FakeChapterEditSource,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import {
  buildDictionaryWord,
  createWordToken,
} from 'corpus/ui/edit-lite/editLiteTokens.testSupport'
import { buildAlignedLine } from 'corpus/ui/edit-lite/fakeAnnotationRequests.testSupport'
import {
  setLineVariant,
  setVariantManuscriptLine,
} from 'corpus/ui/edit-lite/lineDraft'
import Word from 'dictionary/domain/Word'

export const enuma: Word = buildDictionaryWord('enūma')
export const elish: Word = buildDictionaryWord('eliš')
export const otherElish: Word = buildDictionaryWord('eliš', 'II')
export const properNounSession = new MemorySession(['create:proper_nouns'])

const [alignedLine, ...otherLines]: Line[] =
  buildEditLiteLines(4).map(buildAlignedLine)
const [variant] = alignedLine.variants
const [, secondManuscript] = variant.manuscripts

export const lemmaLines: readonly Line[] = [
  setLineVariant(
    alignedLine,
    0,
    setVariantManuscriptLine(
      variant,
      1,
      createManuscriptLine({
        ...secondManuscript,
        atfTokens: [
          ...secondManuscript.atfTokens.slice(0, 3),
          createWordToken('e-li-iš', 'Word', {
            alignment: 3,
            uniqueLemma: ['eliš II'],
          }),
        ],
      }),
    ),
  ),
  ...otherLines,
]

const [firstLemmaLine] = lemmaLines
const [firstLemmaVariant] = firstLemmaLine.variants

export const storedLemmaLines: readonly Line[] = [
  setLineVariant(
    firstLemmaLine,
    0,
    createVariant({
      ...firstLemmaVariant,
      reconstructionTokens: firstLemmaVariant.reconstructionTokens.map(
        (token, index) =>
          index === 3
            ? createWordToken('eliš', 'AkkadianWord', {
                uniqueLemma: ['eliš I'],
              })
            : token,
      ),
    }),
  ),
  ...otherLines,
]

export const twoVariantLines: readonly Line[] = [
  buildAlignedLine(
    createLine({
      number: '1',
      variants: [
        createVariant({
          reconstruction: '%n enūma | eliš',
          manuscripts: [
            createManuscriptLine({
              manuscriptId: 1,
              labels: ['o'],
              number: '1',
              atf: 'e-nu-ma e-liš',
            }),
          ],
        }),
        createVariant({
          reconstruction: '%n šapliš | erṣetu',
          manuscripts: [
            createManuscriptLine({
              manuscriptId: 2,
              labels: ['o'],
              number: '1',
              atf: 'šap-liš er-ṣe-tu',
            }),
          ],
        }),
      ],
    }),
  ),
  ...otherLines,
]

export const lemmaOptions: EditLiteRenderOptions = {
  lines: lemmaLines,
  words: [enuma, elish, otherElish],
  suggestions: [{ word: 'enūma', isNormalized: true, lemmas: [['enūma I']] }],
}

export async function listStoredLemmas(
  source: FakeChapterEditSource,
  variantIndex = 0,
): Promise<unknown[]> {
  const variant = (await source.loadAnnotatedLine(0)).variants[variantIndex]
  return [
    variant.reconstructionTokens,
    ...variant.manuscripts.map((manuscript) => manuscript.atfTokens),
  ].map((tokens) =>
    tokens.flatMap((token) => (token.lemmatizable ? [token.uniqueLemma] : [])),
  )
}
