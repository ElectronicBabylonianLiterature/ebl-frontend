import React from 'react'
import Forms from './Forms'
import {render, cleanup} from 'react-testing-library'

const forms = [
  {
    lemma: ['part1', 'part2'],
    attested: false,
    notes: ['note1', 'note2']
  }
]

afterEach(cleanup)

it('Rendiers without crashing', () => {
  render(<form><Forms value={forms} /></form>)
})
