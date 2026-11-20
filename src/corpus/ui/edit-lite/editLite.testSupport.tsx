import React from 'react'
import { render, RenderResult } from '@testing-library/react'
import { ChapterOutline } from 'corpus/application/edit-lite/chapterOutline'
import EditLiteContext, {
  EditLiteContextValue,
} from 'corpus/ui/edit-lite/EditLiteContext'
import {
  buildEditLiteLines,
  buildEditLiteOutline,
} from 'corpus/ui/edit-lite/editLiteFixtures.testSupport'
import { EditLiteState } from 'corpus/ui/edit-lite/editLiteState'
import {
  createFakeChapterEditSource,
  FakeChapterEditSource,
  FakeChapterEditSourceOptions,
} from 'corpus/ui/edit-lite/fakeChapterEditSource.testSupport'
import useEditLite, { EditLite } from 'corpus/ui/edit-lite/useEditLite'

export {
  buildEditLiteLines,
  buildEditLiteOutline,
  editLiteManuscripts,
  editLiteRevision,
} from 'corpus/ui/edit-lite/editLiteFixtures.testSupport'
export { createFakeChapterEditSource } from 'corpus/ui/edit-lite/fakeChapterEditSource.testSupport'
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

interface HarnessProps {
  readonly source: FakeChapterEditSource
  readonly outline: ChapterOutline
  readonly canWrite: boolean
  readonly ui: EditLiteUi
  readonly latest: { current?: EditLite }
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
