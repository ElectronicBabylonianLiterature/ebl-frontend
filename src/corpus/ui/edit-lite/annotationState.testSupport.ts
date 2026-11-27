import { listLemmatizableWords } from 'corpus/application/edit-lite/annotationWords'
import { setWordLemma } from 'corpus/application/edit-lite/lemmaEdits'
import { setOmittedWords } from 'corpus/domain/alignment'
import { LineLemmatization } from 'corpus/domain/lemmatization'
import { createLineAlignment, Line } from 'corpus/domain/line'
import {
  buildEditLiteLines,
  buildEditLiteOutline,
  buildLinesLoadedActions,
  reduceEditLite,
} from 'corpus/ui/edit-lite/editLite.testSupport'
import { createEditLiteState } from 'corpus/ui/edit-lite/editLiteReducer'
import {
  AnnotationDraft,
  EditLiteAction,
  EditLiteState,
  LineAnnotation,
} from 'corpus/ui/edit-lite/editLiteState'
import {
  annotateLine,
  buildDictionaryWord,
  buildLineLemmatization,
} from 'corpus/ui/edit-lite/editLiteTokens.testSupport'
import {
  failedResource,
  readyResource,
} from 'corpus/ui/edit-lite/lineAnnotations'
import Lemma from 'transliteration/domain/Lemma'

export const draftOmittedWords: readonly number[] = [1]

export function buildTokensLoadedActions(
  index: number,
  original: Line,
  annotatedLine: Line,
): EditLiteAction[] {
  return [
    { type: 'annotationRequested', index },
    {
      type: 'annotationSettled',
      original,
      tokens: readyResource(annotatedLine),
    },
  ]
}

export function buildTokensFailedActions(
  index: number,
  original: Line,
  error: string,
): EditLiteAction[] {
  return [
    { type: 'annotationRequested', index },
    { type: 'annotationSettled', original, tokens: failedResource(error) },
  ]
}

export function buildLemmasLoadedActions(
  index: number,
  annotatedLine: Line,
  lemmatization: readonly LineLemmatization[],
): EditLiteAction[] {
  return [
    { type: 'lemmasRequested', index },
    {
      type: 'lemmasSettled',
      line: annotatedLine,
      lemmas: readyResource(lemmatization),
    },
  ]
}

export type AlignmentDraft = Extract<
  AnnotationDraft,
  { readonly view: 'alignment' }
>

export function buildAlignmentDraft(annotatedLine: Line): AlignmentDraft {
  const [[firstManuscript, ...manuscripts], ...variants] =
    createLineAlignment(annotatedLine)
  return {
    view: 'alignment',
    alignment: [
      [
        setOmittedWords(firstManuscript, [...draftOmittedWords]),
        ...manuscripts,
      ],
      ...variants,
    ],
  }
}

export const draftLemma = new Lemma(buildDictionaryWord('draft'))

export function buildLemmatizationDraft(annotatedLine: Line): AnnotationDraft {
  const [word] = listLemmatizableWords(annotatedLine)
  const lemmatization = buildLineLemmatization(annotatedLine)
  return {
    view: 'lemmatization',
    lemmatization: setWordLemma(
      lemmatization,
      lemmatization,
      annotatedLine,
      word,
      [draftLemma],
    ),
  }
}

export function buildReadyAnnotation(
  annotatedLine: Line,
  config: Partial<LineAnnotation> = {},
): LineAnnotation {
  return {
    tokens: readyResource(annotatedLine),
    lemmas: null,
    draft: null,
    isStale: false,
    ...config,
  }
}

export interface AnnotationStates {
  readonly lines: readonly Line[]
  readonly annotatedLine: Line
  readonly lemmatization: readonly LineLemmatization[]
  readonly draft: AnnotationDraft
  readonly tokensState: EditLiteState
  readonly cleanState: EditLiteState
  readonly draftState: EditLiteState
}

export function buildAnnotationStates(
  lineCount: number,
  position: number,
): AnnotationStates {
  const lines = buildEditLiteLines(lineCount)
  const annotatedLine = annotateLine(lines[position])
  const lemmatization = buildLineLemmatization(annotatedLine)
  const draft = buildAlignmentDraft(annotatedLine)
  const tokensState = reduceEditLite(
    createEditLiteState(buildEditLiteOutline(lines)),
    ...buildLinesLoadedActions(0, lines.slice(0, lineCount - 1)),
    ...buildTokensLoadedActions(position, lines[position], annotatedLine),
  )
  const cleanState = reduceEditLite(
    tokensState,
    ...buildLemmasLoadedActions(position, annotatedLine, lemmatization),
  )
  const draftState = reduceEditLite(cleanState, {
    type: 'annotationChanged',
    index: position,
    line: annotatedLine,
    draft,
  })
  return {
    lines,
    annotatedLine,
    lemmatization,
    draft,
    tokensState,
    cleanState,
    draftState,
  }
}
