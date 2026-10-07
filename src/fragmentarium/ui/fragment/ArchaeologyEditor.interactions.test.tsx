import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import selectEvent from 'react-select-event'
import { ExcavationSite, Findspot } from 'fragmentarium/domain/archaeology'
import { ArchaeologyDto } from 'fragmentarium/domain/archaeologyDtos'
import { Fragment } from 'fragmentarium/domain/fragment'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import {
  renderArchaeologyEditor,
  UpdateArchaeology,
} from 'fragmentarium/ui/fragment/ArchaeologyEditor.testSupport'

const babylon: ExcavationSite = {
  name: 'Babylon',
  abbreviation: 'Bab',
  parent: 'Babylonia',
}
const northFindspot = new Findspot(1, babylon, 'north sector')
const zeroFindspot = new Findspot(0, babylon, 'zero sector')
const findspots = [northFindspot, zeroFindspot]
const storedArchaeology = {
  site: babylon,
  findspotId: northFindspot.id,
  findspot: northFindspot,
}

let updateArchaeology: UpdateArchaeology

beforeEach(() => {
  updateArchaeology = jest
    .fn<Promise<Fragment>, [ArchaeologyDto]>()
    .mockResolvedValue(fragmentFactory.build())
})

function saveButton(): HTMLElement {
  return screen.getByRole('button', { name: 'Save' })
}

async function chooseFindspot(sector: RegExp): Promise<void> {
  await userEvent.click(screen.getByLabelText('select-findspot'))
  await userEvent.click(await screen.findByText(sector))
}

it('opens an empty form without stored archaeology', async () => {
  await renderArchaeologyEditor(null, updateArchaeology, findspots)

  expect(screen.getByLabelText('Excavation number')).toHaveValue('')
  expect(screen.getByLabelText('regular-excavation')).not.toBeChecked()
  expect(screen.getByLabelText('findspot-uncertain')).not.toBeChecked()
  expect(saveButton()).toBeDisabled()
})

it('saves a chosen site and findspot', async () => {
  await renderArchaeologyEditor(null, updateArchaeology, findspots)

  await userEvent.click(screen.getByLabelText('select-site'))
  await userEvent.click(await screen.findByText('Babylon'))
  await chooseFindspot(/north sector/)
  await userEvent.click(screen.getByLabelText('regular-excavation'))
  await userEvent.click(saveButton())

  expect(updateArchaeology).toHaveBeenCalledWith({
    site: 'Babylon',
    findspotId: northFindspot.id,
    isRegularExcavation: true,
    isFindspotUncertain: false,
  })
  await waitFor(() => expect(saveButton()).toBeDisabled())
})

it('clears the findspot', async () => {
  await renderArchaeologyEditor(storedArchaeology, updateArchaeology, findspots)

  await selectEvent.clearFirst(screen.getByLabelText('select-findspot'))
  await userEvent.click(saveButton())

  expect(updateArchaeology).toHaveBeenCalledWith(
    expect.not.objectContaining({ findspotId: expect.anything() }),
  )
})

it('does not store a findspot with the id 0', async () => {
  await renderArchaeologyEditor(storedArchaeology, updateArchaeology, findspots)

  await chooseFindspot(/zero sector/)
  await userEvent.click(saveButton())

  expect(updateArchaeology).toHaveBeenCalledWith(
    expect.not.objectContaining({ findspotId: expect.anything() }),
  )
})

it('drops the findspot when the site is cleared', async () => {
  await renderArchaeologyEditor(storedArchaeology, updateArchaeology, findspots)

  await selectEvent.clearFirst(screen.getByLabelText('select-site'))
  await userEvent.click(saveButton())

  expect(updateArchaeology).toHaveBeenCalledWith({
    isRegularExcavation: false,
    isFindspotUncertain: false,
  })
})

it('keeps the changes unsaved when saving fails', async () => {
  updateArchaeology.mockRejectedValue(new Error('Save failed'))
  await renderArchaeologyEditor(null, updateArchaeology, findspots)

  await userEvent.click(screen.getByLabelText('findspot-uncertain'))
  await userEvent.click(saveButton())

  await waitFor(() => expect(updateArchaeology).toHaveBeenCalled())
  expect(saveButton()).toBeEnabled()
})
