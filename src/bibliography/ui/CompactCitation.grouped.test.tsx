import React from 'react'
import { render, screen } from '@testing-library/react'
import { referenceFactory } from 'test-support/bibliography-fixtures'
import CompactCitation from 'bibliography/ui/CompactCitation'

test('shows grouped details that have only lines or only pages', () => {
  const linesOnly = referenceFactory.build({ pages: '', linesCited: ['3'] })
  const pagesOnly = referenceFactory.build({
    ...linesOnly,
    pages: '12',
    linesCited: [],
  })

  const { container } = render(
    <CompactCitation references={[linesOnly, pagesOnly]} />,
  )

  expect(screen.getByText('[l. 3]')).toBeInTheDocument()
  expect(screen.getByText('12')).toBeInTheDocument()
  expect(container).toHaveTextContent(
    `${linesOnly.year}: [l. 3]; 12 (${linesOnly.typeAbbreviation})`,
  )
})
