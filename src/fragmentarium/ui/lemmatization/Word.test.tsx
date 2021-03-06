import React from 'react'
import { render } from '@testing-library/react'
import { factory } from 'factory-girl'
import Word from './Word'
import Lemma from 'transliteration/domain/Lemma'
import _ from 'lodash'

let element
let token
let lemmas

beforeEach(async () => {
  lemmas = (await factory.buildMany('word', 2)).map((word) => new Lemma(word))
})

describe.each([
  [false, false, [], ['Word--with-lemma', 'Word--suggestion']],
  [true, false, ['Word--with-lemma'], ['Word--suggestion']],
  [true, true, ['Word--with-lemma', 'Word--suggestion'], []],
] as [boolean, boolean, string[], string[]][])(
  '%#',
  (hasLemma, suggested, expectedClasses, notExpectedClasses) => {
    beforeEach(async () => {
      token = {
        type: 'Word',
        value: 'DIŠ',
        uniqueLemma: hasLemma ? lemmas : [],
        language: 'AKKADIAN',
        normalized: false,
        lemmatizable: true,
        alignable: true,
        suggested: suggested,
      }
      element = render(<Word token={token} />)
    })

    it('Displays the value', () => {
      expect(element.container).toHaveTextContent(token.value)
    })

    if (hasLemma) {
      it('Displays the lemma', () => {
        expect(element.container).toHaveTextContent(
          lemmas.map((lemma) => `${lemma.lemma}${lemma.homonym}`).join(', ')
        )
      })
    }

    if (!_.isEmpty(expectedClasses)) {
      test.each(expectedClasses)('Has class %s', (expectedClass) => {
        expect(element.getByText(token.value)).toHaveClass(expectedClass)
      })
    }

    if (!_.isEmpty(notExpectedClasses)) {
      test.each(notExpectedClasses)(
        'Does not have class %s',
        (notExpectedClass) => {
          expect(element.getByText(token.value)).not.toHaveClass(
            notExpectedClass
          )
        }
      )
    }
  }
)
