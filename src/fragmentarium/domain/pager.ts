export interface FragmentPagerData {
  readonly previous: string
  readonly next: string
}
export interface FragmentAndFolio {
  readonly fragmentNumber: string
  readonly folioNumber: string
}
export interface FolioPagerData {
  readonly previous: FragmentAndFolio
  readonly next: FragmentAndFolio
}
