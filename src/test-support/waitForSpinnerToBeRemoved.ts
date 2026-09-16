import { waitFor } from '@testing-library/react'

const SPINNER_REMOVAL_TIMEOUT_MS = 4000

export async function waitForSpinnerToBeRemoved(screen): Promise<void> {
  await waitFor(
    () => {
      expect(screen.queryAllByLabelText('Spinner')).toHaveLength(0)
    },
    { timeout: SPINNER_REMOVAL_TIMEOUT_MS },
  )
}
