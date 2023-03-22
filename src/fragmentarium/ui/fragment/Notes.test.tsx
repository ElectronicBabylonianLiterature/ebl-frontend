import React from 'react'
import { render } from '@testing-library/react'

import Notes from './Notes'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { Fragment } from 'fragmentarium/domain/fragment'

describe.each(['ura 16 123-129 [JLP]', 'aaa\nnn'])(
  'eBL Notes "%s"',
  (notes) => {
    let fragment: Fragment
    let container: HTMLElement

    beforeEach(() => {
      fragment = fragmentFactory.build({
        notes: { text: notes, parts: [{ text: notes, type: 'StringPart' }] },
      })
      container = render(<Notes fragment={fragment} />).container
    })

    it(`Renders notes`, () => {
      expect(container).toHaveTextContent(fragment.notes.text.replace('\n', ''))
    })
  }
)
