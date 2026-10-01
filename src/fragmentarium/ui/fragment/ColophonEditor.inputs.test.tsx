import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import selectEvent from 'react-select-event'
import FragmentService from 'fragmentarium/application/FragmentService'
import { Colophon, ColophonOwnership } from 'fragmentarium/domain/Colophon'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import {
  mockColophonLookups,
  renderColophonEditor,
} from 'fragmentarium/ui/fragment/ColophonEditor.testSupport'

jest.mock('fragmentarium/application/FragmentService')
const fragmentServiceMock = new (FragmentService as jest.Mock<
  jest.Mocked<FragmentService>
>)()

let updateColophon: jest.Mock<Promise<void>, [Colophon]>

beforeEach(() => {
  mockColophonLookups(fragmentServiceMock)
  updateColophon = jest.fn<Promise<void>, [Colophon]>().mockResolvedValue()
})

async function renderWith(colophon: Colophon): Promise<void> {
  await renderColophonEditor(
    fragmentFactory.build({ colophon }),
    updateColophon,
    fragmentServiceMock,
  )
}

async function save(): Promise<void> {
  await userEvent.click(screen.getByLabelText('save-colophon'))
}

async function originalFromSelect(): Promise<HTMLElement> {
  const [originalFrom] = await screen.findAllByLabelText('select-site')
  return originalFrom
}

it('saves the original provenance with its broken and uncertain flags', async () => {
  await renderWith({})

  await userEvent.click(await originalFromSelect())
  await userEvent.click(await screen.findByText('Assyria'))
  await userEvent.click(screen.getByLabelText('0-originalFrom-broken-switch'))
  await userEvent.click(
    screen.getByLabelText('0-originalFrom-uncertain-switch'),
  )
  await save()

  expect(updateColophon).toHaveBeenCalledWith(
    expect.objectContaining({
      originalFrom: { value: 'Assyria', isBroken: true, isUncertain: true },
    }),
  )
})

it('clears the original provenance', async () => {
  await renderWith({ originalFrom: { value: 'Assyria' } })

  await selectEvent.clearFirst(await originalFromSelect())
  await save()

  expect(updateColophon).toHaveBeenCalledWith(
    expect.objectContaining({ originalFrom: { value: null } }),
  )
})

it('shows and changes the ownership', async () => {
  await renderWith({ colophonOwnership: ColophonOwnership.Library })

  await userEvent.click(screen.getByText(ColophonOwnership.Library))
  await userEvent.click(await screen.findByText(ColophonOwnership.Private))
  await save()

  expect(updateColophon).toHaveBeenCalledWith(
    expect.objectContaining({ colophonOwnership: ColophonOwnership.Private }),
  )
})

it('saves the notes to the scribal process', async () => {
  await renderWith({})

  await userEvent.type(screen.getByRole('textbox'), 'notes')
  await save()

  expect(updateColophon).toHaveBeenCalledWith(
    expect.objectContaining({ notesToScribalProcess: 'notes' }),
  )
})

it('disables saving after the update fails', async () => {
  updateColophon.mockRejectedValue(new Error('Save failed'))
  await renderWith({})

  await save()

  await waitFor(() =>
    expect(screen.getByLabelText('save-colophon')).toBeDisabled(),
  )
})
