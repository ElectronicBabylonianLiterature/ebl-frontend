import type { HistoricalMapOverlay } from './historicalOverlays'

export const RIGHTS_PENDING_MARKER = 'rights pending'

export type ImageExportBlocker =
  | 'overlay-rights-pending'
  | 'drawing-buffer-not-preserved'

export interface ImageExportAssessment {
  readonly isAllowed: boolean
  readonly blockers: readonly ImageExportBlocker[]
  readonly blockedOverlayIds: readonly string[]
  readonly explanation: string
}

const EXPLANATIONS: Readonly<Record<ImageExportBlocker, string>> = {
  'overlay-rights-pending':
    'One or more active historical overlays record publication rights as pending confirmation, so their imagery cannot be redistributed as an exported image.',
  'drawing-buffer-not-preserved':
    'The map canvas is not created with preserveDrawingBuffer, so a canvas capture would produce an empty image.',
}

export function hasPendingPublicationRights(
  overlay: HistoricalMapOverlay,
): boolean {
  return overlay.attribution.toLowerCase().includes(RIGHTS_PENDING_MARKER)
}

export interface ImageExportInput {
  readonly activeOverlays: readonly HistoricalMapOverlay[]
  readonly preservesDrawingBuffer: boolean
}

export function assessImageExport({
  activeOverlays,
  preservesDrawingBuffer,
}: ImageExportInput): ImageExportAssessment {
  const blockedOverlayIds = activeOverlays
    .filter(hasPendingPublicationRights)
    .map((overlay) => overlay.id)

  const blockers: ImageExportBlocker[] = [
    ...(blockedOverlayIds.length > 0
      ? (['overlay-rights-pending'] as const)
      : []),
    ...(preservesDrawingBuffer
      ? []
      : (['drawing-buffer-not-preserved'] as const)),
  ]

  return {
    isAllowed: blockers.length === 0,
    blockers,
    blockedOverlayIds,
    explanation: blockers.map((blocker) => EXPLANATIONS[blocker]).join(' '),
  }
}
