export interface SearchGroupParams {
  number: string | null | undefined
  id: string | null | undefined
  title: string | null | undefined
  pages: string | null | undefined
  transliteration: string | null | undefined
}

export interface FragmentariumSearchParams extends SearchGroupParams {
  fragmentService
  fragmentSearchService
}
