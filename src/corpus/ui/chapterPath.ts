import { stageToAbbreviation } from 'common/utils/period'
import { ChapterListing, Text } from 'corpus/domain/text'

export function createChapterPath(
  text: Pick<Text, 'genre' | 'category' | 'index'>,
  chapter: Pick<ChapterListing, 'stage' | 'name'>,
): string {
  return `/corpus/${text.genre}/${text.category}/${
    text.index
  }/${stageToAbbreviation(chapter.stage)}/${chapter.name}`
}
