export interface IiifResourceDto {
  readonly id?: unknown
  readonly type?: unknown
  readonly '@id'?: unknown
  readonly '@type'?: unknown
}

export interface IiifLabelledDto extends IiifResourceDto {
  readonly label?: unknown
  readonly format?: unknown
}

export interface IiifServiceDto extends IiifResourceDto {
  readonly profile?: unknown
  readonly width?: unknown
  readonly height?: unknown
  readonly maxWidth?: unknown
  readonly maxHeight?: unknown
  readonly maxArea?: unknown
  readonly tiles?: unknown
  readonly sizes?: unknown
}

export interface IiifContentResourceDto extends IiifLabelledDto {
  readonly width?: unknown
  readonly height?: unknown
  readonly service?: unknown
}

export interface IiifAnnotationDto extends IiifResourceDto {
  readonly motivation?: unknown
  readonly body?: unknown
  readonly target?: unknown
}

export interface IiifAnnotationPageDto extends IiifResourceDto {
  readonly items?: unknown
}

export interface IiifCanvasDto extends IiifResourceDto {
  readonly label?: unknown
  readonly width?: unknown
  readonly height?: unknown
  readonly items?: unknown
  readonly thumbnail?: unknown
  readonly rendering?: unknown
  readonly metadata?: unknown
}

export interface IiifMetadataEntryDto {
  readonly label?: unknown
  readonly value?: unknown
}

export interface IiifProviderDto extends IiifResourceDto {
  readonly label?: unknown
  readonly homepage?: unknown
}

export interface IiifManifestDto extends IiifResourceDto {
  readonly '@context'?: unknown
  readonly label?: unknown
  readonly summary?: unknown
  readonly metadata?: unknown
  readonly requiredStatement?: unknown
  readonly rights?: unknown
  readonly provider?: unknown
  readonly homepage?: unknown
  readonly thumbnail?: unknown
  readonly items?: unknown
}

export interface IiifReferenceDto {
  readonly manifest?: unknown
  readonly version?: unknown
}

export interface FragmentIiifDiscoveryDto {
  readonly iiif?: unknown
}
