import { sanitizeFindspotMapDataResponseWithDiagnostics } from 'fragmentarium/domain/findspotMapDataSanitizer'
import type { FindspotMapData } from 'fragmentarium/domain/findspotMapData'

export function sanitizeFindspotMapDataResponse(
  ...arguments_: Parameters<
    typeof sanitizeFindspotMapDataResponseWithDiagnostics
  >
): readonly FindspotMapData[] {
  return sanitizeFindspotMapDataResponseWithDiagnostics(...arguments_).findspots
}
