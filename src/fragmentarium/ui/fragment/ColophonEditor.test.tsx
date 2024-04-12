import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ColophonEditor, { ColophonStatus, ColophonType } from './ColophonEditor'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import FragmentService from 'fragmentarium/application/FragmentService'
import { Promise } from 'bluebird'
import { act } from 'react-dom/test-utils'

jest.mock('fragmentarium/application/FragmentService')
let fragmentService: jest.Mocked<FragmentService>
const provenances = [
  ['Standard Text'],
  ['Assyria'],
  ['Aššur'],
  ['Dūr-Katlimmu'],
]
const names = ['Humbaba', 'Enkidu']

describe('ColophonEditor', () => {
  fragmentService = new (FragmentService as jest.Mock<
    jest.Mocked<FragmentService>
  >)()
  const mockUpdateColophon = jest.fn()
  fragmentService.fetchProvenances.mockReturnValue(Promise.resolve(provenances))
  fragmentService.fetchColophonNames.mockReturnValue(Promise.resolve(names))
  beforeEach(() => {
    mockUpdateColophon.mockClear()
  })

  it('Submits form with updated colophon status', async () => {
    const initialFragment = fragmentFactory.build({
      colophon: {
        colophonStatus: ColophonStatus.Yes,
      },
    })
    await act(async () => {
      render(
        <ColophonEditor
          fragment={initialFragment}
          updateColophon={mockUpdateColophon}
          fragmentService={fragmentService}
        />
      )
    })
    await act(async () => {
      fireEvent.change(
        screen.getByRole('combobox', { name: /colophon status/i }),
        {
          target: { value: 'No' },
        }
      )
      fireEvent.submit(screen.getByRole('button', { name: /save/i }))
    })
    await waitFor(() =>
      expect(mockUpdateColophon).toHaveBeenCalledWith(
        expect.objectContaining({
          colophonStatus: 'No',
        })
      )
    )
  })

  it('Updates colophon types when changed', async () => {
    const initialFragment = fragmentFactory.build({
      colophon: { colophonTypes: [ColophonType.AsbA] },
    })
    render(
      <ColophonEditor
        fragment={initialFragment}
        updateColophon={mockUpdateColophon}
        fragmentService={fragmentService}
      />
    )
    fireEvent.change(screen.getByLabelText(/colophon type/i), {
      target: { value: 'AsbB' },
    })
    fireEvent.submit(screen.getByRole('button', { name: /save/i }))
    await waitFor(() =>
      expect(mockUpdateColophon).toHaveBeenCalledWith(
        expect.objectContaining({
          colophonTypes: expect.arrayContaining(['AsbB']),
        })
      )
    )
  })

  it('Adds an individual attestation when fields are filled out', async () => {
    const initialFragment = fragmentFactory.build({
      colophon: {},
    })
    render(
      <ColophonEditor
        fragment={initialFragment}
        updateColophon={mockUpdateColophon}
        fragmentService={fragmentService}
      />
    )
    fireEvent.change(screen.getByLabelText(/individual's name/i), {
      target: { value: 'John Doe' },
    })
    fireEvent.submit(screen.getByRole('button', { name: /save/i }))
    await waitFor(() =>
      expect(mockUpdateColophon).toHaveBeenCalledWith(
        expect.objectContaining({
          individuals: expect.arrayContaining([
            expect.objectContaining({
              name: expect.objectContaining({
                value: 'John Doe',
              }),
            }),
          ]),
        })
      )
    )
  })

  it('Displays an error message when updateColophon fails', async () => {
    mockUpdateColophon.mockRejectedValue(new Error('Failed to update colophon'))
    const initialFragment = fragmentFactory.build({
      colophon: {},
    })
    render(
      <ColophonEditor
        fragment={initialFragment}
        updateColophon={mockUpdateColophon}
        fragmentService={fragmentService}
      />
    )
    fireEvent.submit(screen.getByRole('button', { name: /save/i }))
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        /failed to update colophon/i
      )
    )
  })

  it('Submits the form with full data successfully', async () => {
    const initialFragment = fragmentFactory.build({
      colophon: {},
    })
    render(
      <ColophonEditor
        fragment={initialFragment}
        updateColophon={mockUpdateColophon}
        fragmentService={fragmentService}
      />
    )
    fireEvent.submit(screen.getByRole('button', { name: /save/i }))
    await waitFor(() =>
      expect(mockUpdateColophon).toHaveBeenCalledWith(
        expect.objectContaining({})
      )
    )
  })
})
