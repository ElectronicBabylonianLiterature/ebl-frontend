import React from 'react'
import { render } from 'react-testing-library'
import { factory } from 'factory-girl'

import ReferenceList from './ReferenceList'

let element

it('List all references', async () => {
  const references = await factory.buildMany('reference', 2)
  element = render(<ReferenceList references={references} />)
  for (let reference of references) {
    expect(element.container).toHaveTextContent(
      `${reference.author}, ${reference.year} : ${reference.pages} [l. ${reference.linesCited.join(', ')}] (${reference.typeAbbreviation})`
    )
  }
})

it('Hides non present elements', async () => {
  const reference = await factory.build('reference', { pages: '', linesCited: [] })
  element = render(<ReferenceList references={[reference]} />)
  expect(element.container).toHaveTextContent(
    `${reference.author}, ${reference.year} : (${reference.typeAbbreviation})`
  )
})

it('Displays placeholder if no references', async () => {
  element = render(<ReferenceList references={[]} />)
  expect(element.container).toHaveTextContent('No references')
})
