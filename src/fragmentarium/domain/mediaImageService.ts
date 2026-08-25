export const ImageComplianceLevels = ['level0', 'level1', 'level2'] as const

export type ImageComplianceLevel = (typeof ImageComplianceLevels)[number]

export interface ImageServiceSize {
  readonly width: number
  readonly height: number
}

export interface ImageServiceTiles {
  readonly width: number
  readonly height?: number
  readonly scaleFactors: readonly number[]
}

export interface ImageServiceDescriptor {
  readonly id: string
  readonly serviceType: string
  readonly complianceLevel?: ImageComplianceLevel
  readonly width?: number
  readonly height?: number
  readonly maxWidth?: number
  readonly maxHeight?: number
  readonly maxArea?: number
  readonly tiles?: readonly ImageServiceTiles[]
  readonly sizes?: readonly ImageServiceSize[]
}

export function isImageComplianceLevel(
  value: unknown,
): value is ImageComplianceLevel {
  return (
    typeof value === 'string' &&
    (ImageComplianceLevels as readonly string[]).includes(value)
  )
}

export function supportsArbitraryRegions(
  service: ImageServiceDescriptor,
): boolean {
  return (
    service.complianceLevel === 'level1' || service.complianceLevel === 'level2'
  )
}

export function supportsArbitrarySizes(
  service: ImageServiceDescriptor,
): boolean {
  return service.complianceLevel === 'level2'
}
