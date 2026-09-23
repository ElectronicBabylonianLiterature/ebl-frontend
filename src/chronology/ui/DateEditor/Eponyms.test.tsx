import React from 'react'
import { render, screen } from '@testing-library/react'
import {
  EponymField,
  eponymsNeoAssyrian,
} from 'chronology/ui/DateEditor/Eponyms'

const adadNerari = eponymsNeoAssyrian[0]

describe('EponymField current value', () => {
  it('shows the selected eponym when it belongs to the chosen phase', () => {
    render(
      <EponymField
        eponym={adadNerari}
        assyrianPhase="NA"
        setEponym={jest.fn()}
      />,
    )

    expect(screen.getByText('Adad-nērārī (II) (910)')).toBeInTheDocument()
  })

  it('clears the selection when the eponym belongs to another phase', () => {
    render(
      <EponymField
        eponym={adadNerari}
        assyrianPhase="MA"
        setEponym={jest.fn()}
      />,
    )

    expect(screen.queryByText('Adad-nērārī (II) (910)')).not.toBeInTheDocument()
    expect(screen.getByText('Eponym')).toBeInTheDocument()
  })

  it('shows the placeholder when no eponym is selected', () => {
    render(<EponymField assyrianPhase="NA" setEponym={jest.fn()} />)

    expect(screen.getByText('Eponym')).toBeInTheDocument()
  })
})
