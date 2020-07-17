import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render } from '@testing-library/react'
import { changeValueByLabel } from 'test-support/utils'

import NumberSearchForm from './NumberSearchForm'

it('Calls onChange on User Input', async () => {
  const onChange = jest.fn()
  const element = render(
    <MemoryRouter>
      <NumberSearchForm onChange={onChange} value={''} />
    </MemoryRouter>
  )

  changeValueByLabel(element, 'Number', 'K.3')

  expect(onChange).toBeCalledWith('K.3')
})
