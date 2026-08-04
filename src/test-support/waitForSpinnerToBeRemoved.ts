import { waitFor } from '@testing-library/react'

export async function waitForSpinnerToBeRemoved(screen): Promise<void> {
  await waitFor(() => {
    expect(screen.queryAllByLabelText('Spinner')).toHaveLength(0)
  })
}
