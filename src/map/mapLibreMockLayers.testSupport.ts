const addedLayerIds = new Set<string>()

export function rememberAddedLayer(layer: { id: string }): void {
  addedLayerIds.add(layer.id)
}

export function findAddedLayer(layerId: string): { id: string } | undefined {
  return addedLayerIds.has(layerId) ? { id: layerId } : undefined
}

export function forgetAddedLayer(layerId: string): void {
  addedLayerIds.delete(layerId)
}

export function isLayerAdded(layerId: string): boolean {
  return addedLayerIds.has(layerId)
}

export function markLayersAdded(...layerIds: readonly string[]): void {
  layerIds.forEach((layerId) => addedLayerIds.add(layerId))
}

export function clearAddedLayers(): void {
  addedLayerIds.clear()
}
