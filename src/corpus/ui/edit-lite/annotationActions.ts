import _ from 'lodash'
import { Line } from 'corpus/domain/line'
import {
  AnnotationDraft,
  AnnotationView,
  EditLiteState,
  Loadable,
} from 'corpus/ui/edit-lite/editLiteState'
import { EditLiteStore, errorMessage } from 'corpus/ui/edit-lite/editLiteStore'
import {
  failedResource,
  findLemmasTarget,
  findLemmatizationDraftLine,
  findLineIndex,
  findTokensTarget,
  findViewDraft,
  hasAnnotationDraft,
  isLoadingTokensOf,
  readyResource,
} from 'corpus/ui/edit-lite/lineAnnotations'
import {
  applyOutline,
  OutlineWrite,
  saveStoredLine,
} from 'corpus/ui/edit-lite/lineSaving'
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

function isSaveRefused(state: EditLiteState, index: number): boolean {
  const lineState = state.lines[index]
  return (
    lineState?.status === 'saving' ||
    lineState?.annotation?.isStale === true ||
    hasTextChanged(lineState)
  )
}

function findSavableDraft(
  state: EditLiteState,
  index: number,
  view: AnnotationView,
): AnnotationDraft | null {
  return isSaveRefused(state, index) ||
    isLayoutChanging(findLineActivity(state))
    ? null
    : findViewDraft(state.lines[index], view)
}

function writeDraft(
  store: EditLiteStore,
  index: number,
  draft: AnnotationDraft,
): OutlineWrite {
  return (source) =>
    (draft.view === 'alignment'
      ? source.saveAlignment(index, draft.alignment)
      : source.saveLemmatization(index, draft.lemmatization)
    ).then(applyOutline(store))
}

export function saveAnnotation(
  store: EditLiteStore,
  index: number,
  view: AnnotationView,
  onSaved: () => void = _.noop,
): void {
  const draft = findSavableDraft(store.getState(), index, view)
  if (draft !== null) {
    void saveStoredLine(store, index, writeDraft(store, index, draft)).then(
      (isSaved) => isSaved && onSaved(),
    )
  }
}

export function leaveAnnotation(
  store: EditLiteStore,
  index: number,
  view: AnnotationView,
  onLeft: () => void,
): void {
  if (hasAnnotationDraft(store.getState().lines[index])) {
    saveAnnotation(store, index, view, onLeft)
  } else {
    onLeft()
  }
}

function canLemmatizeInstances(state: EditLiteState, index: number): boolean {
  return (
    !isSaveRefused(state, index) &&
    findLineActivity(state) === 'idle' &&
    findLemmatizationDraftLine(state, index) === null
  )
}

export function lemmatizeInstances(
  store: EditLiteStore,
  index: number,
  word: string,
  lemmaIds: readonly string[],
  onDone: () => void,
): boolean {
  const state = store.getState()
  const draft = findViewDraft(state.lines[index], 'lemmatization')
  if (!canLemmatizeInstances(state, index)) {
    return false
  }
  void saveStoredLine(store, index, async (source) => {
    if (draft !== null) {
      await writeDraft(store, index, draft)(source)
    }
    await source
      .lemmatizeWordInstances(word, lemmaIds)
      .then(applyOutline(store, 'instancesLemmatized'))
  }).then((isSaved) => isSaved && onDone())
  return true
}
