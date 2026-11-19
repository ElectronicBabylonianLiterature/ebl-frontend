import ApiChapterEditSource, {
  ApiChapterEditTextService,
} from 'corpus/application/edit-lite/ApiChapterEditSource'
import {
  ChapterEditSource,
  ChapterEditSourceMode,
} from 'corpus/application/edit-lite/ChapterEditSource'
import { ChapterOutline } from 'corpus/application/edit-lite/chapterOutline'
import LegacyChapterEditSource, {
  LegacyChapterEditTextService,
} from 'corpus/application/edit-lite/LegacyChapterEditSource'
import { ChapterId } from 'transliteration/domain/chapter-id'

export type ChapterEditTextService = ApiChapterEditTextService &
  LegacyChapterEditTextService

export interface ChapterEditSourceParameters {
  readonly textService: ChapterEditTextService
  readonly id: ChapterId
  readonly mode: ChapterEditSourceMode
  readonly canWrite: boolean
  readonly signal?: AbortSignal
}

export interface LoadedChapterEditSource {
  readonly source: ChapterEditSource
  readonly outline: ChapterOutline
}

function createLinkedAbortController(signal?: AbortSignal): AbortController {
  const controller = new AbortController()
  if (signal?.aborted) {
    controller.abort()
  } else {
    signal?.addEventListener('abort', () => controller.abort(), { once: true })
  }
  return controller
}

async function loadSource(
  source: ChapterEditSource,
  signal?: AbortSignal,
): Promise<LoadedChapterEditSource> {
  return { source, outline: await source.loadOutline(signal) }
}

async function loadPreferredSource(
  apiSource: ChapterEditSource,
  legacySource: ChapterEditSource,
  signal?: AbortSignal,
): Promise<LoadedChapterEditSource> {
  const legacyController = createLinkedAbortController(signal)
  const legacy = loadSource(legacySource, legacyController.signal)
  legacy.catch(() => undefined)
  try {
    const api = await loadSource(apiSource, signal)
    legacyController.abort()
    return api
  } catch {
    return legacy
  }
}

export function createChapterEditSource({
  textService,
  id,
  mode,
  canWrite,
  signal,
}: ChapterEditSourceParameters): Promise<LoadedChapterEditSource> {
  const apiSource = new ApiChapterEditSource(textService, id, canWrite)
  const legacySource = new LegacyChapterEditSource(textService, id)
  switch (mode) {
    case 'api':
      return loadSource(apiSource, signal)
    case 'legacy':
      return loadSource(legacySource, signal)
    default:
      return loadPreferredSource(apiSource, legacySource, signal)
  }
}

export default createChapterEditSource
