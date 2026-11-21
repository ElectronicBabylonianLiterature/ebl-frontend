import React from 'react'
import { screen } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { useEditLiteContext } from 'corpus/ui/edit-lite/EditLiteContext'
import { renderWithEditLite } from 'corpus/ui/edit-lite/editLite.testSupport'

function SourceKind(): JSX.Element {
  return <p>{useEditLiteContext().kind}</p>
}

test('returns the provided context', () => {
  renderWithEditLite(<SourceKind />, { kind: 'legacy' })

  expect(screen.getByText('legacy')).toBeInTheDocument()
})

test('fails without a provider', () => {
  expect(() => renderToString(<SourceKind />)).toThrow(
    'EditLiteContext is not provided.',
  )
})
