import {
  AnnotationWord,
  listLemmatizableWords,
} from 'corpus/application/edit-lite/annotationWords'
import { findLemmaToken } from 'corpus/application/edit-lite/lemmaEdits'
import { LineLemmatization } from 'corpus/domain/lemmatization'
import { Line } from 'corpus/domain/line'
import { buildEditLiteLines } from 'corpus/ui/edit-lite/editLite.testSupport'
import {
  annotateLine,
  buildDictionaryWord,
  buildLineLemmatization,
} from 'corpus/ui/edit-lite/editLiteTokens.testSupport'
import { buildAlignedLine } from 'corpus/ui/edit-lite/fakeAnnotationRequests.testSupport'
import Lemma from 'transliteration/domain/Lemma'

export type ListedLemma = [string[], boolean]

export const line: Line = annotateLine(
  buildAlignedLine(buildEditLiteLines(1)[0]),
)
export const words: readonly AnnotationWord[] = listLemmatizableWords(line)
export const [enuma, elish, firstEnuma, firstElish, secondElish] = words
export const lemma = new Lemma(buildDictionaryWord('eliš'))
export const otherLemma = new Lemma(buildDictionaryWord('eliš', 'II'))
const [[reconstruction, manuscripts]] = buildLineLemmatization(line)
export const loaded: LineLemmatization[] = [
  [
    [
      reconstruction[0],
      reconstruction[1].setUniqueLemma([otherLemma], true),
      ...reconstruction.slice(2),
    ],
    manuscripts,
  ],
]
export const stored: LineLemmatization[] = [
  [
    loaded[0][0],
    [
      [manuscripts[0][0], manuscripts[0][1].setUniqueLemma([otherLemma])],
      manuscripts[1],
    ],
  ],
]
export const empty: ListedLemma = [[], false]
export const accepted: ListedLemma = [['eliš I'], false]
export const otherAccepted: ListedLemma = [['eliš II'], false]
export const otherSuggested: ListedLemma = [['eliš II'], true]

export function listLemmas(
  lemmatization: readonly LineLemmatization[],
  listed: readonly AnnotationWord[] = words,
): ListedLemma[] {
  return listed.map((word) => {
    const token = findLemmaToken(lemmatization, word)
    return [
      (token.uniqueLemma ?? []).map((item) => item.value),
      token.suggested,
    ]
  })
}
