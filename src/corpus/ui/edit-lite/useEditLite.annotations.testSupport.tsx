import { act, waitFor } from '@testing-library/react'
import { ChapterEditSource } from 'corpus/application/edit-lite/ChapterEditSource'
import { Line } from 'corpus/domain/line'
import {
  buildAlignmentDraft,
  buildLemmatizationDraft,
} from 'corpus/ui/edit-lite/annotationState.testSupport'
import {
  AnnotationDraft,
  AnnotationView,
  LineAnnotation,
} from 'corpus/ui/edit-lite/editLiteState'
import { EditLiteHook } from 'corpus/ui/edit-lite/useEditLite.testSupport'

type Hook<Source extends ChapterEditSource> = EditLiteHook<Source>

export function findAnnotation<Source extends ChapterEditSource>(
  view: Hook<Source>,
  index: number,
): LineAnnotation | undefined {
  return view.state().lines[index]?.annotation
}

export async function openView<Source extends ChapterEditSource>(
  view: Hook<Source>,
  index: number,
  annotationView: AnnotationView,
): Promise<Line> {
  const isLoaded = (): boolean => {
    const annotation = findAnnotation(view, index)
    return annotationView === 'alignment'
      ? annotation?.tokens.status === 'ready'
      : annotation?.lemmas?.status === 'ready'
  }
  view.run((actions) => actions.openAnnotation(index, annotationView))
  await waitFor(() => expect(isLoaded()).toBe(true))
  return findAnnotation(view, index)?.tokens.value as Line
}

export async function openViewWithDraft<Source extends ChapterEditSource>(
  view: Hook<Source>,
  index: number,
  annotationView: AnnotationView,
): Promise<AnnotationDraft> {
  const line = await openView(view, index, annotationView)
  const draft =
    annotationView === 'alignment'
      ? buildAlignmentDraft(line)
      : buildLemmatizationDraft(line)
  view.run((actions) => actions.changeAnnotation(index, draft, line))
  return draft
}

export async function saveView<Source extends ChapterEditSource>(
  view: Hook<Source>,
  index: number,
  annotationView: AnnotationView,
): Promise<void> {
  const original = view.state().lines[index].original
  const isSaved = (): boolean => {
    const lineState = view.state().lines[index]
    return lineState?.status === 'ready' && lineState.original !== original
  }
  view.run((actions) => actions.saveAnnotation(index, annotationView))
  await waitFor(() => expect(isSaved()).toBe(true))
}

export async function settleLoads(): Promise<void> {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0))
  })
}
