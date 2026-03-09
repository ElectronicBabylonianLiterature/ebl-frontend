import React from 'react'
import { render, screen } from '@testing-library/react'

import Word from './Word'
import Lemma from 'transliteration/domain/Lemma'
import _ from 'lodash'
import { wordFactory } from 'test-support/word-fixtures'
import { LemmatizationToken } from 'transliteration/domain/Lemmatization'

let container: HTMLElement
let token: LemmatizationToken
let lemmas: Lemma[]

beforeEach(() => {
  lemmas = wordFactory.buildList(2).map((word) => new Lemma(word))
})

describe.each([
  [false, false, [], ['Word--with-lemma', 'Word--suggestion']],
  [true, false, ['Word--with-lemma'], ['Word--suggestion']],
  [true, true, ['Word--with-lemma', 'Word--suggestion'], []],
] as [boolean, boolean, string[], string[]][])(
  '%#',
  (hasLemma, suggested, expectedClasses, notExpectedClasses) => {
    const setup = (): void => {
      token = new LemmatizationToken(
        'DIŠ',
        true,
        hasLemma ? lemmas : [],
        [],
        suggested,
      )
      container = render(<Word token={token} />).container
    }

    it('Displays the value', () => {
      setup()
      expect(container).toHaveTextContent(token.value)
    })

    if (hasLemma) {
      it('Displays the lemma', () => {
        setup()
        expect(container).toHaveTextContent(
          lemmas.map((lemma) => `${lemma.lemma}${lemma.homonym}`).join(', '),
        )
      })
    }

    if (!_.isEmpty(expectedClasses)) {
      test.each(expectedClasses)('Has class %s', (expectedClass) => {
        setup()
        expect(screen.getByText(token.value)).toHaveClass(expectedClass)
      })
    }

    if (!_.isEmpty(notExpectedClasses)) {
      test.each(notExpectedClasses)(
        'Does not have class %s',
        (notExpectedClass) => {
          setup()
          expect(screen.getByText(token.value)).not.toHaveClass(
            notExpectedClass,
          )
        },
      )
    }
  },
)
