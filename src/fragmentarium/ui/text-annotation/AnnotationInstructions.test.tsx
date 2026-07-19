import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AnnotationInstructions from 'fragmentarium/ui/text-annotation/AnnotationInstructions'

const modalTitle = 'How to Annotate Named Entities'

describe('AnnotationInstructions', () => {
  it('opens and closes the instructions modal', async () => {
    render(<AnnotationInstructions />)
    expect(screen.queryByText(modalTitle)).not.toBeInTheDocument()

    await userEvent.click(screen.getByLabelText('How to Use'))
    expect(await screen.findByText(modalTitle)).toBeInTheDocument()

    await userEvent.click(screen.getByText('Close'))
    expect(screen.queryByText(modalTitle)).not.toBeInTheDocument()
  })
})
