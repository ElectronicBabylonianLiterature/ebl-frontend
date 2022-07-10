import TransliterationSearchResult from 'corpus/domain/TransliterationSearchResult'

export default interface ChapterInfosPagination {
  chapterInfos: readonly TransliterationSearchResult[]
  totalCount: number
}
