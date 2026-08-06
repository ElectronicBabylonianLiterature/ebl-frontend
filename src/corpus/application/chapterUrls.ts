import { ChapterId } from 'transliteration/domain/chapter-id'

export function createTextUrl(
  genre: string,
  category: string | number,
  index: string | number,
): string {
  return `/texts/${encodeURIComponent(genre)}/${encodeURIComponent(
    category,
  )}/${encodeURIComponent(index)}`
}

export function createChapterUrl({
  textId: { genre, category, index },
  stage,
  name,
}: ChapterId): string {
  return `${createTextUrl(
    genre,
    category,
    index,
  )}/chapters/${encodeURIComponent(stage)}/${encodeURIComponent(name)}`
}
