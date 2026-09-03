import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { deriveMapSiteCapabilities } from './mapSiteCapabilities'
import { findMapSite } from './mapSites'
import { matchSiteCapabilities, normalizeSiteName } from './provenanceSiteMatch'
import {
  historicalMapOverlay,
  provenanceRecord,
} from 'test-support/map-fixtures'
import {
  assurCapabilities,
  assurProvenance,
  kalhuCapabilities,
  kalhuProvenance,
  renderInspector,
} from 'test-support/map-inspector-render'

const kalhuSite = findMapSite('kalhu')!

describe('provenanceSiteMatch', () => {
  it.each([
    ['Aššur', 'assur'],
    ['Kalḫu', 'kalhu'],
    ['  Uruk  ', 'uruk'],
  ])('normalizes %s', (input, expected) => {
    expect(normalizeSiteName(input)).toBe(expected)
  })

  it('matches a provenance to its mapped site', () => {
    expect(
      matchSiteCapabilities(assurProvenance, [
        assurCapabilities,
        kalhuCapabilities,
      ]),
    ).toBe(assurCapabilities)
  })

  it('returns undefined without a provenance', () => {
    expect(
      matchSiteCapabilities(undefined, [assurCapabilities]),
    ).toBeUndefined()
  })

  it('returns undefined for an unmapped site', () => {
    expect(
      matchSiteCapabilities(provenanceRecord({ longName: 'Nineveh' }), [
        assurCapabilities,
      ]),
    ).toBeUndefined()
  })
})

describe('explorer view', () => {
  it('lists the support state of every mapped site', () => {
    renderInspector()

    expect(
      screen.getByText(
        'Fragment-linked excavation data is available for Aššur.',
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Fragment-linked excavation data is not yet available for this site.',
      ),
    ).toBeInTheDocument()
  })

  it('labels sites by their strongest available data', () => {
    renderInspector()

    expect(screen.getByText('Fragment-linked areas')).toBeInTheDocument()
    expect(screen.getByText('Excavation areas')).toBeInTheDocument()
  })

  it('labels a site with only historical maps', () => {
    renderInspector({
      capabilities: [
        deriveMapSiteCapabilities(kalhuSite, {
          overlays: [historicalMapOverlay({ siteId: 'kalhu' })],
          excavationPolygons: [],
        }),
      ],
      filteredProvenances: [kalhuProvenance],
    })

    expect(screen.getByText('Historical maps')).toBeInTheDocument()
  })

  it('labels an unmapped provenance as a plain site', () => {
    renderInspector({
      filteredProvenances: [provenanceRecord({ longName: 'Nineveh' })],
    })

    expect(screen.getByText('Site')).toBeInTheDocument()
  })

  it('selects a site from the list', async () => {
    const { props } = renderInspector()

    await userEvent.click(screen.getByRole('button', { name: /Aššur/ }))

    expect(props.onSelectSite).toHaveBeenCalledWith('assur')
  })
})
