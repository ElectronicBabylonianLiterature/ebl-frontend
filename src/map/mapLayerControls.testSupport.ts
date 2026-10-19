import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

export async function openLayerControls(): Promise<void> {
  await userEvent.click(
    await screen.findByRole('button', { name: 'Map layers' }),
  )
}
