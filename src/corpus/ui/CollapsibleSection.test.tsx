import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import CollapsibleSection from './CollapsibleSection'
import { clickNth } from 'test-support/utils'

const content = 'Content'
const heading = 'Heading'

describe('Open', () => {
  beforeEach(() => {
    render(
      <CollapsibleSection classNameBlock="block" heading={heading} open>
        {content}
      </CollapsibleSection>
    )
  })

  test('Heading is visible', () => {
    expect(screen.getByText(heading)).toBeVisible()
  })

  test('Content is visible', () => {
    expect(screen.getByText(content)).toBeVisible()
  })
})

describe('Closed', () => {
  beforeEach(() => {
    render(
      <CollapsibleSection classNameBlock="block" heading={heading}>
        {content}
      </CollapsibleSection>
    )
  })

  test('Heading is visible', () => {
    expect(screen.getByText(heading)).toBeVisible()
  })

  test('Content is not in the document', () => {
    expect(screen.queryByText(content)).not.toBeInTheDocument()
  })

  test('Open', async () => {
    clickNth(screen, heading)
    await waitFor(() => expect(screen.getByText(content)).toBeVisible())
    expect(screen.getByText(heading)).toBeVisible()
  })
})
