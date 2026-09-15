import { waitFor } from '@testing-library/react'

const spinnerTimeoutInMilliseconds = 5000

export async function waitForSpinnerToBeRemoved(screen): Promise<void> {
  await waitFor(
    () => {
      expect(screen.queryAllByLabelText('Spinner')).toHaveLength(0)
    },
    { timeout: spinnerTimeoutInMilliseconds },
  )
}
