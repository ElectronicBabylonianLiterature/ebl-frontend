import { waitFor, type Screen } from '@testing-library/react'

const SPINNER_REMOVAL_TIMEOUT_IN_MILLISECONDS = 3000

export async function waitForSpinnerToBeRemoved(
  screen: Pick<Screen, 'queryAllByLabelText'>,
): Promise<void> {
  await waitFor(
    () => {
      expect(screen.queryAllByLabelText('Spinner')).toHaveLength(0)
    },
    { timeout: SPINNER_REMOVAL_TIMEOUT_IN_MILLISECONDS },
  )
}
