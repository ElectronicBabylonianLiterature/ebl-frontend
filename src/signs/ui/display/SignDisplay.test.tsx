import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MemorySession from 'auth/Session'
import SignService from 'signs/application/SignService'
import Sign from 'signs/domain/Sign'
import { installMockIntersectionObserver } from 'test-support/intersectionObserverMock'
import {
  installMockResizeObserver,
  resizeObservedElements,
  uninstallMockResizeObserver,
} from 'test-support/resizeObserverMock'
import {
  renderSignDisplay,
  renderSignPage,
  setUpSignService,
  sign,
  signPath,
} from 'signs/ui/display/signDisplay.testSupport'

jest.mock('signs/application/SignService')

const signService = new (SignService as jest.Mock<jest.Mocked<SignService>>)()

beforeEach(() => {
  jest.clearAllMocks()
  installMockIntersectionObserver()
  setUpSignService(signService)
})

it('shows the overview with sign lists, readings and LaBaSi', async () => {
  await renderSignPage(signService)
  expect(signService.find).toHaveBeenCalledWith('ŠE', expect.any(AbortSignal))
  expect(screen.getByText('MesZL 579 · U+122BA')).toBeInTheDocument()
  expect(screen.getAllByRole('term').map((term) => term.textContent)).toEqual([
    'Sign lists',
    'Readings',
    'LaBaSi',
  ])
  expect(
    screen
      .getAllByRole('definition')
      .slice(0, 2)
      .map((definition) => definition.textContent),
  ).toEqual(['ABZ 367MesZL 579', 'niga, še, u₂₀'])
  expect(
    screen.getByRole('link', { name: 'Open LaBaSi entry 95' }),
  ).toBeInTheDocument()
  expect(
    within(screen.getByRole('list', { name: 'Sign forms by period' }))
      .getAllByRole('listitem')
      .map((item) => item.textContent),
  ).toContain('𒊺Neo-Babylonian')
})

it('shows every MesZL number of a sign', async () => {
  setUpSignService(
    signService,
    new Sign({
      ...sign,
      lists: [
        { name: 'MZL', number: '264' },
        { name: 'MZL', number: '516' },
      ],
    }),
  )
  await renderSignPage(signService)
  expect(screen.getByText('MesZL 264, 516 · U+122BA')).toBeInTheDocument()
  expect(
    screen.getByText('Cuneiform sign · MesZL 264, 516'),
  ).toBeInTheDocument()
})

it('names a sign without MesZL number a cuneiform sign', async () => {
  setUpSignService(signService, new Sign({ ...sign, lists: [] }))
  await renderSignPage(signService, undefined, '/signs/%C5%A0E#sign-top')
  expect(screen.getByText('Cuneiform sign')).toBeInTheDocument()
  expect(screen.getByText('U+122BA')).toBeInTheDocument()
})

it('lists the sections in order in the navigation', async () => {
  await renderSignPage(signService)
  const navigation = screen.getByRole('navigation', { name: 'On this page' })
  expect(
    within(navigation)
      .getAllByRole('link')
      .map((link) => link.textContent),
  ).toEqual([
    'ŠE 𒊺Cuneiform sign · MesZL 579',
    'Mesopotamisches Zeichenlexikon',
    'Logograms',
    'Palaeography',
    'Composite signs',
    'Fossey',
  ])
  expect(
    within(navigation)
      .getAllByRole('button')
      .map((button) => button.getAttribute('aria-label')),
  ).toEqual([
    'Collapse Logograms',
    'Collapse Palaeography',
    'Collapse Composite signs',
    'Collapse Fossey',
  ])
})

it('collapses a section from the navigation and the heading', async () => {
  await renderSignPage(signService)
  const navigation = screen.getByRole('navigation', { name: 'On this page' })
  await userEvent.click(
    within(navigation).getByRole('button', { name: 'Collapse Logograms' }),
  )
  const heading = screen.getByRole('button', { name: 'Logograms' })
  expect(heading).toHaveAttribute('aria-expanded', 'false')
  expect(
    within(navigation).getByRole('button', { name: 'Expand Logograms' }),
  ).toHaveAttribute('aria-expanded', 'false')
  await userEvent.click(heading)
  expect(heading).toHaveAttribute('aria-expanded', 'true')
  expect(
    screen.queryByRole('button', { name: 'Mesopotamisches Zeichenlexikon' }),
  ).not.toBeInTheDocument()
})

it('goes to MesZL from the font credits', async () => {
  await renderSignPage(signService)
  await userEvent.click(
    screen.getByRole('link', { name: 'R. Borger (see below)' }),
  )
  expect(screen.getByTestId('location')).toHaveTextContent(
    '/signs/%C5%A0E#sign-meszl',
  )
})

it('has no MesZL link or section without MesZL', async () => {
  setUpSignService(signService, new Sign({ ...sign, mesZl: '' }))
  await renderSignPage(signService)
  expect(
    screen.queryByRole('link', { name: 'R. Borger (see below)' }),
  ).not.toBeInTheDocument()
  expect(
    screen.queryByRole('region', { name: 'Mesopotamisches Zeichenlexikon' }),
  ).not.toBeInTheDocument()
})

it('groups logograms by Akkadian word', async () => {
  await renderSignPage(signService)
  const section = screen.getByRole('region', { name: 'Logograms' })
  expect(within(section).getByRole('link', { name: "še'u I" })).toHaveAttribute(
    'href',
    `/dictionary/${encodeURIComponent("še'u I")}`,
  )
  expect(section).toHaveTextContent('„Gerste, Getreide“')
  expect(section).toHaveTextContent('Cross-references: U₂₀ → ŠE')
})

it('shows Fossey numbers without images as a range', async () => {
  await renderSignPage(signService)
  const section = screen.getByRole('region', { name: 'Fossey' })
  expect(section).toHaveTextContent('24351 – 24352')
})

it('shows the sign images by period', async () => {
  await renderSignPage(signService)
  expect(await screen.findByText(/Neo-Assyrian \(/)).toBeInTheDocument()
})

describe('when the page is opened at a section', () => {
  const originalScrollIntoView = window.HTMLElement.prototype.scrollIntoView

  afterEach(() => {
    uninstallMockResizeObserver()
    window.HTMLElement.prototype.scrollIntoView = originalScrollIntoView
  })

  it('keeps the section in view while the page grows, until the reader acts', async () => {
    installMockResizeObserver()
    const scrollIntoView = jest.fn()
    window.HTMLElement.prototype.scrollIntoView = scrollIntoView
    await renderSignPage(signService, undefined, '/signs/%C5%A0E#sign-fossey')
    scrollIntoView.mockClear()

    resizeObservedElements()
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto' })

    scrollIntoView.mockClear()
    act(() => {
      window.dispatchEvent(new Event('wheel'))
    })
    resizeObservedElements()
    expect(scrollIntoView).not.toHaveBeenCalled()
  })
})

it('asks guests to log in', async () => {
  renderSignDisplay(signService, new MemorySession([]), signPath)
  expect(
    await screen.findByText('Please log in to browse the Signs.'),
  ).toBeVisible()
})
