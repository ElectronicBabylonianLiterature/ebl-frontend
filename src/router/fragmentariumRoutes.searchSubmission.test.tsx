import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useNavigate } from 'react-router-dom'
import { Switch } from 'router/compat'
import SessionContext from 'auth/SessionContext'
import MemorySession from 'auth/Session'
import FragmentariumRoutes from 'router/fragmentariumRoutes'
import { getServices } from 'test-support/AppDriver'
import LocationDisplay from 'test-support/LocationDisplay'

jest.mock('router/head', () => ({
  __esModule: true,
  HeadTagsService: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}))

function HistoryControls(): JSX.Element {
  const navigate = useNavigate()
  return (
    <>
      <button type="button" onClick={() => navigate(-1)}>
        Back
      </button>
      <button type="button" onClick={() => navigate(1)}>
        Forward
      </button>
    </>
  )
}

function renderSearch(hash: string): ReturnType<typeof getServices> {
  const services = getServices()
  jest.spyOn(services.textService, 'findChapterDisplay')
  jest.spyOn(services.fragmentService, 'query').mockResolvedValue({
    items: [],
    matchCountTotal: 0,
    hasNextPage: false,
  })
  jest.spyOn(services.fragmentService, 'fetchPeriods').mockResolvedValue([])
  jest.spyOn(services.fragmentService, 'fetchGenres').mockResolvedValue([])
  jest.spyOn(services.fragmentService, 'fetchProvenances').mockResolvedValue([])
  jest
    .spyOn(services.dossiersService, 'fetchFilteredDossiers')
    .mockResolvedValue([])
  jest.spyOn(services.wordService, 'findAll').mockResolvedValue([])
  jest.spyOn(services.textService, 'query').mockResolvedValue({
    items: [],
    totalChapters: 0,
    matchCountTotal: 0,
    hasNextPage: false,
  })
  render(
    <MemoryRouter
      initialEntries={[`/library/search/?transliteration=kur${hash}`]}
    >
      <SessionContext.Provider value={new MemorySession(['read:fragments'])}>
        <LocationDisplay />
        <HistoryControls />
        <Switch>{FragmentariumRoutes({ ...services, sitemap: false })}</Switch>
      </SessionContext.Provider>
    </MemoryRouter>,
  )
  return services
}

it.each([
  { tab: 'Corpus', hash: '#corpus', keyboard: false },
  { tab: 'Corpus', hash: '#corpus', keyboard: true },
  { tab: 'Library', hash: '#library', keyboard: false },
  { tab: 'Library', hash: '#library', keyboard: true },
  { tab: 'Library', hash: '', keyboard: false },
])(
  'preserves $tab on actual search submission and history (keyboard=$keyboard, hash=$hash)',
  async ({ tab, hash, keyboard }) => {
    const { textService } = renderSearch(hash)
    await screen.findByText('Found 0 matching line variants in 0 chapters')
    expect(screen.getByRole('tab', { name: tab, selected: true })).toBeVisible()
    const input = screen.getByLabelText('Transliteration')
    await userEvent.clear(input)
    await userEvent.type(input, 'a+b &é')
    if (keyboard) {
      await userEvent.keyboard('{Control>}{Enter}{/Control}')
    } else {
      await userEvent.click(screen.getByRole('button', { name: 'Search' }))
    }
    await waitFor(() =>
      expect(textService.query).toHaveBeenLastCalledWith(
        { transliteration: 'a+b &e₂', limit: 51, offset: 0 },
        expect.any(AbortSignal),
      ),
    )
    const submittedLocation = screen.getByTestId('location').textContent ?? ''
    expect(submittedLocation).toContain('transliteration=a%2Bb%20%26e%E2%82%82')
    expect(submittedLocation?.endsWith(hash)).toBe(true)
    expect(screen.getByRole('tab', { name: tab, selected: true })).toBeVisible()

    await userEvent.click(screen.getByRole('button', { name: 'Back' }))
    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent(
        `transliteration=kur${hash}`,
      ),
    )
    expect(screen.getByRole('tab', { name: tab, selected: true })).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Forward' }))
    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent(
        submittedLocation,
      ),
    )
    expect(screen.getByRole('tab', { name: tab, selected: true })).toBeVisible()
    expect(textService.findChapterDisplay).not.toHaveBeenCalled()
  },
)
