import React from 'react'
import { screen } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { useEditLiteContext } from 'corpus/ui/edit-lite/EditLiteContext'
import { renderWithEditLite } from 'corpus/ui/edit-lite/editLite.testSupport'

function WritePermission(): JSX.Element {
  return <p>{useEditLiteContext().canWrite ? 'writer' : 'reader'}</p>
}

test.each([
  [true, 'writer'],
  [false, 'reader'],
])('returns the provided context; can write: %s', (canWrite, expected) => {
  renderWithEditLite(<WritePermission />, { canWrite })

  expect(screen.getByText(expected)).toBeInTheDocument()
})

test('fails without a provider', () => {
  expect(() => renderToString(<WritePermission />)).toThrow(
    'EditLiteContext is not provided.',
  )
})
