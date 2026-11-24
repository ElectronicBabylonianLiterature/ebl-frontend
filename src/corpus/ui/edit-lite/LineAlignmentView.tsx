import React, { useMemo } from 'react'
import {
  AnnotationWord,
  findWordPosition,
  listAlignableWords,
} from 'corpus/application/edit-lite/annotationWords'
import {
  AlignmentToken,
  LineAlignment,
  ManuscriptAlignment,
  setAlignmentToken,
  setManuscriptAlignment,
  setOmittedWords,
} from 'corpus/domain/alignment'
import { createLineAlignment, Line } from 'corpus/domain/line'
import ManuscriptWordAligners from 'corpus/ui/alignment/ManuscriptWordAligners'
import OmittedWordsSelect from 'corpus/ui/alignment/OmittedWordsSelect'
import Word from 'corpus/ui/alignment/Word'
import AlignmentWordForm from 'corpus/ui/edit-lite/AlignmentWordForm'
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
import { findViewDraft } from 'corpus/ui/edit-lite/lineAnnotations'
import useWordFlow from 'corpus/ui/edit-lite/useWordFlow'
import { alignmentKeysHint } from 'corpus/ui/edit-lite/wordKeys'
import WordPopover from 'corpus/ui/edit-lite/WordPopover'

interface EditorProps extends AnnotationViewProps {
  readonly line: Line
}

function AlignmentEditor({
  index,
  lineState,
  activity,
  activation,
  line,
}: EditorProps): JSX.Element {
  const { actions, canWrite } = useEditLiteContext()
  const initialAlignment = useMemo<LineAlignment>(
    () => createLineAlignment(line),
    [line],
  )
  const words = useMemo<AnnotationWord[]>(
    () => listAlignableWords(line),
    [line],
  )
  const alignment =
    findViewDraft(lineState, 'alignment')?.alignment ?? initialAlignment
  const isLocked = !canWrite || isAnnotationLocked(lineState)
  const flow = useWordFlow({
    index,
    view: 'alignment',
    words,
    isLocked,
    activation,
  })
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
      {canWrite && <KeyboardHint>{alignmentKeysHint}</KeyboardHint>}
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
            const changeToken = (
              tokenIndex: number,
              token: AlignmentToken,
            ): void =>
              change(
                variantIndex,
                manuscriptIndex,
                setAlignmentToken(manuscriptAlignment, tokenIndex, token),
              )
            const renderWord = (tokenIndex: number): JSX.Element => {
              const token = manuscriptAlignment.alignment[tokenIndex]
              const word = { variantIndex, manuscriptIndex, tokenIndex }
              return (
                <WordPopover
                  label={`Alignment of ${token.value}`}
                  position={findWordPosition(words, word) as number}
                  flow={flow}
                  toggle={
                    <Word
                      token={token}
                      reconstructionTokens={variant.reconstructionTokens}
                    />
                  }
                >
                  {(close): JSX.Element => (
                    <AlignmentWordForm
                      token={token}
                      reconstructionTokens={variant.reconstructionTokens}
                      flow={flow}
                      onChange={(changed): void =>
                        changeToken(tokenIndex, changed)
                      }
                      onClose={close}
                    />
                  )}
                </WordPopover>
              )
            }
            return (
              <>
                <span className="edit-lite-annotation__tokens">
                  <ManuscriptWordAligners
                    manuscriptLine={manuscriptLine}
                    alignment={manuscriptAlignment}
                    reconstructionTokens={variant.reconstructionTokens}
                    disabled={isLocked}
                    renderWord={renderWord}
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
      />
    </>
  )
}

export default function LineAlignmentView({
  index,
  lineState,
  activity,
  activation,
}: AnnotationViewProps): JSX.Element {
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
          activation={activation}
          line={line}
        />
      )}
    </LoadedResource>
  )
}
