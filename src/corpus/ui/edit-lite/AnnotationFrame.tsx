import React, { useCallback, useEffect } from 'react'
import _ from 'lodash'
import Spinner from 'common/ui/Spinner'
import { LineVariant, ManuscriptLine } from 'corpus/domain/line'
import { useEditLiteContext } from 'corpus/ui/edit-lite/EditLiteContext'
import {
  AnnotationView,
  LineState,
  Loadable,
} from 'corpus/ui/edit-lite/editLiteState'
import { isAnnotationUnrequested } from 'corpus/ui/edit-lite/lineAnnotations'
import {
  findProgressLabel,
  isLayoutChanging,
} from 'corpus/ui/edit-lite/lineStates'
import { LineViewProps } from 'corpus/ui/edit-lite/LineTextView'
import LoadFailure from 'corpus/ui/edit-lite/LoadFailure'
import { findSiglumLabel } from 'corpus/ui/edit-lite/manuscriptSigla'
import SaveControls from 'corpus/ui/edit-lite/SaveControls'
import { WordActivation } from 'corpus/ui/edit-lite/useWordFlow'
import 'corpus/ui/edit-lite/LineViews.sass'

interface ResourceProps<Value> {
  readonly resource: Loadable<Value> | null | undefined
  readonly loadingLabel: string
  readonly onRetry: () => void
  readonly children: (value: Value) => JSX.Element
}

interface VariantProps {
  readonly variantIndex: number
  readonly variant: LineVariant
  readonly isCaptionVisible: boolean
  readonly reconstruction: React.ReactNode
  readonly children: (
    manuscriptLine: ManuscriptLine,
    manuscriptIndex: number,
  ) => React.ReactNode
}

interface ControlsProps extends LineViewProps {
  readonly view: AnnotationView
}

export interface AnnotationViewProps extends LineViewProps {
  readonly activation: WordActivation
}

export const staleAnnotationNote =
  'These changes were made on an older version of the line and cannot be saved. Reset to load the line again.'

export function useAnnotation(
  index: number,
  lineState: LineState,
  view: AnnotationView,
): () => void {
  const { actions } = useEditLiteContext()
  const isUnrequested = isAnnotationUnrequested(lineState, view)
  const open = useCallback(
    (): void => actions.openAnnotation(index, view),
    [actions, index, view],
  )

  useEffect(() => {
    if (isUnrequested) {
      open()
    }
  }, [isUnrequested, open])

  return open
}

export function isAnnotationLocked(lineState: LineState): boolean {
  return (
    findProgressLabel(lineState.status) !== null ||
    lineState.annotation?.isStale === true
  )
}

export function LoadedResource<Value>({
  resource,
  loadingLabel,
  onRetry,
  children,
}: ResourceProps<Value>): JSX.Element {
  if (resource?.status === 'ready') {
    return children(resource.value)
  }
  return resource?.status === 'failed' ? (
    <LoadFailure error={resource.error} onRetry={onRetry} />
  ) : (
    <Spinner>{loadingLabel}</Spinner>
  )
}

export function KeyboardHint({ children }: { children: string }): JSX.Element {
  return <p className="edit-lite-views__hint">{children}</p>
}

export function AnnotationVariant({
  variantIndex,
  variant,
  isCaptionVisible,
  reconstruction,
  children,
}: VariantProps): JSX.Element {
  const { manuscripts } = useEditLiteContext()
  const caption = `Variant ${variantIndex + 1}`
  return (
    <div className="edit-lite-variant" role="group" aria-label={caption}>
      {isCaptionVisible && (
        <span className="edit-lite-variant__caption" aria-hidden="true">
          {caption}
        </span>
      )}
      <div
        className="edit-lite-annotation__reconstruction"
        role="group"
        aria-label="Reconstruction"
        dir="auto"
      >
        {reconstruction}
      </div>
      {variant.manuscripts.map((manuscriptLine, manuscriptIndex) => (
        <div
          key={manuscriptIndex}
          className="edit-lite-annotation__row"
          role="group"
          aria-label={`Manuscript line ${manuscriptIndex + 1}`}
        >
          <span className="edit-lite-annotation__siglum">
            {findSiglumLabel(manuscripts, manuscriptLine.manuscriptId)}
          </span>
          <span className="edit-lite-annotation__number">
            {_.compact([...manuscriptLine.labels, manuscriptLine.number]).join(
              ' ',
            )}
          </span>
          {children(manuscriptLine, manuscriptIndex)}
        </div>
      ))}
    </div>
  )
}

export function AnnotationControls({
  index,
  lineState,
  activity,
  view,
}: ControlsProps): JSX.Element | null {
  const { actions, canWrite } = useEditLiteContext()
  const isStale = lineState.annotation?.isStale === true
  const hasDraft = lineState.annotation?.draft != null

  return canWrite ? (
    <>
      {isStale && (
        <p className="edit-lite-line__problem" role="status">
          {staleAnnotationNote}
        </p>
      )}
      <SaveControls
        saveLabel={`Save ${view}`}
        canSubmit={hasDraft && !isStale && !isLayoutChanging(activity)}
        canReset={hasDraft || lineState.status === 'failed'}
        progressLabel={findProgressLabel(lineState.status)}
        onSave={(): void => actions.saveAnnotation(index, view)}
        onReset={(): void => actions.resetLine(index)}
      />
    </>
  ) : null
}
