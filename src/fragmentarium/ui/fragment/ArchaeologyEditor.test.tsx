import React from 'react'
import { render, screen } from '@testing-library/react'
import { changeValueByLabel, submitFormByTestId } from 'test-support/utils'
import Bluebird, { Promise } from 'bluebird'

import ArchaeologyEditor from './ArchaeologyEditor'
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
import { FindspotService } from 'fragmentarium/application/FindspotService'
import FragmentService from 'fragmentarium/application/FragmentService'
import userEvent from '@testing-library/user-event'

let updateArchaeology
let findspot: Findspot
let archaeology: Archaeology
let archaeologyDto: ArchaeologyDto
let findspots: Findspot[]

jest.mock('fragmentarium/application/FindspotService')
jest.mock('fragmentarium/application/FragmentService')

const MockFindspotService = FindspotService as jest.Mock<
  jest.Mocked<FindspotService>
>
const findspotServiceMock = new MockFindspotService()
const MockFragmentService = FragmentService as jest.Mock<
  jest.Mocked<FragmentService>
>
const fragmentServiceMock = new MockFragmentService()
const defaultSite = 'Babylon'

const setup = async () => {
  updateArchaeology = jest.fn()
  updateArchaeology.mockReturnValue(Promise.resolve())
  findspot = new Findspot(42, undefined, 'some area')
  archaeology = archaeologyFactory.build({
    site: excavationSites[defaultSite],
    findspot: findspot,
  })
  archaeologyDto = _.omitBy(
    toArchaeologyDto(archaeology),
    (value) => _.isNil(value) || value === '',
  )
  findspots = findspotFactory.buildList(10)
  findspotServiceMock.fetchFindspots.mockReturnValue(
    Bluebird.resolve(findspots),
  )
  fragmentServiceMock.fetchProvenances.mockReturnValue(
    Bluebird.resolve([
      {
        id: 'babylon',
        longName: 'Babylon',
        abbreviation: 'Bab',
        parent: 'Babylonia',
        sortKey: 1,
      },
    ]),
  )

  render(
    <ArchaeologyEditor
      archaeology={archaeology}
      updateArchaeology={updateArchaeology}
      findspotService={findspotServiceMock}
      fragmentService={fragmentServiceMock}
    />,
  )

  await screen.findByLabelText('Excavation number')
}

it('calls updateArchaeology on submit', async () => {
  await setup()
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
