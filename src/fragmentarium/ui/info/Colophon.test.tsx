import React from 'react'
import { render, screen } from '@testing-library/react'
import ColophonInfo from './Colophon'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { colophonFactory } from 'test-support/colophon-fixtures'
import {
  ColophonOwnership,
  ColophonStatus,
  ColophonType,
  IndividualAttestation,
} from 'fragmentarium/domain/Colophon'

const mockColophon = colophonFactory.build({
  colophonStatus: ColophonStatus.Yes,
  colophonOwnership: ColophonOwnership.Private,
  notesToScribalProcess: 'fine details',
  originalFrom: { value: 'Babylon' },
  writtenIn: { value: 'Babylon' },
  colophonTypes: [ColophonType.AsbA, ColophonType.AsbB],
  individuals: ['John Doe', 'Jane Doe'].map(
    (name) => new IndividualAttestation({ name: { value: name } })
  ),
})

const mockFragment = fragmentFactory.build({
  colophon: mockColophon,
})

describe('ColophonInfo component', () => {
  it('renders all items correctly when colophon is provided', () => {
    render(<ColophonInfo fragment={mockFragment} />)
    expect(screen.getByText('Colophon Status: Yes')).toBeInTheDocument()
    expect(screen.getByText('Colophon Ownership: Private')).toBeInTheDocument()
    expect(
      screen.getByText('Notes To Scribal Process: fine details')
    ).toBeInTheDocument()
    expect(screen.getByText('Original From: Babylon')).toBeInTheDocument()
    expect(screen.getByText('Written In: Babylon')).toBeInTheDocument()
    expect(screen.getByText('Types: Asb a, Asb b')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
  })

  it('renders nothing when colophon is missing', () => {
    const modifiedFragment = fragmentFactory.build({
      ...mockFragment,
      colophon: undefined,
    })
    render(<ColophonInfo fragment={modifiedFragment} />)
    expect(screen.queryByText('Colophon')).not.toBeInTheDocument()
  })

  it('excludes items with undefined, null or empty values', () => {
    const modifiedColophon = {
      ...mockColophon,
      colophonStatus: undefined,
      originalFrom: undefined,
      colophonTypes: [],
    }
    const modifiedFragment = fragmentFactory.build({
      ...mockFragment,
      colophon: modifiedColophon,
    })
    render(<ColophonInfo fragment={modifiedFragment} />)
    expect(screen.queryByText('Colophon Status: Yes')).not.toBeInTheDocument()
    expect(screen.queryByText('Original From: Babylon')).not.toBeInTheDocument()
    expect(screen.queryByText('Types: Asb a, Asb b')).not.toBeInTheDocument()
    expect(screen.getByText('Colophon Ownership: Private')).toBeInTheDocument()
    expect(screen.getByText('Written In: Babylon')).toBeInTheDocument()
  })

  it('correctly handles cases with no individuals listed', () => {
    const modifiedColophon = { ...mockColophon, individuals: [] }
    const modifiedFragment = fragmentFactory.build({
      ...mockFragment,
      colophon: modifiedColophon,
    })
    render(<ColophonInfo fragment={modifiedFragment} />)
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
    expect(screen.queryByText('Jane Doe')).not.toBeInTheDocument()
  })
})
