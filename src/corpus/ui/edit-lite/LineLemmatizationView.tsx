import React from 'react'
import {
  LineLemmatization,
  setManuscriptLemma,
  setReconstructionLemma,
} from 'corpus/domain/lemmatization'
import { Line } from 'corpus/domain/line'
import {
  AnnotationControls,
  AnnotationVariant,
  isAnnotationLocked,
  LoadedResource,
  useAnnotation,
} from 'corpus/ui/edit-lite/AnnotationFrame'
import { useEditLiteContext } from 'corpus/ui/edit-lite/EditLiteContext'
import { findViewDraft } from 'corpus/ui/edit-lite/lineAnnotations'
import { LineViewProps } from 'corpus/ui/edit-lite/LineTextView'
import { WordLemmatizers } from 'corpus/ui/lemmatization/LineLemmatizers'
import { UniqueLemma } from 'transliteration/domain/Lemmatization'

interface EditorProps extends LineViewProps {
  readonly line: Line
  readonly initialLemmatization: readonly LineLemmatization[]
}

type LemmaChange = (index: number) => (uniqueLemma: UniqueLemma) => void

function hasSuggestedLemma(
  lemmatization: readonly LineLemmatization[],
): boolean {
  return lemmatization
    .flatMap(([reconstruction, manuscripts]) => [
      ...reconstruction,
      ...manuscripts.flat(),
    ])
    .some((token) => token.suggested)
}

function LemmatizationEditor({
  index,
  lineState,
  activity,
  line,
  initialLemmatization,
}: EditorProps): JSX.Element {
  const context = useEditLiteContext()
  const lemmatization =
    findViewDraft(lineState, 'lemmatization')?.lemmatization ??
    initialLemmatization
  const isLocked = !context.canWrite || isAnnotationLocked(lineState)
  const createChange =
    (
      variantIndex: number,
      setLemma: (
        tokenIndex: number,
        uniqueLemma: UniqueLemma,
      ) => LineLemmatization,
    ): LemmaChange =>
    (tokenIndex) =>
    (uniqueLemma): void =>
      context.actions.changeAnnotation(
        index,
        {
          view: 'lemmatization',
          lemmatization: lemmatization.map((variantLemmatization, position) =>
            position === variantIndex
              ? setLemma(tokenIndex, uniqueLemma)
              : variantLemmatization,
          ),
        },
        line,
      )

  return (
    <>
      {line.variants.map((variant, variantIndex) => {
        const variantLemmatization = lemmatization[variantIndex]
        const [reconstruction, manuscripts] = variantLemmatization
        return (
          <AnnotationVariant
            key={variantIndex}
            variantIndex={variantIndex}
            variant={variant}
            isCaptionVisible={line.variants.length > 1}
            reconstruction={
              <WordLemmatizers
                tokens={reconstruction}
                fragmentService={context}
                onChange={createChange(
                  variantIndex,
                  (tokenIndex, uniqueLemma) =>
                    setReconstructionLemma(
                      variantLemmatization,
                      variant,
                      tokenIndex,
                      uniqueLemma,
                    ),
                )}
                disabled={isLocked}
              />
            }
          >
            {(_manuscriptLine, manuscriptIndex): JSX.Element => (
              <span className="edit-lite-annotation__tokens">
                <WordLemmatizers
                  tokens={manuscripts[manuscriptIndex]}
                  fragmentService={context}
                  onChange={createChange(
                    variantIndex,
                    (tokenIndex, uniqueLemma) =>
                      setManuscriptLemma(
                        variantLemmatization,
                        manuscriptIndex,
                        tokenIndex,
                        uniqueLemma,
                      ),
                  )}
                  disabled={isLocked}
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
        change={{ type: 'saveLemmatization', index, lemmatization }}
        hasSuggestions={hasSuggestedLemma(lemmatization)}
      />
    </>
  )
}

export default function LineLemmatizationView({
  index,
  lineState,
  activity,
}: LineViewProps): JSX.Element {
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
              line={line}
              initialLemmatization={initialLemmatization}
            />
          )}
        </LoadedResource>
      )}
    </LoadedResource>
  )
}
