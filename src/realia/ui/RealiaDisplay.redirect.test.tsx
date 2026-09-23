import { screen } from '@testing-library/react'
import { RealiaEntry } from 'realia/domain/RealiaEntry'
import {
  expectLocation,
  realiaService,
  renderRealiaRoute,
  waitForLocation,
} from 'realia/ui/RealiaDisplay.testSupport'
import { realiaSectionIds } from 'realia/ui/realiaSections'
import { installMockIntersectionObserver } from 'test-support/intersectionObserverMock'
import { realiaEntryFactory } from 'test-support/realia-fixtures'
import { waitForSpinnerToBeRemoved } from 'test-support/waitForSpinnerToBeRemoved'

jest.mock('realia/application/RealiaService')

const lemma = 'Apkallu'
const realiaId = 'realia_000846'

function renderAtUrl(entry: RealiaEntry, url: string): void {
  realiaService.find.mockReturnValue(Promise.resolve(entry))
  renderRealiaRoute(realiaService, url)
}

describe('a realia id URL redirects to the lemma URL', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    installMockIntersectionObserver()
  })

  it('replaces the realia id in the path with the lemma', async () => {
    renderAtUrl(
      realiaEntryFactory.build({ id: lemma, realiaId }),
      `/tools/realia/${realiaId}`,
    )

    await waitForLocation(`/tools/realia/${lemma}`)
  })

  it('resolves the entry by realia id, then re-resolves it by lemma', async () => {
    renderAtUrl(
      realiaEntryFactory.build({ id: lemma, realiaId }),
      `/tools/realia/${realiaId}`,
    )

    await waitForLocation(`/tools/realia/${lemma}`)
    expect(realiaService.find).toHaveBeenCalledWith(
      realiaId,
      expect.any(AbortSignal),
    )
    expect(realiaService.find).toHaveBeenCalledWith(
      lemma,
      expect.any(AbortSignal),
    )
  })

  it('renders the entry once it has redirected', async () => {
    renderAtUrl(
      realiaEntryFactory.build({ id: lemma, realiaId }),
      `/tools/realia/${realiaId}`,
    )

    await waitForLocation(`/tools/realia/${lemma}`)
    await waitForSpinnerToBeRemoved(screen)

    expect(
      await screen.findByRole(
        'heading',
        { level: 1, name: lemma },
        { timeout: 3000 },
      ),
    ).toBeInTheDocument()
  })

  it('keeps a section hash across the redirect', async () => {
    const hash = `#${realiaSectionIds.afoRegister}`
    renderAtUrl(
      realiaEntryFactory.build({ id: lemma, realiaId }),
      `/tools/realia/${realiaId}${hash}`,
    )

    await waitForLocation(`/tools/realia/${lemma}${hash}`)
  })
})

describe('a canonical URL is left alone', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    installMockIntersectionObserver()
  })

  it('does not redirect a lemma URL', async () => {
    renderAtUrl(
      realiaEntryFactory.build({ id: lemma, realiaId }),
      `/tools/realia/${lemma}`,
    )

    await waitForSpinnerToBeRemoved(screen)
    expectLocation(`/tools/realia/${lemma}`)
    expect(realiaService.find).toHaveBeenCalledTimes(1)
  })

  it('does not loop when the entry id is itself the requested realia id', async () => {
    renderAtUrl(
      realiaEntryFactory.build({ id: realiaId, realiaId }),
      `/tools/realia/${realiaId}`,
    )

    await waitForSpinnerToBeRemoved(screen)
    expectLocation(`/tools/realia/${realiaId}`)
    expect(realiaService.find).toHaveBeenCalledTimes(1)
  })
})
