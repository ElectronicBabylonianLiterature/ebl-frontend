export interface ImageExportAssessment {
  readonly isAllowed: boolean
  readonly explanation: string
}

const BASEMAP_LICENCE_EXPLANATION =
  'Saving a rendered map image needs basemap and overlay licensing to be ' +
  'confirmed first. Use GeoJSON or CSV export, or the shareable map link.'

export function assessImageExport(): ImageExportAssessment {
  return {
    isAllowed: false,
    explanation: BASEMAP_LICENCE_EXPLANATION,
  }
}
