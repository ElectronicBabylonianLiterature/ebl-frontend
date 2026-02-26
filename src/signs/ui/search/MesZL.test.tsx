import React from 'react'
import { render, screen } from '@testing-library/react'
import MesZL from 'signs/ui/search/MesZL'
import MesZlContent from 'signs/ui/search/MesZLContent'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

const mesZl = `123	**ALSK13**	𒁇𒍴
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
`

const mesZlRecords = [{ name: 'MesZL', number: '131' }]

describe('MesZl', () => {
  it('MesZl Button', async () => {
    render(
      <MemoryRouter>
        <MesZL mesZl={mesZl} mesZlRecords={mesZlRecords} signName={'ALSK13'} />
      </MemoryRouter>,
    )
    await screen.findByText('MesZL 131')
    await userEvent.click(screen.getByRole('button'))
    await screen.findByText(
      'Mesopotamisches Zeichenlexikon. Zweite, revidierte und aktualisierte Auflage',
    )
  })
  it('MesZl Content', async () => {
    const { container } = render(
      <MemoryRouter>
        <MesZlContent mesZl={mesZl} signName={'ALSK13'} cutOff={7} />
      </MemoryRouter>,
    )
    await screen.findByText(
      'Mesopotamisches Zeichenlexikon. Zweite, revidierte und aktualisierte Auflage',
    )
    expect(container).toMatchSnapshot()
  })
})
