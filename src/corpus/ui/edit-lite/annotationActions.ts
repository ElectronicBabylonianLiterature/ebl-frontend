import { ChapterEditSource } from 'corpus/application/edit-lite/ChapterEditSource'
import { ChapterOutline } from 'corpus/application/edit-lite/chapterOutline'
import { Line } from 'corpus/domain/line'
import {
  AnnotationDraft,
  AnnotationView,
  LineState,
  Loadable,
} from 'corpus/ui/edit-lite/editLiteState'
import { EditLiteStore, errorMessage } from 'corpus/ui/edit-lite/editLiteStore'
import {
  createInitialDraft,
  failedResource,
  findLemmasTarget,
  findLineIndex,
  findTokensTarget,
  isLoadingTokensOf,
  readyResource,
} from 'corpus/ui/edit-lite/lineAnnotations'
import { saveStoredLine } from 'corpus/ui/edit-lite/lineSaving'
import {
  findLineActivity,
  hasTextChanged,
  isLayoutChanging,
} from 'corpus/ui/edit-lite/lineStates'

async function settle<Value>(load: Promise<Value>): Promise<Loadable<Value>> {
  try {
    return readyResource(await load)
  } catch (error) {
    return failedResource(errorMessage(error))
  }
}

async function loadLemmas(
  store: EditLiteStore,
  index: number,
  line: Line,
): Promise<void> {
  store.dispatch({ type: 'lemmasRequested', index })
  const lemmas = await settle(store.getSource().loadLemmatization(line))
  store.dispatch({ type: 'lemmasSettled', line, lemmas })
}

async function fetchTokens(
  store: EditLiteStore,
  index: number,
  original: Line,
  view: AnnotationView,
): Promise<void> {
  const layoutVersion = store.getState().layoutVersion
  const tokens = await settle(store.getSource().loadAnnotatedLine(index))
  const state = store.getState()
  const currentIndex = findLineIndex(state, isLoadingTokensOf(original))
  if (currentIndex === null) {
    return
  }
  if (state.layoutVersion !== layoutVersion) {
    await fetchTokens(store, currentIndex, original, view)
    return
  }
  store.dispatch({ type: 'annotationSettled', original, tokens })
  if (tokens.status === 'ready') {
    openAnnotation(store, currentIndex, view)
  }
}

export function openAnnotation(
  store: EditLiteStore,
  index: number,
  view: AnnotationView,
): void {
  const lineState = store.getState().lines[index]
  const original = findTokensTarget(lineState)
  const line = view === 'lemmatization' ? findLemmasTarget(lineState) : null
  if (original !== null) {
    store.dispatch({ type: 'annotationRequested', index })
    void fetchTokens(store, index, original, view)
  } else if (line !== null) {
    void loadLemmas(store, index, line)
  }
}

function findAnnotationValue(
  lineState: LineState | undefined,
  view: AnnotationView,
): AnnotationDraft | null {
  const annotation = lineState?.annotation
  if (annotation === undefined) {
    return null
  }
  const value = annotation.draft ?? createInitialDraft(annotation, view)
  return value?.view === view ? value : null
}

function findSavableValue(
  lineState: LineState | undefined,
  view: AnnotationView,
): AnnotationDraft | null {
  const isRefused =
    lineState?.status === 'saving' ||
    lineState?.annotation?.isStale === true ||
    hasTextChanged(lineState)
  return isRefused ? null : findAnnotationValue(lineState, view)
}

function saveValue(
  source: ChapterEditSource,
  index: number,
  value: AnnotationDraft,
): Promise<ChapterOutline> {
  return value.view === 'alignment'
    ? source.saveAlignment(index, value.alignment)
    : source.saveLemmatization(index, value.lemmatization)
}

export function saveAnnotation(
  store: EditLiteStore,
  index: number,
  view: AnnotationView,
): void {
  const state = store.getState()
  const value = findSavableValue(state.lines[index], view)
  if (value !== null && !isLayoutChanging(findLineActivity(state))) {
    void saveStoredLine(store, index, (source) =>
      saveValue(source, index, value),
    )
  }
}
