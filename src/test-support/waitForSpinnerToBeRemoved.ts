import { waitForElementToBeRemoved } from '@testing-library/react'

export async function waitForSpinnerToBeRemoved(screen): Promise<void> {
  await waitForElementToBeRemoved(() => screen.queryAllByLabelText('Spinner'))
}
