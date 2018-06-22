import React from 'react'
import { Router } from 'react-router-dom'
import createMemoryHistory from 'history/createMemoryHistory'
import {fireEvent, render, wait, cleanup} from 'react-testing-library'
import WordSearchForm from './WordSearchForm'

afterEach(cleanup)

it('Adds lemma to query string on submit', async () => {
  const history = createMemoryHistory()
  jest.spyOn(history, 'push')
  const {getByLabelText, container} = render(<Router history={history}><WordSearchForm /></Router>)

  const lemma = getByLabelText('Lemma')
  lemma.value = 'lemma'
  fireEvent.change(lemma)

  fireEvent.submit(container.querySelector('form'))
  await wait()

  expect(history.push).toBeCalledWith('?lemma=lemma')
})
