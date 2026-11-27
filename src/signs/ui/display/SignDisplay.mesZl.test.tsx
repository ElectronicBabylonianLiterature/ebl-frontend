import { fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SignService from 'signs/application/SignService'
import Sign from 'signs/domain/Sign'
import { installMockIntersectionObserver } from 'test-support/intersectionObserverMock'
import {
  fullEditor,
  kap2,
  renderSignPage,
  setUpSignService,
  sign,
} from 'signs/ui/display/signDisplay.testSupport'

jest.mock('signs/application/SignService')

const signService = new (SignService as jest.Mock<jest.Mocked<SignService>>)()
const kap2TabName = 'Kap. Ⅱ · Zeichenübersicht'
const kap3TabName = 'Kap. Ⅲ · Lautwerte'

beforeEach(() => {
  jest.clearAllMocks()
  installMockIntersectionObserver()
  setUpSignService(signService)
})

it('shows Kapitel III without tabs to readers and never asks for Kapitel II', async () => {
  await renderSignPage(signService)
  expect(await screen.findByText(/Lw\. še \(allg\.\)/)).toBeInTheDocument()
  expect(screen.queryByRole('tab')).not.toBeInTheDocument()
  expect(signService.findMesZlKap2).not.toHaveBeenCalled()
  expect(screen.getByText('Kapitel Ⅲ', { selector: 'strong' })).toBeVisible()
  expect(
    screen.getByRole('link', { name: /Download Borger fonts/ }),
  ).toHaveAttribute('href', '/fonts/BorgerAkkadian.ttc')
})

it('follows cross-references within the application', async () => {
  await renderSignPage(signService)
  await userEvent.click(await screen.findByRole('link', { name: 'n117' }))
  expect(screen.getByTestId('location')).toHaveTextContent(
    '/tools/signs?listsName=MZL&listsNumber=117',
  )
})

it('leaves modified clicks on cross-references to the browser', async () => {
  await renderSignPage(signService)
  const reference = await screen.findByRole('link', { name: 'n117' })
  const preventedByPage: boolean[] = []
  const recordAndStopNavigation = (event: MouseEvent): void => {
    preventedByPage.push(event.defaultPrevented)
    event.preventDefault()
  }
  document.addEventListener('click', recordAndStopNavigation)
  fireEvent.click(reference, { ctrlKey: true })
  document.removeEventListener('click', recordAndStopNavigation)
  expect(preventedByPage).toEqual([false])
  expect(screen.getByTestId('location')).toHaveTextContent('/signs/%C5%A0E')
})

it('lets Full Editors switch to Kapitel II', async () => {
  await renderSignPage(signService, fullEditor)
  const kap2Tab = await screen.findByRole('tab', { name: kap2TabName })
  expect(screen.getByRole('tab', { name: kap3TabName })).toHaveAttribute(
    'aria-selected',
    'true',
  )
  expect(signService.findMesZlKap2).toHaveBeenCalledWith(
    'ŠE',
    expect.any(AbortSignal),
  )

  await userEvent.click(kap2Tab)

  expect(await screen.findByText('Erfundene Zeile für den Test.')).toBeVisible()
  expect(kap2Tab).toHaveAttribute('aria-selected', 'true')
  expect(screen.getByText('Kapitel Ⅱ', { selector: 'strong' })).toBeVisible()
})

it('moves between the chapter tabs with the arrow keys', async () => {
  await renderSignPage(signService, fullEditor)
  const kap3Tab = await screen.findByRole('tab', { name: kap3TabName })
  const kap2Tab = screen.getByRole('tab', { name: kap2TabName })
  expect(kap2Tab).toHaveAttribute('tabindex', '-1')

  kap3Tab.focus()
  await userEvent.keyboard('{ArrowRight}')

  expect(kap2Tab).toHaveFocus()
  expect(kap2Tab).toHaveAttribute('aria-selected', 'true')
  expect(
    within(screen.getByRole('tabpanel', { name: kap2TabName })).getByText(
      'Kapitel Ⅱ',
    ),
  ).toBeVisible()
})

it('shows the Kapitel II entries of all MesZL numbers', async () => {
  signService.findMesZlKap2.mockResolvedValue([
    { number: '579', text: kap2 },
    { number: '580', text: '580\t𒊺\t**— Test**\nZweiter Eintrag.' },
  ])
  await renderSignPage(signService, fullEditor)
  await userEvent.click(await screen.findByRole('tab', { name: kap2TabName }))
  expect(await screen.findByText('Erfundene Zeile für den Test.')).toBeVisible()
  expect(await screen.findByText('Zweiter Eintrag.')).toBeVisible()
})

it('shows Kapitel II alone for a sign without Kapitel III', async () => {
  setUpSignService(signService, new Sign({ ...sign, mesZl: '' }))
  await renderSignPage(signService, fullEditor)
  expect(await screen.findByText('Erfundene Zeile für den Test.')).toBeVisible()
  expect(screen.queryByRole('tab')).not.toBeInTheDocument()
})

it('shows no tabs to Full Editors when there is no Kapitel II entry', async () => {
  signService.findMesZlKap2.mockResolvedValue([])
  await renderSignPage(signService, fullEditor)
  expect(await screen.findByText(/Lw\. še \(allg\.\)/)).toBeInTheDocument()
  expect(screen.queryByText(/Loading Kapitel/)).not.toBeInTheDocument()
  expect(screen.queryByRole('tab')).not.toBeInTheDocument()
})

it('drops the MesZL section when neither chapter has an entry', async () => {
  setUpSignService(signService, new Sign({ ...sign, mesZl: '' }))
  signService.findMesZlKap2.mockResolvedValue([])
  await renderSignPage(signService, fullEditor)
  expect(await screen.findByRole('region', { name: 'Logograms' })).toBeVisible()
  expect(
    screen.queryByRole('region', { name: 'Mesopotamisches Zeichenlexikon' }),
  ).not.toBeInTheDocument()
})

it('says that Kapitel II is loading', async () => {
  signService.findMesZlKap2.mockReturnValue(new Promise(() => undefined))
  await renderSignPage(signService, fullEditor)
  expect(screen.getByText('Loading Kapitel Ⅱ…')).toBeVisible()
})

it('says when Kapitel II could not be loaded', async () => {
  signService.findMesZlKap2.mockRejectedValue(new Error('Server error'))
  await renderSignPage(signService, fullEditor)
  expect(
    await screen.findByText('MesZL Kapitel Ⅱ could not be loaded.'),
  ).toBeVisible()
  expect(screen.getByText(/Lw\. še \(allg\.\)/)).toBeVisible()
  expect(screen.queryByRole('tab')).not.toBeInTheDocument()
})

it('stops loading Kapitel II when the page is left', async () => {
  let resolve: (entries: []) => void = () => undefined
  signService.findMesZlKap2.mockReturnValue(
    new Promise((resolvePromise) => {
      resolve = resolvePromise
    }),
  )
  const { unmount } = await renderSignPage(signService, fullEditor)
  const signal = signService.findMesZlKap2.mock.calls[0][1] as AbortSignal
  unmount()
  expect(signal.aborted).toBe(true)
  resolve([])
})

it('ignores a failure of Kapitel II after the page is left', async () => {
  let reject: (error: Error) => void = () => undefined
  signService.findMesZlKap2.mockReturnValue(
    new Promise((_resolve, rejectPromise) => {
      reject = rejectPromise
    }),
  )
  const { unmount } = await renderSignPage(signService, fullEditor)
  unmount()
  reject(new Error('aborted'))
  await expect(signService.findMesZlKap2.mock.results[0].value).rejects.toThrow(
    'aborted',
  )
})
