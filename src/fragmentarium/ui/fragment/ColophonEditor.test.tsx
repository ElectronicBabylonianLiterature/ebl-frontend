import React from 'react'
import { render, screen } from '@testing-library/react'
import ColophonEditor from './ColophonEditor'
import { ColophonStatus, ColophonType } from 'fragmentarium/domain/Colophon'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import FragmentService from 'fragmentarium/application/FragmentService'
import { Promise } from 'bluebird'
import { act } from 'react-dom/test-utils'
import userEvent from '@testing-library/user-event'
import { Fragment } from 'fragmentarium/domain/fragment'

jest.mock('fragmentarium/application/FragmentService')
const fragmentServiceMock = new (FragmentService as jest.Mock<
  jest.Mocked<FragmentService>
>)()
const provenances = [
  ['Standard Text'],
  ['Assyria'],
  ['Aššur'],
  ['Dūr-Katlimmu'],
]
const names = ['Humbaba', 'Zababa', 'Enkidu']

const selectOption = async function (
  dropdown: HTMLElement,
  optionLabel: string,
  saveForm = true
) {
  await act(async () => {
    userEvent.click(dropdown)
    const option = await screen.findByText(optionLabel)
    userEvent.click(option)
    if (saveForm) {
      await userEvent.click(screen.getByLabelText('save-colophon'))
    }
  })
}

const renderColophonEditor = async function (
  initialFragment: Fragment,
  mockUpdateColophon,
  fragmentServiceMock: jest.Mocked<FragmentService>
) {
  await act(async () => {
    await render(
      <ColophonEditor
        fragment={initialFragment}
        updateColophon={mockUpdateColophon}
        fragmentService={fragmentServiceMock}
      />
    )
  })
}

describe('ColophonEditor', () => {
  let mockUpdateColophon
  beforeEach(() => {
    fragmentServiceMock.fetchProvenances.mockReturnValue(
      Promise.resolve(provenances)
    )
    fragmentServiceMock.fetchColophonNames.mockReturnValue(
      Promise.resolve(names)
    )
    mockUpdateColophon = jest.fn()
  })
  afterEach(() => mockUpdateColophon.mockClear())

  it('Submits form with updated colophon status', async () => {
    const initialFragment = fragmentFactory.build({
      colophon: {
        colophonStatus: ColophonStatus.Yes,
      },
    })
    await renderColophonEditor(
      initialFragment,
      mockUpdateColophon,
      fragmentServiceMock
    )
    await selectOption(
      screen.getByLabelText('select-colophon-status'),
      ColophonStatus.OnlyColophon
    )
    expect(mockUpdateColophon).toHaveBeenCalledTimes(1)
    expect(mockUpdateColophon).toHaveBeenCalledWith(
      expect.objectContaining({
        colophonStatus: ColophonStatus.OnlyColophon,
      })
    )
  })

  it('Updates colophon types when changed', async () => {
    const initialFragment = fragmentFactory.build({
      colophon: { colophonTypes: [ColophonType.AsbA] },
    })
    await renderColophonEditor(
      initialFragment,
      mockUpdateColophon,
      fragmentServiceMock
    )
    await selectOption(
      screen.getByLabelText('select-colophon-type'),
      ColophonType.AsbB
    )
    expect(mockUpdateColophon).toHaveBeenCalledTimes(1)
    expect(mockUpdateColophon).toHaveBeenCalledWith(
      expect.objectContaining({
        colophonTypes: expect.arrayContaining([
          ColophonType.AsbA,
          ColophonType.AsbB,
        ]),
      })
    )
  })

  it('Adds an individual attestation and saves it', async () => {
    const initialFragment = fragmentFactory.build({
      colophon: {},
    })
    await renderColophonEditor(
      initialFragment,
      mockUpdateColophon,
      fragmentServiceMock
    )
    await act(async () => {
      await userEvent.click(screen.getByText('Add Individual'))
      await userEvent.click(screen.getByText('Individual 1.'))
    })
    userEvent.click(screen.getByLabelText('name-broken-switch'))
    const nameInput = screen.getByLabelText('select-colophon-individual-name')
    userEvent.type(nameInput, 'ba')
    await selectOption(nameInput, 'Humbaba')
    expect(mockUpdateColophon).toHaveBeenCalledTimes(1)
    expect(mockUpdateColophon).toHaveBeenCalledWith(
      expect.objectContaining({
        individuals: expect.arrayContaining([
          expect.objectContaining({
            name: { value: 'Humbaba', isBroken: true },
          }),
        ]),
      })
    )
  })
})
