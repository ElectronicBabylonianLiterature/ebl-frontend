import { screen } from '@testing-library/react'
import { changeValueByLabel, submitFormByTestId } from 'test-support/utils'

import {
  renderArchaeologyEditor,
  UpdateArchaeology,
} from 'fragmentarium/ui/fragment/ArchaeologyEditor.testSupport'
import { Fragment } from 'fragmentarium/domain/fragment'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import {
  archaeologyFactory,
  findspotFactory,
} from 'test-support/fragment-data-fixtures'
import {
  Archaeology,
  Findspot,
  excavationSites,
} from 'fragmentarium/domain/archaeology'
import { ArchaeologyDto } from 'fragmentarium/domain/archaeologyDtos'
import { toArchaeologyDto } from 'fragmentarium/domain/archaeologyDtos'
import _ from 'lodash'
import userEvent from '@testing-library/user-event'

let updateArchaeology: UpdateArchaeology
let findspot: Findspot
let archaeology: Archaeology
let archaeologyDto: ArchaeologyDto
let findspots: Findspot[]

const defaultSite = 'Babylon'

const setup = async ({ hasFindspot } = { hasFindspot: true }) => {
  updateArchaeology = jest
    .fn<Promise<Fragment>, [ArchaeologyDto]>()
    .mockResolvedValue(fragmentFactory.build())
  findspot = new Findspot(42, undefined, 'some area')
  archaeology = archaeologyFactory.build({
    site: excavationSites[defaultSite],
    findspot: hasFindspot ? findspot : null,
  })
  archaeologyDto = _.omitBy(
    toArchaeologyDto(archaeology),
    (value) => _.isNil(value) || value === '',
  )
  findspots = findspotFactory.buildList(10)
  await renderArchaeologyEditor(archaeology, updateArchaeology, findspots)
}

it('calls updateArchaeology on submit', async () => {
  await setup()
  updateArchaeology.mockReturnValueOnce(new Promise<Fragment>(() => undefined))
  submitFormByTestId(screen, 'archaeology-form')
  expect(updateArchaeology).toHaveBeenCalledWith(
    _.omit(archaeologyDto, 'findspot'),
  )
})

it('updates excavationNumber on change', async () => {
  await setup()
  const newNumber = 'foo.42'
  changeValueByLabel(screen, 'Excavation number', newNumber)
  expect(screen.getByLabelText('Excavation number')).toHaveValue(newNumber)
})

it('shows stored values when opening form', async () => {
  await setup()
  expect(screen.getByLabelText('Excavation number')).toHaveValue(
    archaeology.excavationNumber,
  )
})

it('shows findspot choices', async () => {
  await setup()
  await userEvent.click(screen.getByLabelText('select-findspot'))
  findspots
    .filter((findspot) => findspot.site === archaeology.site)
    .forEach((findspot) =>
      expect(screen.getByText(findspot.toString())).toBeVisible(),
    )
})

it('shows findspot-uncertain checkbox with stored value', async () => {
  await setup()
  const checkbox = screen.getByLabelText('findspot-uncertain')
  expect(checkbox).toBeInTheDocument()
  if (archaeology.isFindspotUncertain) {
    expect(checkbox).toBeChecked()
  } else {
    expect(checkbox).not.toBeChecked()
  }
})

it('updates isFindspotUncertain on change', async () => {
  await setup()
  const checkbox = screen.getByLabelText('findspot-uncertain')
  await userEvent.click(checkbox)
  if (archaeology.isFindspotUncertain) {
    expect(checkbox).not.toBeChecked()
  } else {
    expect(checkbox).toBeChecked()
  }
})

it('opens without a stored findspot and leaves it unset on submit', async () => {
  await setup({ hasFindspot: false })
  updateArchaeology.mockReturnValueOnce(new Promise<Fragment>(() => undefined))

  expect(screen.queryByText(findspot.toString())).not.toBeInTheDocument()
  submitFormByTestId(screen, 'archaeology-form')
  expect(updateArchaeology).toHaveBeenCalledWith(
    expect.not.objectContaining({ findspotId: expect.anything() }),
  )
})
