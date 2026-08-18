import fs from 'fs'
import path from 'path'
import { historicalMapOverlays } from './historicalOverlays'

const root = path.resolve(__dirname, '../..')
const catalog = JSON.parse(
  fs.readFileSync(
    path.join(root, 'public', 'map-data', 'catalog.json'),
    'utf8',
  ),
)

describe('historical map static assets', () => {
  it('has one catalog entry for every overlay manifest entry', () => {
    const catalogIds = catalog.rasterOverlays.map((overlay) => overlay.id)
    expect(catalogIds).toEqual(
      historicalMapOverlays.map((overlay) => overlay.id),
    )
  })

  it('uses safe relative tile URLs and no absolute local paths', () => {
    const serializedCatalog = JSON.stringify(catalog)
    expect(serializedCatalog).not.toContain('/workspaces/')
    expect(serializedCatalog).not.toContain('.map-processing')

    for (const overlay of historicalMapOverlays) {
      expect(overlay.tiles).toHaveLength(1)
      expect(overlay.tiles[0]).toBe(
        `/historical-maps/${overlay.siteId}/${overlay.id}/tiles/{z}/{x}/{y}.png`,
      )
      expect(overlay.tiles[0]).not.toMatch(/^https?:/)
    }
  })

  it('has tile roots and bounded z/x/y.png pyramids for every overlay', () => {
    for (const overlay of historicalMapOverlays) {
      const tileRoot = path.join(
        root,
        'public',
        'historical-maps',
        overlay.siteId,
        overlay.id,
        'tiles',
      )
      expect(fs.existsSync(tileRoot)).toBe(true)
      const zoomFolders = fs
        .readdirSync(tileRoot, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => Number(entry.name))
        .sort((a, b) => a - b)
      expect(zoomFolders[0]).toBe(overlay.minZoom)
      expect(zoomFolders[zoomFolders.length - 1]).toBe(overlay.maxZoom)

      const firstZoom = path.join(tileRoot, String(zoomFolders[0]))
      const firstX = fs
        .readdirSync(firstZoom, { withFileTypes: true })
        .find((entry) => entry.isDirectory())
      expect(firstX).toBeDefined()
      const firstY = fs
        .readdirSync(path.join(firstZoom, firstX?.name ?? ''))
        .find((name) => name.endsWith('.png'))
      expect(firstY).toMatch(/^[0-9]+\.png$/)
    }
  })

  it('does not generate HTML, KML, JPEG, raw TIFF, or COG files in public assets', () => {
    const publicHistoricalRoot = path.join(root, 'public', 'historical-maps')
    const forbidden: string[] = []
    const visit = (dir: string): void => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name)
        if (entry.isDirectory()) visit(fullPath)
        if (/\.(html|kml|jpe?g|tiff?|cog\.tif)$/i.test(entry.name)) {
          forbidden.push(fullPath)
        }
      }
    }
    visit(publicHistoricalRoot)
    expect(forbidden).toEqual([])
  })
})
