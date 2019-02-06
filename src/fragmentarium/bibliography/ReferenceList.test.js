import React from 'react'
import { render } from 'react-testing-library'
import { factory } from 'factory-girl'

import ReferenceList from './ReferenceList'

let element

it('List all references', async () => {
  const references = await factory.buildMany('hydratedReference', 2)
  element = render(<ReferenceList references={references} />)
  for (let reference of references) {
    expect(element.container).toHaveTextContent(
      `${reference.document.author[0].family}, ${reference.document.issued['date-parts'][0][0]} : ${reference.pages} [l. ${reference.linesCited.join(', ')}] (${reference.type[0]})`
    )
  }
})

it('Hides non present elements', async () => {
  const reference = await factory.build('hydratedReference', { pages: '', linesCited: [] })
  element = render(<ReferenceList references={[reference]} />)
  expect(element.container).toHaveTextContent(
    `${reference.document.author[0].family}, ${reference.document.issued['date-parts'][0][0]} : (${reference.type[0]})`
  )
})

it('Displays placeholder if no references', async () => {
  element = render(<ReferenceList references={[]} />)
  expect(element.container).toHaveTextContent('No references')
})
