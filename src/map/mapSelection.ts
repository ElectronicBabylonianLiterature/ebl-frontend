export type MapSelection =
  | { readonly type: 'site'; readonly provenanceId: string }
  | { readonly type: 'excavation-area'; readonly polygonId: string }

export interface MapHoverPreview {
  readonly x: number
  readonly y: number
  readonly title: string
  readonly details: readonly string[]
}
