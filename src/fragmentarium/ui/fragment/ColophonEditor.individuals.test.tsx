import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import selectEvent from 'react-select-event'
import FragmentService from 'fragmentarium/application/FragmentService'
import {
  Colophon,
  IndividualAttestation,
  IndividualType,
} from 'fragmentarium/domain/Colophon'
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

async function openIndividual(
  individual: IndividualAttestation,
): Promise<void> {
  await renderColophonEditor(
    fragmentFactory.build({ colophon: { individuals: [individual] } }),
    updateColophon,
    fragmentServiceMock,
  )
  await userEvent.click(screen.getByText(/^Individual 1\./))
}

async function nativeOfSelect(): Promise<HTMLElement> {
  const selects = await screen.findAllByLabelText('select-site')
  return selects[selects.length - 1]
}

async function savedIndividual(): Promise<IndividualAttestation | undefined> {
  await userEvent.click(screen.getByLabelText('save-colophon'))
  const [colophon] = updateColophon.mock.calls[0]
  return colophon.individuals?.[0]
}

it('sets the native provenance and type of an individual', async () => {
  await openIndividual(new IndividualAttestation({}))

  await userEvent.click(await nativeOfSelect())
  await userEvent.click(await screen.findByText('Assyria'))
  await userEvent.click(
    screen.getByLabelText('select-colophon-individual-type'),
  )
  await userEvent.click(await screen.findByText(IndividualType.Scribe))
  await userEvent.click(screen.getByLabelText('0-type-broken-switch'))

  const individual = await savedIndividual()
  expect(individual?.nativeOf).toEqual({ value: 'Assyria' })
  expect(individual?.type).toEqual({
    value: IndividualType.Scribe,
    isBroken: true,
  })
})

it('clears the name, native provenance and type of an individual', async () => {
  await openIndividual(
    new IndividualAttestation({
      name: { value: 'Humbaba' },
      nativeOf: { value: 'Assyria' },
      type: { value: IndividualType.Owner },
    }),
  )

  await selectEvent.clearFirst(
    screen.getByLabelText('select-colophon-individual-name'),
  )
  await selectEvent.clearFirst(await nativeOfSelect())
  await selectEvent.clearFirst(
    screen.getByLabelText('select-colophon-individual-type'),
  )

  const individual = await savedIndividual()
  expect(individual?.name?.value).toBeUndefined()
  expect(individual?.nativeOf?.value).toBeUndefined()
  expect(individual?.type?.value).toBeUndefined()
})
