import React, { ReactNode } from 'react'
import { render, RenderResult } from '@testing-library/react'
import { MemoryRouter, Route, RouteComponentProps } from 'react-router-dom'
import SessionContext from 'auth/SessionContext'
import SignDisplay from 'signs/ui/display/SignDisplay'
import MemorySession from 'auth/Session'
import SignsService from 'signs/application/SignsService'
import Bluebird from 'bluebird'
import Sign, { Value } from 'signs/domain/Sign'

jest.mock('signs/application/SignsService')
const signsService = new (SignsService as jest.Mock<
  jest.Mocked<SignsService>
>)()
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
})

let element: RenderResult

function renderSignDisplay(signName: string): RenderResult {
  return render(
    <MemoryRouter initialEntries={[`/signs/${signName}`]}>
      <SessionContext.Provider value={session}>
        <Route
          path="/signs/:id"
          render={(props: RouteComponentProps<{ id: string }>): ReactNode => (
            <SignDisplay signsService={signsService} {...props} />
          )}
        />
      </SessionContext.Provider>
    </MemoryRouter>
  )
}

describe('Sign Display', () => {
  beforeEach(async () => {
    signsService.find.mockReturnValue(Bluebird.resolve(sign))
    element = renderSignDisplay(sign.name)
    await element.findByText(sign.name)
    expect(signsService.find).toBeCalledWith(sign.name)
  })
  it('Sign Display Snapshot', async () => {
    expect(element.container).toMatchSnapshot()
  })
})
