import { factory } from 'factory-girl'
import Lemma from './Lemma'

let word
let lemma

beforeEach(async () => {
  word = await factory.build('word', {
    '_id': 'waklu waklu I',
    'lemma': ['waklu', 'waklu'],
    'homonym': 'I',
    'meaning': 'a very very long complicated meaning of a word'
  })
  lemma = new Lemma(word)
})

test('value', () => {
  expect(lemma.value).toEqual(word._id)
})

test('lemma', () => {
  expect(lemma.lemma).toEqual(word.lemma.join(' '))
})

test('homonym', () => {
  expect(lemma.homonym).toEqual(word.homonym)
})

test('label', () => {
  expect(lemma.label).toEqual(`${word._id}, a very very long complicated…`)
})
