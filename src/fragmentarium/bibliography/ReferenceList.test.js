import React from 'react'
import { render } from 'react-testing-library'
import { factory } from 'factory-girl'

import ReferenceList from './ReferenceList'

let references
let element

beforeEach(async () => {
  references = await factory.buildMany('hydratedReference', 2)
  element = render(<ReferenceList references={references} />)
})

it('List all references', () => {
  for (let reference of references) {
    expect(element.container).toHaveTextContent(
      `${reference.document.author[0].family}, ${reference.document.issued['date-parts'][0][0]} : ${reference.pages} [l. ${reference.linesCited.join(', ')}] (${reference.type[0]})`
    )
  }
})
