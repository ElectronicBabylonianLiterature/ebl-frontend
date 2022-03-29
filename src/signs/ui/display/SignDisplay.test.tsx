import React, { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, RouteComponentProps } from 'react-router-dom'
import SessionContext from 'auth/SessionContext'
import SignDisplay from 'signs/ui/display/SignDisplay'
import MemorySession from 'auth/Session'
import SignService from 'signs/application/SignService'
import Bluebird from 'bluebird'
import Sign, { Value } from 'signs/domain/Sign'
import WordService from 'dictionary/application/WordService'
import Word from 'dictionary/domain/Word'
import { CroppedAnnotation } from 'signs/domain/CroppedAnnotation'

jest.mock('signs/application/SignService')
jest.mock('dictionary/application/WordService')
const signService = new (SignService as jest.Mock<jest.Mocked<SignService>>)()
const wordService = new (WordService as jest.Mock<jest.Mocked<WordService>>)()
const session = new MemorySession(['read:words'])
const sign = new Sign({
  lists: [],
  logograms: [],
  name: 'BU',
  unicode: [74127],
  values: [new Value('gabu'), new Value('dul', 10), new Value('du', 1)],
  mesZl: `123	**ALSK13**	𒁇𒍴
Lorem ipsum dolor *sit* amet, consetetur <span style="color: #00610F;">*sadipscing*(*l*)*ubasd*</span>sadipscing elitr, sed diam *nonumy*
eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet c
lita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
^aba^𒁇𒊩 = BAR-MUNUS = *parratu*, weibliches Lamm. CAD <span style="color: #00610F;">P</span> 192b liest *parsallu*.
<span style="color: #00610F;">P</span>
^aba^𒁇𒋝
^asdg^𒋝
^ghas^𒁈
𒁖^asd^
𒍴^q12asd^
`,
  LaBaSi: '123',
})

const word: Word = {
  guideWord: '',
  arabicGuideWord: '',
  cdaAddenda: '',
  homonym: '',
  lemma: [],
  oraccWords: [],
  akkadischeGlossareUndIndices: [],
  pos: [],
  _id: '',
}

const croppedAnnotation: CroppedAnnotation = {
  image: 'test-base64-string',
  fragmentNumber: '',
  script: 'NA',
  label: "i stone wig 1'",
}

let container: HTMLElement

function renderSignDisplay(signName: string) {
  container = render(
    <MemoryRouter initialEntries={[`/signs/${signName}`]}>
      <SessionContext.Provider value={session}>
        <Route
          path="/signs/:id"
          render={(props: RouteComponentProps<{ id: string }>): ReactNode => (
            <SignDisplay
              wordService={wordService}
              signService={signService}
              {...props}
            />
          )}
        />
      </SessionContext.Provider>
    </MemoryRouter>
  ).container
}

describe('Sign Display', () => {
  beforeEach(async () => {
    signService.search.mockReturnValue(Bluebird.resolve([]))
    signService.getImages.mockReturnValue(Bluebird.resolve([croppedAnnotation]))
    signService.find.mockReturnValue(Bluebird.resolve(sign))
    wordService.find.mockReturnValue(Bluebird.resolve(word))
    renderSignDisplay(sign.name)
    await screen.findAllByText(sign.name)
    expect(signService.find).toBeCalledWith(sign.name)
  })
  it('Sign Display Snapshot', async () => {
    expect(container).toMatchSnapshot()
  })
})
