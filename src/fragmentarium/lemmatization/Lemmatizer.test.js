import React from 'react'
import { render, waitForElement } from 'react-testing-library'
import { Promise } from 'bluebird'
import { factory } from 'factory-girl'
import _ from 'lodash'

import { whenClicked, clickNth, changeValueByLabel } from 'testHelpers'
import Lemmatizer from './Lemmatizer'
import Lemmatization from './Lemmatization'

const number = 'K.1'
let element
let fragmentService
let text
let word

beforeEach(async () => {
  word = await factory.build('word')
  fragmentService = {
    updateLemmatization: jest.fn(),
    searchLemma: jest.fn()
  }
  fragmentService.searchLemma.mockReturnValue(Promise.resolve([word]))
  text = {
    lines: [
      {
        type: 'TextLine',
        prefix: number,
        content: [
          {
            type: 'Word',
            value: 'kur',
            uniqueLemma: ['aklu I'],
            language: 'AKKADIAN',
            normalized: false,
            lemmatizable: true
          }
        ]
      }
    ]
  }
  element = render(
    <Lemmatizer
      fragmentService={fragmentService}
      number='K.1'
      text={text}
    />)
})

it('Displays the line prefixes', () => {
  text.lines.forEach(row =>
    expect(element.container).toHaveTextContent(row.prefix)
  )
})

it('Displays the transliteration', () => {
  text.lines.forEach(row =>
    expect(element.container).toHaveTextContent(
      row.content.map(token => token.value).join(' ')
    )
  )
})

it('Clicking word shows form', async () => {
  clickNth(element, 'kur', 0)
  await waitForElement(() => element.getByLabelText('Lemma'))
})

it('Clicking save calls fragmentService', async () => {
  fragmentService.updateLemmatization.mockReturnValue(Promise.resolve())

  await lemmatizeWord()

  const expected = new Lemmatization(text).setLemma(0, 0, [word._id]).toDto()
  await whenClicked(element, 'Save').expect(fragmentService.updateLemmatization)
    .toHaveBeenCalledWith(number, expected)
})

it('Shows error if saving transliteration fails', async () => {
  const errorMessage = 'Lemmatization Error'
  fragmentService.updateLemmatization.mockReturnValueOnce(Promise.reject(new Error(errorMessage)))

  await lemmatizeWord()
  clickNth(element, 'Save', 0)
  await waitForElement(() => element.getByText(errorMessage))
})

it('Cancels submit on unmount', async () => {
  const promise = new Promise(_.noop)
  jest.spyOn(promise, 'cancel')
  fragmentService.updateLemmatization.mockReturnValueOnce(promise)
  await lemmatizeWord()
  clickNth(element, 'Save', 0)
  element.unmount()
  expect(promise.isCancelled()).toBe(true)
})

async function lemmatizeWord () {
  clickNth(element, 'kur', 0)
  await waitForElement(() => element.getByLabelText('Lemma'))
  changeValueByLabel(element, 'Lemma', 'a')
  await waitForElement(() => element.getByText(RegExp(word._id)))
  clickNth(element, RegExp(word._id), 0)
}
