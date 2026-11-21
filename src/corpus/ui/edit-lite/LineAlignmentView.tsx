import React, { useMemo } from 'react'
import {
  LineAlignment,
  ManuscriptAlignment,
  setAlignmentToken,
  setManuscriptAlignment,
  setOmittedWords,
} from 'corpus/domain/alignment'
import { createLineAlignment, Line } from 'corpus/domain/line'
import ManuscriptWordAligners from 'corpus/ui/alignment/ManuscriptWordAligners'
import OmittedWordsSelect from 'corpus/ui/alignment/OmittedWordsSelect'
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

interface EditorProps extends LineViewProps {
  readonly line: Line
}

function hasSuggestedAlignment(alignment: LineAlignment): boolean {
  return alignment
    .flat()
    .some((manuscript) => manuscript.alignment.some((token) => token.suggested))
}

function AlignmentEditor({
  index,
  lineState,
  activity,
  line,
}: EditorProps): JSX.Element {
  const { actions, canWrite } = useEditLiteContext()
  const initialAlignment = useMemo<LineAlignment>(
    () => createLineAlignment(line),
    [line],
  )
  const alignment =
    findViewDraft(lineState, 'alignment')?.alignment ?? initialAlignment
  const isLocked = !canWrite || isAnnotationLocked(lineState)
  const change = (
    variantIndex: number,
    manuscriptIndex: number,
    manuscriptAlignment: ManuscriptAlignment,
  ): void =>
    actions.changeAnnotation(
      index,
      {
        view: 'alignment',
        alignment: setManuscriptAlignment(
          alignment,
          variantIndex,
          manuscriptIndex,
          manuscriptAlignment,
        ),
      },
      line,
    )

  return (
    <>
      {line.variants.map((variant, variantIndex) => (
        <AnnotationVariant
          key={variantIndex}
          variantIndex={variantIndex}
          variant={variant}
          isCaptionVisible={line.variants.length > 1}
          reconstruction={variant.reconstruction}
        >
          {(manuscriptLine, manuscriptIndex): JSX.Element => {
            const manuscriptAlignment = alignment[variantIndex][manuscriptIndex]
            return (
              <>
                <span className="edit-lite-annotation__tokens">
                  <ManuscriptWordAligners
                    manuscriptLine={manuscriptLine}
                    alignment={manuscriptAlignment}
                    reconstructionTokens={variant.reconstructionTokens}
                    onChange={(tokenIndex, token): void =>
                      change(
                        variantIndex,
                        manuscriptIndex,
                        setAlignmentToken(
                          manuscriptAlignment,
                          tokenIndex,
                          token,
                        ),
                      )
                    }
                    disabled={isLocked}
                  />
                </span>
                <div className="edit-lite-annotation__omitted">
                  <OmittedWordsSelect
                    label="Omitted words"
                    value={manuscriptAlignment.omittedWords}
                    reconstructionTokens={variant.reconstructionTokens}
                    onChange={(omittedWords: number[]): void =>
                      change(
                        variantIndex,
                        manuscriptIndex,
                        setOmittedWords(manuscriptAlignment, omittedWords),
                      )
                    }
                    disabled={isLocked}
                  />
                </div>
              </>
            )
          }}
        </AnnotationVariant>
      ))}
      <AnnotationControls
        index={index}
        lineState={lineState}
        activity={activity}
        view="alignment"
        change={{ type: 'saveAlignment', index, alignment }}
        hasSuggestions={hasSuggestedAlignment(alignment)}
      />
    </>
  )
}

export default function LineAlignmentView({
  index,
  lineState,
  activity,
}: LineViewProps): JSX.Element {
  const retry = useAnnotation(index, lineState, 'alignment')
  return (
    <LoadedResource
      resource={lineState.annotation?.tokens}
      loadingLabel="Loading alignment..."
      onRetry={retry}
    >
      {(line: Line): JSX.Element => (
        <AlignmentEditor
          index={index}
          lineState={lineState}
          activity={activity}
          line={line}
        />
      )}
    </LoadedResource>
  )
}
