export const sitemapDefaults = {
  sitemapIndex: true,
  priority: 0,
  changefreq: 'weekly',
}

type SlugsArray = readonly { [key: string]: string }[]
export type SignSlugs = SlugsArray
export type DictionarySlugs = SlugsArray
export type BibliographySlugs = SlugsArray
export type FragmentSlugs = SlugsArray
export type TextSlugs = {
  index: number
  category: number
  genre: string
}[]
export type ChapterSlugs = {
  chapter: string
  stage: string
  index: number
  category: number
  genre: string
}[]

export interface Slugs {
  readonly signSlugs?: SignSlugs
  readonly dictionarySlugs?: DictionarySlugs
  readonly bibliographySlugs?: BibliographySlugs
  readonly fragmentSlugs?: FragmentSlugs
  readonly textSlugs?: TextSlugs
  readonly chapterSlugs?: ChapterSlugs
}
