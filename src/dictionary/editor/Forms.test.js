import React from 'react'
import Forms from './Forms'
import {Form} from 'element-react'
import {render} from 'react-testing-library'

const forms = [
  {
    lemma: ['part1', 'part2'],
    attested: false,
    notes: ['note1', 'note2']
  }
]

it('Rendiers without crashing', () => {
  render(<Form><Forms value={forms} /></Form>)
})
