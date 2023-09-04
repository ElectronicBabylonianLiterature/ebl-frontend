import React from 'react'
import { render, screen } from '@testing-library/react'
import { changeValueByLabel, submitFormByTestId } from 'test-support/utils'
import { Promise } from 'bluebird'

import ArchaeologyEditor from './ArchaeologyEditor'
import { archaeologyFactory } from 'test-support/fragment-fixtures'
import {
  Archaeology,
  ArchaeologyDto,
  toArchaeologyDto,
} from 'fragmentarium/domain/archaeology'
import _ from 'lodash'

// mock archaeology

// test update number
// test update invalid number
// test update site
// test delete site
// test update isRegularExcavation

let updateArchaeology
let archaeology: Archaeology
let archaeologyDto: ArchaeologyDto

beforeEach(() => {
  updateArchaeology = jest.fn()
  updateArchaeology.mockReturnValue(Promise.resolve())
  archaeology = archaeologyFactory.build()
  archaeologyDto = _.omitBy(
    toArchaeologyDto(archaeology),
    (value) => _.isNil(value) || value === ''
  )

  render(
    <ArchaeologyEditor
      archaeology={archaeology}
      updateArchaeology={updateArchaeology}
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
