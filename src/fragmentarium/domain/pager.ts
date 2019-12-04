export interface NextAndPrevFragment {
  readonly previous: string
  readonly next: string
}
interface FragmentAndFolio {
  readonly fragmentNumber: string
  readonly folioNumber: string
}
export interface NextAndPreviousFolio {
  readonly previous: FragmentAndFolio
  readonly next: FragmentAndFolio
}
