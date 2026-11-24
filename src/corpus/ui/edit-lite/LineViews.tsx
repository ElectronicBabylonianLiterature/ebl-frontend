import React, { useEffect, useId, useMemo, useState } from 'react'
import { Tab, Tabs } from 'react-bootstrap'
import { AnnotationView, LineView } from 'corpus/ui/edit-lite/editLiteState'
import LineAlignmentView from 'corpus/ui/edit-lite/LineAlignmentView'
import { useLineFlow } from 'corpus/ui/edit-lite/LineFlowContext'
import LineLemmatizationView from 'corpus/ui/edit-lite/LineLemmatizationView'
import { findUnsavedView } from 'corpus/ui/edit-lite/lineStates'
import LineTextView, {
  LineTextViewProps,
} from 'corpus/ui/edit-lite/LineTextView'
import {
  idleWordActivation,
  WordActivation,
} from 'corpus/ui/edit-lite/useWordFlow'
import 'corpus/ui/edit-lite/LineViews.sass'

interface OpenedView {
  readonly view: LineView
  readonly position: number | null
}

interface TabProps {
  readonly eventKey: LineView
  readonly title: string
  readonly disabled: boolean
  readonly tabAttrs: Record<string, string> | undefined
}

export const lineViewLabels: Readonly<Record<LineView, string>> = {
  text: 'Text',
  alignment: 'Alignment',
  lemmatization: 'Lemmatization',
}

export function describeLockedViews(unsavedView: LineView): string {
  const changes = lineViewLabels[unsavedView].toLowerCase()
  return `Save or reset the unsaved ${changes} changes of this line to open the other views.`
}

export default function LineViews(props: LineTextViewProps): JSX.Element {
  const { index, lineState, activity } = props
  const id = useId()
  const unsavedView = findUnsavedView(lineState)
  const { arrivalView, settleArrival } = useLineFlow()
  const [{ view, position }, setOpened] = useState<OpenedView>(() => {
    const initialView = unsavedView ?? arrivalView ?? 'text'
    return {
      view: initialView,
      position: initialView === arrivalView ? 0 : null,
    }
  })
  const activation = useMemo<WordActivation>(
    () => ({
      position,
      settle: (): void =>
        setOpened((opened) => ({ ...opened, position: null })),
      request: (requested: number): void =>
        setOpened((opened) => ({ ...opened, position: requested })),
    }),
    [position],
  )
  const findActivation = (annotationView: AnnotationView): WordActivation =>
    view === annotationView ? activation : idleWordActivation

  useEffect(settleArrival, [settleArrival])
  const note = unsavedView === null ? null : describeLockedViews(unsavedView)
  const noteId = `${id}-note`
  const createTabProps = (eventKey: LineView): TabProps => {
    const disabled = unsavedView !== null && unsavedView !== eventKey
    return {
      eventKey,
      title: lineViewLabels[eventKey],
      disabled,
      tabAttrs: disabled ? { 'aria-describedby': noteId } : undefined,
    }
  }

  return (
    <div className="edit-lite-views">
      <Tabs
        id={id}
        activeKey={view}
        onSelect={(key: string | null): void =>
          setOpened({ view: key as LineView, position: 0 })
        }
        aria-label="Views of the line"
        mountOnEnter
        unmountOnExit
        transition={false}
      >
        <Tab {...createTabProps('text')}>
          <LineTextView {...props} />
        </Tab>
        <Tab {...createTabProps('alignment')}>
          <LineAlignmentView
            index={index}
            lineState={lineState}
            activity={activity}
            activation={findActivation('alignment')}
          />
        </Tab>
        <Tab {...createTabProps('lemmatization')}>
          <LineLemmatizationView
            index={index}
            lineState={lineState}
            activity={activity}
            activation={findActivation('lemmatization')}
          />
        </Tab>
      </Tabs>
      {note !== null && (
        <p id={noteId} className="edit-lite-views__note" role="note">
          {note}
        </p>
      )}
    </div>
  )
}
