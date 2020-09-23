import { renderHook } from '@testing-library/react-hooks'
import { usePrevious } from 'common/usePrevious'
import React, { useState } from 'react'
import { Button } from 'react-bootstrap'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

function TestCounter() {
  const [count, setCount] = useState(0)
  const prevCount = usePrevious(count)
  return (
    <>
      <Button onClick={() => setCount(count + 1)} />
      <div>{`Now: ${count}, before: ${prevCount}`}</div>
    </>
  )
}
function renderTestCounter() {
  render(<TestCounter />)
}
beforeEach(async () => {
  renderTestCounter()
})
describe('Test usePrevious Hook', () => {
  it('Change State', async () => {
    userEvent.click(screen.getByRole('button'))
    expect(screen.getByText('Now: 1, before: 0')).toBeInTheDocument()

    userEvent.click(screen.getByRole('button'))
    expect(screen.getByText('Now: 2, before: 1')).toBeInTheDocument()

    userEvent.click(screen.getByRole('button'))
    expect(screen.getByText('Now: 3, before: 2')).toBeInTheDocument()
  })
})
