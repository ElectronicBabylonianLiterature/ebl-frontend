import React from 'react'
import { render, screen } from '@testing-library/react'
import ColophonEditor from './ColophonEditor'
import { ColophonStatus, ColophonType } from 'fragmentarium/domain/Colophon'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import FragmentService from 'fragmentarium/application/FragmentService'
import { Promise } from 'bluebird'
import {} from 'react-dom/test-utils'
import userEvent from '@testing-library/user-event'
import { Fragment } from 'fragmentarium/domain/fragment'

jest.mock('fragmentarium/application/FragmentService')
const fragmentServiceMock = new (FragmentService as jest.Mock<
  jest.Mocked<FragmentService>
>)()
const provenances = [
  {
    id: 'standard-text',
    longName: 'Standard Text',
    abbreviation: 'Std',
    parent: null,
    sortKey: 1,
  },
  {
    id: 'assyria',
    longName: 'Assyria',
    abbreviation: 'Assa',
    parent: null,
    sortKey: 2,
  },
  {
    id: 'assur',
    longName: 'Aššur',
    abbreviation: 'Ašš',
    parent: 'Assyria',
    sortKey: 3,
  },
  {
    id: 'dur-katlimmu',
    longName: 'Dūr-Katlimmu',
    abbreviation: 'Dka',
    parent: 'Assyria',
    sortKey: 4,
  },
]
const names = ['Humbaba', 'Zababa', 'Enkidu']

const selectOption = async function (
  dropdown: HTMLElement,
  optionLabel: string,
  saveForm = true,
) {
  await userEvent.click(dropdown)
  const option = await screen.findByText(optionLabel)
  await userEvent.click(option)
  if (saveForm) {
    await userEvent.click(screen.getByLabelText('save-colophon'))
  }
}

const renderColophonEditor = async function (
  initialFragment: Fragment,
  mockUpdateColophon,
  fragmentServiceMock: jest.Mocked<FragmentService>,
) {
  render(
    <ColophonEditor
      fragment={initialFragment}
      updateColophon={mockUpdateColophon}
      fragmentService={fragmentServiceMock}
    />,
  )
}

describe('ColophonEditor', () => {
  let mockUpdateColophon
  beforeEach(() => {
    fragmentServiceMock.fetchProvenances.mockReturnValue(
      Promise.resolve(provenances),
    )
    fragmentServiceMock.fetchColophonNames.mockReturnValue(
      Promise.resolve(names),
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
      fragmentServiceMock,
    )
    await selectOption(
      screen.getByLabelText('select-colophon-status'),
      ColophonStatus.OnlyColophon,
    )
    expect(mockUpdateColophon).toHaveBeenCalledTimes(1)
    expect(mockUpdateColophon).toHaveBeenCalledWith(
      expect.objectContaining({
        colophonStatus: ColophonStatus.OnlyColophon,
      }),
    )
  })

  it('Updates colophon types when changed', async () => {
    const initialFragment = fragmentFactory.build({
      colophon: { colophonTypes: [ColophonType.AsbA] },
    })
    await renderColophonEditor(
      initialFragment,
      mockUpdateColophon,
      fragmentServiceMock,
    )
    await selectOption(
      screen.getByLabelText('select-colophon-type'),
      ColophonType.AsbB,
    )
    expect(mockUpdateColophon).toHaveBeenCalledTimes(1)
    expect(mockUpdateColophon).toHaveBeenCalledWith(
      expect.objectContaining({
        colophonTypes: expect.arrayContaining([
          ColophonType.AsbA,
          ColophonType.AsbB,
        ]),
      }),
    )
  })

  it('Adds an individual attestation and saves it', async () => {
    const initialFragment = fragmentFactory.build({
      colophon: {},
    })
    await renderColophonEditor(
      initialFragment,
      mockUpdateColophon,
      fragmentServiceMock,
    )
    await userEvent.click(screen.getByText('Add Individual'))
    await userEvent.click(screen.getByText('Individual 1.'))
    await userEvent.click(screen.getByLabelText('0-name-broken-switch'))
    const nameInput = screen.getByLabelText('select-colophon-individual-name')
    await userEvent.type(nameInput, 'ba')
    await selectOption(nameInput, 'Humbaba')
    expect(mockUpdateColophon).toHaveBeenCalledTimes(1)
    expect(mockUpdateColophon).toHaveBeenCalledWith(
      expect.objectContaining({
        individuals: expect.arrayContaining([
          expect.objectContaining({
            name: { value: 'Humbaba', isBroken: true },
          }),
        ]),
      }),
    )
  })
})
