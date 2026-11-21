import React from 'react'
import { render, RenderResult } from '@testing-library/react'
import { ChapterEditSource } from 'corpus/application/edit-lite/ChapterEditSource'
import { ChapterOutline } from 'corpus/application/edit-lite/chapterOutline'
import { Line } from 'corpus/domain/line'
import EditLiteContext, {
  EditLiteContextValue,
} from 'corpus/ui/edit-lite/EditLiteContext'
import {
  buildEditLiteLines,
  buildEditLiteOutline,
  buildLinesLoadedActions,
} from 'corpus/ui/edit-lite/editLiteFixtures.testSupport'
import {
  createEditLiteState,
  editLiteReducer,
} from 'corpus/ui/edit-lite/editLiteReducer'
import {
  EditLiteAction,
  EditLiteState,
} from 'corpus/ui/edit-lite/editLiteState'
import { EditLiteStore } from 'corpus/ui/edit-lite/editLiteStore'
import {
  createFakeChapterEditSource,
  FakeChapterEditSource,
  FakeChapterEditSourceOptions,
} from 'corpus/ui/edit-lite/fakeChapterEditSource.testSupport'
import useEditLite, { EditLite } from 'corpus/ui/edit-lite/useEditLite'

export {
  buildAnnotatedLineUrl,
  buildAnnotationUrl,
  buildEditLiteLines,
  buildEditLiteOutline,
  buildLineSavedActions,
  buildLinesFailedActions,
  buildLinesLoadedActions,
  buildLineUrl,
  buildMoveUrl,
  editLiteManuscripts,
  editLiteRevision,
  listLineNumbers,
} from 'corpus/ui/edit-lite/editLiteFixtures.testSupport'
export {
  createFakeChapterEditSource,
  toSavedLine,
} from 'corpus/ui/edit-lite/fakeChapterEditSource.testSupport'
export type {
  FakeChapterEditSource,
  FakeChapterEditSourceOptions,
} from 'corpus/ui/edit-lite/fakeChapterEditSource.testSupport'

export type EditLiteUi =
  | React.ReactElement
  | ((state: EditLiteState) => React.ReactElement)

export interface EditLiteRenderOptions extends FakeChapterEditSourceOptions {
  readonly source?: FakeChapterEditSource
  readonly outline?: ChapterOutline
  readonly canWrite?: boolean
}

export interface EditLiteRenderResult extends Omit<RenderResult, 'rerender'> {
  readonly source: FakeChapterEditSource
  readonly outline: ChapterOutline
  getState(): EditLiteState
  getContext(): EditLiteContextValue
  rerender(ui: EditLiteUi): void
}

export interface RecordedEditLiteStore {
  readonly store: EditLiteStore
  readonly events: string[]
}

interface HarnessProps {
  readonly source: FakeChapterEditSource
  readonly outline: ChapterOutline
  readonly canWrite: boolean
  readonly ui: EditLiteUi
  readonly latest: { current?: EditLite }
}

export function reduceEditLite(
  state: EditLiteState,
  ...actions: readonly EditLiteAction[]
): EditLiteState {
  return actions.reduce(editLiteReducer, state)
}

export function createFakeEditLiteStore(
  source: ChapterEditSource,
  initialState: EditLiteState,
  onDispatch: (action: EditLiteAction) => void,
): EditLiteStore {
  let state = initialState
  return {
    getState: (): EditLiteState => state,
    getSource: (): ChapterEditSource => source,
    dispatch: (action: EditLiteAction): void => {
      state = editLiteReducer(state, action)
      onDispatch(action)
    },
  }
}

export function createRecordedEditLiteStore(
  lines: readonly Line[],
): RecordedEditLiteStore {
  const events: string[] = []
  const store = createFakeEditLiteStore(
    createFakeChapterEditSource({ lines }),
    reduceEditLite(
      createEditLiteState(buildEditLiteOutline(lines)),
      ...buildLinesLoadedActions(0, lines),
    ),
    (action: EditLiteAction): void => {
      events.push(action.type)
      void Promise.resolve().then(() => events.push(`after ${action.type}`))
    },
  )
  return { store, events }
}

function EditLiteHarness({
  source,
  outline,
  canWrite,
  ui,
  latest,
}: HarnessProps): JSX.Element {
  const editLite = useEditLite(source, outline, canWrite)
  latest.current = editLite
  return (
    <EditLiteContext.Provider value={editLite.context}>
      {typeof ui === 'function' ? ui(editLite.state) : ui}
    </EditLiteContext.Provider>
  )
}

export function renderWithEditLite(
  ui: EditLiteUi,
  options: EditLiteRenderOptions = {},
): EditLiteRenderResult {
  const lines = options.lines ?? buildEditLiteLines()
  const source =
    options.source ?? createFakeChapterEditSource({ ...options, lines })
  const outline = options.outline ?? buildEditLiteOutline(lines)
  const latest: { current?: EditLite } = {}
  const harnessProps = {
    source,
    outline,
    latest,
    canWrite: options.canWrite ?? true,
  }
  const wrap = (wrappedUi: EditLiteUi): JSX.Element => (
    <EditLiteHarness {...harnessProps} ui={wrappedUi} />
  )
  const view = render(wrap(ui))
  const current = (): EditLite => latest.current as EditLite

  return {
    ...view,
    source,
    outline,
    getState: (): EditLiteState => current().state,
    getContext: (): EditLiteContextValue => current().context,
    rerender: (nextUi: EditLiteUi): void => view.rerender(wrap(nextUi)),
  }
}
