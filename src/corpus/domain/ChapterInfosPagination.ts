import ChapterInfo from 'corpus/domain/ChapterInfo'

export default interface ChapterInfosPagination {
  chapterInfos: readonly ChapterInfo[]
  totalCount: number
}
