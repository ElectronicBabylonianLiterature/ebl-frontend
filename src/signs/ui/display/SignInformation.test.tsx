import React from 'react'
import { render, RenderResult, screen } from '@testing-library/react'
import Bluebird from 'bluebird'
import Sign, { Value } from 'signs/domain/Sign'
import WordService from 'dictionary/application/WordService'
import Word from 'dictionary/domain/Word'
import SignInformation from 'signs/ui/display/SignInformation'
import { MemoryRouter } from 'react-router'
import _ from 'lodash'
import SignService from 'signs/application/SignService'

jest.mock('signs/application/SignService')
jest.mock('dictionary/application/WordService')

const signService = new (SignService as jest.Mock<jest.Mocked<SignService>>)()
const wordService = new (WordService as jest.Mock<jest.Mocked<WordService>>)()
const sign = new Sign({
  lists: [
    { name: 'LAK', number: '813' },
    { name: 'KWU', number: '532' },
  ],
  logograms: [
    {
      logogram: '<sup>giš</sup>NUNUZ',
      atf: '{giš}NUNUZ',
      wordId: ['erimmatu I'],
      schrammLogogramme:
        '<sup>giš</sup>NUNUZ; *erimmatu* ((ovale) Holzperle); CD 78a CAD E 294b ZL 386',
    },
    {
      logogram: 'NUNUZ',
      atf: 'NUNUZ',
      wordId: ['līpu I'],
      schrammLogogramme: 'NUNUZ; *līpu* (Nachkomme); ME 181 CD 183a ZL 386',
    },
  ],
  name: 'NUNUZ',
  unicode: [74127],
  values: [new Value('gabu'), new Value('dul', 10), new Value('du', 1)],
  mesZl: '',
})

const wordErimmatu: Word = {
  _id: 'erimmatu I',
  lemma: ['erimmatu'],
  attested: true,
  homonym: 'I',
  logograms: [],
  guideWord: '(egg-shaped) bead',
  pos: [],
  oraccWords: [],
}
const wordLipu: Word = {
  _id: 'līpu I',
  lemma: ['līpu'],
  attested: true,
  homonym: 'I',
  logograms: [],
  guideWord: 'descendent',
  pos: [],
  oraccWords: [],
}

function renderSignInformation(): RenderResult {
  return render(
    <MemoryRouter>
      <SignInformation
        sign={sign}
        wordService={wordService}
        signService={signService}
      />
    </MemoryRouter>
  )
}

describe('Sign Information', () => {
  beforeEach(async () => {
    signService.search.mockReturnValueOnce(Bluebird.resolve([]))
    wordService.find
      .mockReturnValueOnce(Bluebird.resolve(wordErimmatu))
      .mockReturnValueOnce(Bluebird.resolve(wordLipu))
    renderSignInformation()
    await screen.findByText('Words (as logogram):')

    expect(wordService.find).toBeCalledWith(wordErimmatu._id)
    expect(wordService.find).toBeCalledWith(wordLipu._id)
  })
  it('Sign Information Words (as logograms)', async () => {
    sign.lists.map((list) => {
      expect(screen.getByText(list.name)).toBeInTheDocument()
      expect(screen.getByText(new RegExp(list.number))).toBeInTheDocument()
    })
    sign.values.map((value) => {
      expect(screen.getByText(value.value)).toBeInTheDocument()
    })
    expectWordPropertiesToBeInTheDocument(wordErimmatu)
    expectWordPropertiesToBeInTheDocument(wordLipu)

    expect(screen.getAllByRole('link')[0]).toHaveAttribute(
      'href',
      `/dictionary/${wordErimmatu._id}`
    )
    expect(screen.getAllByRole('link')[1]).toHaveAttribute(
      'href',
      `/dictionary/${wordLipu._id}`
    )
  })
})

function expectWordPropertiesToBeInTheDocument(word: Word): void {
  const escapedString2Regex = (string: string) =>
    new RegExp(_.escapeRegExp(string))
  const lemma = escapedString2Regex(word.lemma[0])
  expect(screen.getByText(lemma)).toBeInTheDocument()
  expect(
    screen.getByText(escapedString2Regex(word.guideWord))
  ).toBeInTheDocument()
}
