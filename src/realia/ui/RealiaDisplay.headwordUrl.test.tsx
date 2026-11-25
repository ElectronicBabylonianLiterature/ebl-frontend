import { screen } from '@testing-library/react'
import {
  realiaService,
  renderRealiaRoute,
} from 'realia/ui/RealiaDisplay.testSupport'
import { getRealiaPageUrl } from 'realia/ui/realiaPage'
import { installMockIntersectionObserver } from 'test-support/intersectionObserverMock'
import { realiaEntryFactory } from 'test-support/realia-fixtures'
import { waitForSpinnerToBeRemoved } from 'test-support/waitForSpinnerToBeRemoved'

jest.mock('realia/application/RealiaService')

const aquariiHeadword = 'φ, χ, ψ¹, ψ², ψ³ Aquarii?'

describe('a Realia headword with special characters', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    installMockIntersectionObserver()
  })

  it('opens from its link without truncating the URL at the question mark', async () => {
    const entry = realiaEntryFactory.build({ id: aquariiHeadword })
    realiaService.find.mockReturnValue(Promise.resolve(entry))
    renderRealiaRoute(realiaService, getRealiaPageUrl(aquariiHeadword))
    await waitForSpinnerToBeRemoved(screen)
    expect(realiaService.find).toHaveBeenCalledWith(
      aquariiHeadword,
      expect.anything(),
    )
    expect(
      screen.getByRole('heading', { level: 1, name: aquariiHeadword }),
    ).toBeInTheDocument()
  })
})
