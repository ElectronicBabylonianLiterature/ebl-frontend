import React, { useMemo, useState } from 'react'
import {
  AnnotationWord,
  listLemmatizableWords,
} from 'corpus/application/edit-lite/annotationWords'
import { setWordLemma } from 'corpus/application/edit-lite/lemmaEdits'
import { LineLemmatization } from 'corpus/domain/lemmatization'
import { Line } from 'corpus/domain/line'
import {
  AnnotationControls,
  AnnotationVariant,
  AnnotationViewProps,
  isAnnotationLocked,
  KeyboardHint,
  LoadedResource,
  useAnnotation,
} from 'corpus/ui/edit-lite/AnnotationFrame'
import { useEditLiteContext } from 'corpus/ui/edit-lite/EditLiteContext'
import LemmaWord, { LemmaEditing } from 'corpus/ui/edit-lite/LemmaWord'
import { findViewDraft } from 'corpus/ui/edit-lite/lineAnnotations'
import { useLineFlow } from 'corpus/ui/edit-lite/LineFlowContext'
import useLemmaInstances from 'corpus/ui/edit-lite/useLemmaInstances'
import useWordFlow from 'corpus/ui/edit-lite/useWordFlow'
import { lemmatizationKeysHint } from 'corpus/ui/edit-lite/wordKeys'
import { WordLemmatizers } from 'corpus/ui/lemmatization/LineLemmatizers'
import {
  LemmatizationToken,
  UniqueLemma,
} from 'transliteration/domain/Lemmatization'

interface EditorProps extends AnnotationViewProps {
  readonly line: Line
  readonly initialLemmatization: readonly LineLemmatization[]
}

type LemmaChange = (uniqueLemma: UniqueLemma) => void
type WordRenderer = (
  token: LemmatizationToken,
  tokenIndex: number,
  onSetLemma: LemmaChange,
) => JSX.Element

function LemmatizationEditor({
  index,
  lineState,
  activity,
  activation,
  line,
  initialLemmatization,
}: EditorProps): JSX.Element {
  const context = useEditLiteContext()
  const { lemmatizationDraftLine } = useLineFlow()
  const [isHighlighting, setHighlighting] = useState(false)
  const words = useMemo<AnnotationWord[]>(
    () => listLemmatizableWords(line),
    [line],
  )
  const lemmatization =
    findViewDraft(lineState, 'lemmatization')?.lemmatization ??
    initialLemmatization
  const isLocked = !context.canWrite || isAnnotationLocked(lineState)
  const flow = useWordFlow({
    index,
    view: 'lemmatization',
    words,
    isLocked,
    activation,
  })
  const change = (changed: readonly LineLemmatization[]): void =>
    context.actions.changeAnnotation(
      index,
      { view: 'lemmatization', lemmatization: changed },
      line,
    )
  const instances = useLemmaInstances(
    index,
    activation,
    (position, uniqueLemma) =>
      change(setWordLemma(lemmatization, line, words[position], uniqueLemma)),
  )
  const editing: LemmaEditing = {
    line,
    words,
    lemmatization,
    loaded: initialLemmatization,
    flow,
    isHighlighting,
    blockingDraft: lemmatizationDraftLine,
    change,
    highlight: setHighlighting,
    updateAll: (position, word, uniqueLemma): void => {
      setHighlighting(false)
      flow.suspend()
      instances.request(position, word, uniqueLemma)
    },
  }
  const createRenderer = (
    variantIndex: number,
    manuscriptIndex: number | null,
  ): WordRenderer =>
    function renderWord(token, tokenIndex, onSetLemma): JSX.Element {
      return (
        <LemmaWord
          editing={editing}
          word={{ variantIndex, manuscriptIndex, tokenIndex }}
          token={token}
          onSetLemma={onSetLemma}
        />
      )
    }
  const createChange =
    (variantIndex: number, manuscriptIndex: number | null) =>
    (tokenIndex: number): LemmaChange =>
    (uniqueLemma) =>
      change(
        setWordLemma(
          lemmatization,
          line,
          { variantIndex, manuscriptIndex, tokenIndex },
          uniqueLemma,
        ),
      )

  return (
    <>
      {context.canWrite && <KeyboardHint>{lemmatizationKeysHint}</KeyboardHint>}
      {instances.problem !== null && (
        <p className="edit-lite-line__problem" role="alert">
          {instances.problem}
        </p>
      )}
      {line.variants.map((variant, variantIndex) => {
        const [reconstruction, manuscripts] = lemmatization[variantIndex]
        return (
          <AnnotationVariant
            key={variantIndex}
            variantIndex={variantIndex}
            variant={variant}
            isCaptionVisible={line.variants.length > 1}
            reconstruction={
              <WordLemmatizers
                tokens={reconstruction}
                onChange={createChange(variantIndex, null)}
                disabled={isLocked}
                renderWord={createRenderer(variantIndex, null)}
              />
            }
          >
            {(_manuscriptLine, manuscriptIndex): JSX.Element => (
              <span className="edit-lite-annotation__tokens">
                <WordLemmatizers
                  tokens={manuscripts[manuscriptIndex]}
                  onChange={createChange(variantIndex, manuscriptIndex)}
                  disabled={isLocked}
                  renderWord={createRenderer(variantIndex, manuscriptIndex)}
                />
              </span>
            )}
          </AnnotationVariant>
        )
      })}
      <AnnotationControls
        index={index}
        lineState={lineState}
        activity={activity}
        view="lemmatization"
      />
      {instances.dialog}
    </>
  )
}

export default function LineLemmatizationView({
  index,
  lineState,
  activity,
  activation,
}: AnnotationViewProps): JSX.Element {
  const retry = useAnnotation(index, lineState, 'lemmatization')
  const lemmas = lineState.annotation?.lemmas
  return (
    <LoadedResource
      resource={lineState.annotation?.tokens}
      loadingLabel="Loading lemmatization..."
      onRetry={retry}
    >
      {(line: Line): JSX.Element => (
        <LoadedResource
          resource={lemmas}
          loadingLabel="Loading lemmatization..."
          onRetry={retry}
        >
          {(initialLemmatization): JSX.Element => (
            <LemmatizationEditor
              index={index}
              lineState={lineState}
              activity={activity}
              activation={activation}
              line={line}
              initialLemmatization={initialLemmatization}
            />
          )}
        </LoadedResource>
      )}
    </LoadedResource>
  )
}
