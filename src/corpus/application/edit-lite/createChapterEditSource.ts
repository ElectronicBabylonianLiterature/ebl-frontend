import ApiChapterEditSource, {
  ApiChapterEditTextService,
} from 'corpus/application/edit-lite/ApiChapterEditSource'
import { ChapterEditSource } from 'corpus/application/edit-lite/ChapterEditSource'
import { ChapterOutline } from 'corpus/application/edit-lite/chapterOutline'
import { ChapterId } from 'transliteration/domain/chapter-id'

export type ChapterEditTextService = ApiChapterEditTextService

export interface ChapterEditSourceParameters {
  readonly textService: ChapterEditTextService
  readonly id: ChapterId
  readonly canWrite: boolean
  readonly signal?: AbortSignal
}

export interface LoadedChapterEditSource {
  readonly source: ChapterEditSource
  readonly outline: ChapterOutline
}

export async function createChapterEditSource({
  textService,
  id,
  canWrite,
  signal,
}: ChapterEditSourceParameters): Promise<LoadedChapterEditSource> {
  const source = new ApiChapterEditSource(textService, id, canWrite)
  return { source, outline: await source.loadOutline(signal) }
}

export default createChapterEditSource
