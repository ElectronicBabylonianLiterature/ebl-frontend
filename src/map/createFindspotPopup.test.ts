import { within } from '@testing-library/react'
import {
  createFindspotPopup,
  type FindspotPopupProperties,
} from './createFindspotPopup'
import { buildFragmentSearchLink } from './mapLinks'

function makePopupProperties(
  overrides: Partial<FindspotPopupProperties> = {},
): FindspotPopupProperties {
  return {
    name: 'Babylon',
    abbreviation: 'BAB',
    parent: 'Babylonia',
    geometryType: 'point',
    coordinates: { latitude: 32.542, longitude: 44.42 },
    ...overrides,
  }
}

describe('createFindspotPopup', () => {
  it('renders point popup details and fragment link', () => {
    const content = createFindspotPopup(makePopupProperties())
    const popup = within(content)

    expect(
      popup.getByText('Babylon', { selector: 'strong' }),
    ).toBeInTheDocument()
    expect(popup.getByText('Babylonia · BAB')).toBeInTheDocument()
    expect(popup.getByText('32.54°N, 44.42°E')).toBeInTheDocument()
    expect(popup.getByText('Single point')).toBeInTheDocument()

    const link = popup.getByRole('link', { name: 'View fragments' })
    expect(link).toHaveAttribute('href', buildFragmentSearchLink('Babylon'))
  })

  it('renders abbreviation only and polygon details when parent is missing', () => {
    const content = createFindspotPopup(
      makePopupProperties({
        abbreviation: 'URU',
        parent: undefined,
        geometryType: 'polygon',
        coordinates: { latitude: -12.34, longitude: -45.67 },
      }),
    )
    const popup = within(content)

    expect(popup.getByText('URU')).toBeInTheDocument()
    expect(popup.queryByText(/ · /)).not.toBeInTheDocument()
    expect(popup.getByText('12.34°S, 45.67°W')).toBeInTheDocument()
    expect(popup.getByText('Area boundary available')).toBeInTheDocument()
  })

  it('renders malicious-looking values as text instead of markup', () => {
    const name = '<img src=x onerror=alert(1)>'
    const abbreviation = '<script>alert(1)</script>'
    const parent = 'Babylonia<script>xss</script>'

    const content = createFindspotPopup(
      makePopupProperties({
        name,
        abbreviation,
        parent,
      }),
    )
    const popup = within(content)

    expect(content.innerHTML).not.toContain('<img')
    expect(content.innerHTML).not.toContain('<script')
    expect(popup.getByText(name, { selector: 'strong' })).toHaveTextContent(
      name,
    )
    expect(popup.getByText(`${parent} · ${abbreviation}`)).toBeInTheDocument()
  })
})
