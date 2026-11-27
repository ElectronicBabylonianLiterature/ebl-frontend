import React from 'react'
import { render } from '@testing-library/react'
import MesZlSection from 'signs/ui/display/MesZlSection'

it('renders nothing without either chapter', () => {
  const { container } = render(
    <MesZlSection kap3="" kap2={{ status: 'unavailable' }} />,
  )
  expect(container).toBeEmptyDOMElement()
})
