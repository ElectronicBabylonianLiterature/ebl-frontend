import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import CollapsibleSection from './CollapsibleSection'
import { clickNth } from 'test-support/utils'

const content = 'Content'
const heading = 'Heading'

describe('Open', () => {
  function setup(): void {
    render(
      <CollapsibleSection classNameBlock="block" heading={heading} open>
        {content}
      </CollapsibleSection>,
    )
  }

  test('Heading is visible', () => {
    setup()
    expect(screen.getByText(heading)).toBeVisible()
  })

  test('Content is visible', () => {
    setup()
    expect(screen.getByText(content)).toBeVisible()
  })
})

describe('Closed', () => {
  function setup(): void {
    render(
      <CollapsibleSection classNameBlock="block" heading={heading}>
        {content}
      </CollapsibleSection>,
    )
  }

  test('Heading is visible', () => {
    setup()
    expect(screen.getByText(heading)).toBeVisible()
  })

  test('Content is not in the document', () => {
    setup()
    expect(screen.queryByText(content)).not.toBeInTheDocument()
  })

  test('Open', async () => {
    setup()
    clickNth(screen, heading)
    await waitFor(() => expect(screen.getByText(content)).toBeVisible())
    expect(screen.getByText(heading)).toBeVisible()
  })
})
