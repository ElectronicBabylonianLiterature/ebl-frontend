import { waitFor, screen as testingLibraryScreen } from '@testing-library/react'

const spinnerTimeoutInMilliseconds = 5000

type SpinnerQueries = Pick<typeof testingLibraryScreen, 'queryAllByLabelText'>

export async function waitForSpinnerToBeRemoved(
  screen: SpinnerQueries,
): Promise<void> {
  await waitFor(
    () => {
      expect(screen.queryAllByLabelText('Spinner')).toHaveLength(0)
    },
    { timeout: spinnerTimeoutInMilliseconds },
  )
}
