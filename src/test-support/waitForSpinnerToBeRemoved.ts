import { waitFor } from '@testing-library/react'

const spinnerTimeout = 3000

export async function waitForSpinnerToBeRemoved(screen): Promise<void> {
  await waitFor(
    () => {
      expect(screen.queryAllByLabelText('Spinner')).toHaveLength(0)
    },
    { timeout: spinnerTimeout },
  )
}
