import MemorySession from 'auth/Session'
import { createManuscriptLine, Line } from 'corpus/domain/line'
import {
  buildEditLiteLines,
  EditLiteRenderOptions,
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

export const lemmaOptions: EditLiteRenderOptions = {
  lines: lemmaLines,
  words: [enuma, elish, otherElish],
  suggestions: [{ word: 'enūma', isNormalized: true, lemmas: [['enūma I']] }],
}
