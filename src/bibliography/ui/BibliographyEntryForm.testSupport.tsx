import { screen, fireEvent, act } from '@testing-library/react'
import Cite from 'citation-js'
import { CslData } from 'bibliography/domain/BibliographyEntry'

export const debounceDelayInMilliseconds = 500

export function citeAsyncMock(): jest.Mock {
  return Cite.async as jest.Mock
}

export function dataField(): HTMLElement {
  return screen.getByLabelText('Data')
}

export function typeIntoDataField(value: string): void {
  fireEvent.change(dataField(), { target: { value: value } })
}

export function submitForm(): void {
  fireEvent.submit(screen.getByTestId('bibliography-entry-form'))
}

export async function advancePastTheDebounce(): Promise<void> {
  await act(async () => {
    jest.advanceTimersByTime(debounceDelayInMilliseconds)
    await Promise.resolve()
  })
}

export function parsedCitation(
  id: string,
  citation: string,
  data: CslData = { id: id, type: 'book' },
): unknown {
  return {
    get: () => [data],
    format: () => citation,
  }
}

export function setUpFakeTimersAroundTests(): void {
  beforeEach(() => {
    jest.useFakeTimers()
    citeAsyncMock().mockReset()
  })

  afterEach(() => {
    jest.useRealTimers()
  })
}
