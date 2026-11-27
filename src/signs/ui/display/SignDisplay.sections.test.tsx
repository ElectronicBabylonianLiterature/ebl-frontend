import { act, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SignService from 'signs/application/SignService'
import Sign from 'signs/domain/Sign'
import { installMockIntersectionObserver } from 'test-support/intersectionObserverMock'
import {
  fullEditor,
  renderSignPage,
  setUpSignService,
  sign,
  signPath,
} from 'signs/ui/display/signDisplay.testSupport'

jest.mock('signs/application/SignService')

const signService = new (SignService as jest.Mock<jest.Mocked<SignService>>)()

beforeEach(() => {
  installMockIntersectionObserver()
  setUpSignService(signService)
})

function navigationLinks(): (string | null)[] {
  return within(screen.getByRole('navigation', { name: 'On this page' }))
    .getAllByRole('link')
    .map((link) => link.textContent)
}

function deferredSearch(): (signs: Sign[]) => void {
  let resolve: (signs: Sign[]) => void = () => undefined
  signService.search.mockReturnValue(
    new Promise((resolvePromise) => {
      resolve = resolvePromise
    }),
  )
  return (signs) => resolve(signs)
}

function nextFrames(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 100))
}

it('keeps collapsed sections collapsed when the sections change', async () => {
  const resolveSearch = deferredSearch()
  await renderSignPage(signService, fullEditor)
  await userEvent.click(screen.getByRole('button', { name: 'Collapse Fossey' }))
  await act(async () => resolveSearch([]))
  await waitFor(() =>
    expect(navigationLinks()).not.toContain('Composite signs'),
  )
  expect(
    screen.getByRole('button', { name: 'Expand Fossey' }),
  ).toBeInTheDocument()
})

it('does not move the focus again when sections change', async () => {
  const resolveSearch = deferredSearch()
  await renderSignPage(signService, fullEditor, `${signPath}#sign-fossey`)
  await act(nextFrames)
  const toggle = screen.getByRole('button', { name: 'Collapse Logograms' })
  toggle.focus()
  await act(async () => resolveSearch([]))
  await act(nextFrames)
  expect(toggle).toHaveFocus()
})

it('hides the composite signs when there are none', async () => {
  signService.search.mockResolvedValue([])
  await renderSignPage(signService)
  await waitFor(() =>
    expect(navigationLinks()).not.toContain('Composite signs'),
  )
  expect(navigationLinks()).toContain('Palaeography')
})

it('does not request Kapitel II for a sign without MesZL number', async () => {
  setUpSignService(
    signService,
    new Sign({ ...sign, lists: [{ name: 'ABZ', number: '367' }] }),
  )
  await renderSignPage(signService, fullEditor)
  expect(signService.findMesZlKap2).not.toHaveBeenCalled()
})

it('keeps an unknown anchor in the address', async () => {
  await renderSignPage(signService, fullEditor, `${signPath}#unknown-anchor`)
  expect(screen.getByTestId('location')).toHaveTextContent('#unknown-anchor')
})
