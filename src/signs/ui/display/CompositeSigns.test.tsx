import React from 'react'
import { render, renderHook, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SignService from 'signs/application/SignService'
import { signFactory } from 'test-support/sign-fixtures'
import CompositeSigns from 'signs/ui/display/CompositeSigns'
import useCompositeSigns from 'signs/ui/display/useCompositeSigns'

jest.mock('signs/application/SignService')
const signService = new (SignService as jest.Mock<jest.Mocked<SignService>>)()

const mainSign = signFactory.build({ name: '|BAR.PI|' })
const bar = signFactory.build({ name: 'BAR' })
const pi = signFactory.build({ name: 'PI' })

function renderComposites(
  state: Parameters<typeof CompositeSigns>[0]['state'],
): void {
  render(
    <MemoryRouter>
      <CompositeSigns state={state} />
    </MemoryRouter>,
  )
}

it('links every composite sign', () => {
  renderComposites({ status: 'loaded', data: [bar, pi] })
  expect(screen.getByRole('link', { name: 'BAR' })).toHaveAttribute(
    'href',
    '/signs/BAR',
  )
  expect(screen.getByRole('link', { name: 'PI' })).toBeInTheDocument()
})

it('shows a spinner while loading', () => {
  renderComposites({ status: 'loading' })
  expect(screen.getByText('Loading composite signs…')).toBeInTheDocument()
})

it('reports an error', () => {
  renderComposites({ status: 'error' })
  expect(screen.getByRole('alert')).toHaveTextContent(
    'Composite signs could not be loaded.',
  )
})

it('renders nothing when unavailable', () => {
  const { container } = render(
    <CompositeSigns state={{ status: 'unavailable' }} />,
  )
  expect(container).toBeEmptyDOMElement()
})

it('searches the composites and leaves out the sign itself', async () => {
  signService.search.mockResolvedValue([mainSign, bar, pi])
  const { result } = renderHook(() => useCompositeSigns(mainSign, signService))
  await waitFor(() =>
    expect(result.current).toEqual({ status: 'loaded', data: [bar, pi] }),
  )
  expect(signService.search).toHaveBeenCalledWith(
    { isComposite: true, value: '|bar.pi|', subIndex: 1 },
    expect.any(AbortSignal),
  )
})
