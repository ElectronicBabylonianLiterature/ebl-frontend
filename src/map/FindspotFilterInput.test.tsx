import React, { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import FindspotFilterInput from 'map/FindspotFilterInput'
import { MAX_FILTER_LENGTH } from 'map/mapUrlState'

function Harness(): JSX.Element {
  const [filter, setFilter] = useState('a'.repeat(MAX_FILTER_LENGTH))

  return (
    <>
      <FindspotFilterInput
        provenances={[]}
        filter={filter}
        onFilterChange={setFilter}
      />
      <button type="button" onClick={() => setFilter('external')}>
        Navigate externally
      </button>
    </>
  )
}

test('synchronizes an external filter after a capped local no-op', () => {
  render(<Harness />)
  const input = screen.getByLabelText('Filter findspots by name')

  fireEvent.change(input, {
    target: { value: 'a'.repeat(MAX_FILTER_LENGTH + 1) },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Navigate externally' }))

  expect(input).toHaveValue('external')
})
