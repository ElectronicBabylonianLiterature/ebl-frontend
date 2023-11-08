import React from 'react'
import { render, screen } from '@testing-library/react'
import { changeValueByLabel, submitFormByTestId } from 'test-support/utils'
import Bluebird, { Promise } from 'bluebird'

import ArchaeologyEditor from './ArchaeologyEditor'
import {
  archaeologyFactory,
  findspotFactory,
} from 'test-support/fragment-fixtures'
import {
  Archaeology,
  ArchaeologyDto,
  Findspot,
  excavationSites,
  toArchaeologyDto,
} from 'fragmentarium/domain/archaeology'
import _ from 'lodash'
import { FindspotService } from 'fragmentarium/application/FindspotService'
import userEvent from '@testing-library/user-event'

let updateArchaeology
let findspot: Findspot
let archaeology: Archaeology
let archaeologyDto: ArchaeologyDto
let findspots: Findspot[]

jest.mock('fragmentarium/application/FindspotService')

const MockFindspotService = FindspotService as jest.Mock<
  jest.Mocked<FindspotService>
>
const findspotServiceMock = new MockFindspotService()
const defaultSite = 'Babylon'

beforeEach(() => {
  updateArchaeology = jest.fn()
  updateArchaeology.mockReturnValue(Promise.resolve())
  archaeology = archaeologyFactory.build({
    site: excavationSites[defaultSite],
    findspot: findspot,
  })
  archaeologyDto = _.omitBy(
    toArchaeologyDto(archaeology),
    (value) => _.isNil(value) || value === ''
  )
  findspots = findspotFactory.buildList(10)
  findspotServiceMock.fetchFindspots.mockReturnValue(
    Bluebird.resolve(findspots)
  )

  render(
    <ArchaeologyEditor
      archaeology={archaeology}
      updateArchaeology={updateArchaeology}
      findspotService={findspotServiceMock}
    />
  )
})

it('calls updateArchaeology on submit', () => {
  submitFormByTestId(screen, 'archaeology-form')
  expect(updateArchaeology).toHaveBeenCalledWith(
    _.omitBy(archaeologyDto, (value) => _.isNil(value) || value === '')
  )
})

it('updates excavationNumber on change', () => {
  const newNumber = 'foo.42'
  changeValueByLabel(screen, 'Excavation number', newNumber)
  expect(screen.getByLabelText('Excavation number')).toHaveValue(newNumber)
})

it('shows findspot choices', async () => {
  userEvent.click(screen.getByLabelText('select-findspot'))
  findspots.forEach((findspot) =>
    expect(screen.getByText(findspot.toString())).toBeVisible()
  )
})
