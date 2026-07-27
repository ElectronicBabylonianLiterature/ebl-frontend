import type { MapGeoJSONFeature } from 'maplibre-gl'
import type {
  FindspotMapDataStatus,
  PolygonFindspotSummary,
} from './findspotMapData'
import { buildFindspotFragmentSearchLink } from './mapLinks'

function appendRow(container: HTMLElement, text: string): void {
  const row = document.createElement('span')
  row.textContent = text
  container.append(row)
}

function fragmentCountLabel(count: number): string {
  return count === 1 ? '1 accessible fragment' : `${count} accessible fragments`
}

function appendFindspotRows(
  container: HTMLElement,
  summary: PolygonFindspotSummary,
): void {
  const list = document.createElement('ul')
  list.className = 'findspot-popup__findspots'

  for (const findspot of summary.findspots) {
    const item = document.createElement('li')
    const link = document.createElement('a')
    link.textContent = `Findspot ${findspot.findspotId}`
    link.setAttribute(
      'href',
      buildFindspotFragmentSearchLink(findspot.findspotId),
    )
    item.append(link)
    item.append(`: ${fragmentCountLabel(findspot.accessibleFragmentCount)}`)
    list.append(item)
  }

  container.append(list)
}

function appendMapDataBlock(
  container: HTMLElement,
  summary: PolygonFindspotSummary | undefined,
  mapDataStatus: FindspotMapDataStatus,
): void {
  if (mapDataStatus === 'loading' || mapDataStatus === 'idle') {
    appendRow(container, 'Fragment counts loading')
    return
  }

  if (mapDataStatus === 'error') {
    appendRow(container, 'Fragment counts unavailable')
    return
  }

  if (!summary) {
    appendRow(container, 'No mapped findspots')
    return
  }

  appendRow(
    container,
    `${fragmentCountLabel(summary.accessibleFragmentCount)} from ${
      summary.findspotCount
    } mapped ${summary.findspotCount === 1 ? 'findspot' : 'findspots'}`,
  )
  appendFindspotRows(container, summary)
}

export function createExcavationAreaPopup(
  feature: MapGeoJSONFeature,
  findspotSummary: PolygonFindspotSummary | undefined,
  mapDataStatus: FindspotMapDataStatus,
  browseHistoricalMapsForSite?: (siteName: string) => void,
): HTMLElement | null {
  const properties = feature.properties
  const siteName = properties?.siteName
  const name = properties?.name

  if (typeof siteName !== 'string' || typeof name !== 'string') {
    return null
  }

  const container = document.createElement('div')
  container.className = 'findspot-popup'

  const title = document.createElement('strong')
  title.textContent = name
  container.append(title)

  const site = document.createElement('span')
  site.textContent = siteName
  container.append(site)

  const type = document.createElement('span')
  type.textContent = 'Excavation area'
  container.append(type)

  appendMapDataBlock(container, findspotSummary, mapDataStatus)

  if (browseHistoricalMapsForSite) {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'btn btn-outline-secondary btn-sm'
    button.textContent = `Browse historical maps for ${siteName}`
    button.addEventListener('click', () =>
      browseHistoricalMapsForSite(siteName),
    )
    container.append(button)
  }

  return container
}
