import React from 'react'
import { render, RenderResult, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import SessionContext from 'auth/SessionContext'
import MemorySession, { Session } from 'auth/Session'
import MarkupService from 'markup/application/MarkupService'
import SumerianDictionaryService from 'sumerian-dictionary/application/SumerianDictionaryService'
import { SumerianWord } from 'sumerian-dictionary/domain/SumerianWord'
import SumerianWordDisplay from 'sumerian-dictionary/ui/SumerianWordDisplay'
import LocationDisplay from 'test-support/LocationDisplay'
import { waitForSpinnerToBeRemoved } from 'test-support/waitForSpinnerToBeRemoved'

export const sumerianDictionaryService =
  new (SumerianDictionaryService as jest.Mock<
    jest.Mocked<SumerianDictionaryService>
  >)()

export const markupService = new (MarkupService as jest.Mock<
  jest.Mocked<MarkupService>
>)()

export const readerSession = new MemorySession(['read:sumerian-words'])

export function renderWord(
  word: SumerianWord,
  {
    session = readerSession,
    initialEntry = '/',
  }: { session?: Session; initialEntry?: string } = {},
): RenderResult {
  sumerianDictionaryService.find.mockResolvedValue(word)
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[initialEntry]}>
        <SessionContext.Provider value={session}>
          <SumerianWordDisplay
            id={word.id}
            sumerianDictionaryService={sumerianDictionaryService}
            markupService={markupService}
          />
          <LocationDisplay />
        </SessionContext.Provider>
      </MemoryRouter>
    </HelmetProvider>,
  )
}

export async function renderWordAndWait(
  word: SumerianWord,
  options?: { session?: Session; initialEntry?: string },
): Promise<RenderResult> {
  const view = renderWord(word, options)
  await waitForSpinnerToBeRemoved(screen)
  return view
}

export function region(name: string | RegExp): HTMLElement {
  return screen.getByRole('region', { name })
}

export function sectionHeadings(): readonly string[] {
  return screen
    .getAllByRole('heading', { level: 2 })
    .map((heading) => String(heading.textContent))
}
