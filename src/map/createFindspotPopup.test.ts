import { within } from '@testing-library/react'
import {
  createFindspotPopup,
  type FindspotPopupProperties,
} from 'map/createFindspotPopup'
import { buildFragmentSearchLink } from 'map/mapLinks'

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
  const onNavigate = jest.fn()

  beforeEach(() => {
    onNavigate.mockClear()
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders point popup details and fragment link', () => {
    const content = createFindspotPopup(makePopupProperties(), onNavigate)
    document.body.append(content)
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
      onNavigate,
    )
    document.body.append(content)
    const popup = within(content)

    expect(popup.getByText('URU')).toBeInTheDocument()
    expect(popup.queryByText(/ · /)).not.toBeInTheDocument()
    expect(popup.getByText('12.34°S, 45.67°W')).toBeInTheDocument()
    expect(popup.getByText('Approximate area location')).toBeInTheDocument()
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
      onNavigate,
    )
    document.body.append(content)
    const popup = within(content)

    expect(content.innerHTML).not.toContain('<img')
    expect(content.innerHTML).not.toContain('<script')
    expect(popup.getByText(name, { selector: 'strong' })).toHaveTextContent(
      name,
    )
    expect(popup.getByText(`${parent} · ${abbreviation}`)).toBeInTheDocument()
  })

  it('renders popup content without coordinates', () => {
    const content = createFindspotPopup(
      makePopupProperties({ coordinates: undefined }),
      onNavigate,
    )
    document.body.append(content)
    const popup = within(content)

    expect(popup.queryByText(/°/)).not.toBeInTheDocument()
    expect(popup.getByText('Single point')).toBeInTheDocument()
    expect(popup.getByRole('link', { name: 'View fragments' })).toHaveAttribute(
      'href',
      buildFragmentSearchLink('Babylon'),
    )
  })

  function clickFragmentLink(init: MouseEventInit = {}): MouseEvent {
    const content = createFindspotPopup(makePopupProperties(), onNavigate)
    document.body.append(content)
    const link = within(content).getByRole('link', { name: 'View fragments' })
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      ...init,
    })
    link.dispatchEvent(clickEvent)
    return clickEvent
  }

  it('navigates in the app instead of reloading the document', () => {
    const clickEvent = clickFragmentLink()

    expect(clickEvent.defaultPrevented).toBe(true)
    expect(onNavigate).toHaveBeenCalledWith(buildFragmentSearchLink('Babylon'))
  })

  it.each([
    ['a modified click', { metaKey: true }],
    ['a middle click', { button: 1 }],
  ])('leaves %s to the browser', (_label, init) => {
    const clickEvent = clickFragmentLink(init)

    expect(clickEvent.defaultPrevented).toBe(false)
    expect(onNavigate).not.toHaveBeenCalled()
  })
})
