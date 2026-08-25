import type {
  MediaRepresentations,
  MediaResource,
  MediaType,
  RasterMediaRepresentation,
} from 'fragmentarium/domain/media'
import { ImageServiceDescriptor } from 'fragmentarium/domain/mediaImageService'

export interface MediaRendering {
  readonly id: string
  readonly label: string
  readonly format?: string
}

export interface IiifMediaRepresentations extends MediaRepresentations {
  readonly imageService?: ImageServiceDescriptor
  readonly thumbnail?: RasterMediaRepresentation
}

export interface IiifMediaResource extends Omit<
  MediaResource,
  'type' | 'representations'
> {
  readonly type?: MediaType
  readonly label?: string
  readonly canvasWidth?: number
  readonly canvasHeight?: number
  readonly renderings?: readonly MediaRendering[]
  readonly representations: IiifMediaRepresentations
}

export function hasImageService(media: IiifMediaResource): boolean {
  return media.representations.imageService !== undefined
}

export function selectImageService(
  media: IiifMediaResource,
): ImageServiceDescriptor | undefined {
  return media.representations.imageService
}
