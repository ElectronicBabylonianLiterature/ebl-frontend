export interface NextAndPrevFragment {
  readonly previous: string
  readonly next: string
}
type FragmentAndFolio = {
  fragmentNumber: string
  folioNumber: string
}
export interface NextAndPrevFolio {
  readonly previous: FragmentAndFolio
  readonly next: FragmentAndFolio
}
