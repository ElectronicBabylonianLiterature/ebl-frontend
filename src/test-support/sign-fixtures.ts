import Sign, { Value } from 'signs/domain/Sign'
import { factory } from 'factory-girl'

factory.define('sign', Sign, {
  name: factory.chance('pickone', ['BA', 'BAD', 'BAR', 'EZEN×BAD', 'PI']),
  lists: factory.chance('pickone', [
    [{ name: 'MESZL', number: '1' }],
    [
      { name: 'HZL', number: '20' },
      { name: 'LAK', number: '752' },
    ],
  ]),
  values: factory.chance('pickone', [[new Value('war', 1)]]),
  unicode: factory.chance('pickone', [[73799], [74848, 73849]]),
  logograms: [
    {
      logogram: '<sup>giš</sup>BAR.KIN₂',
      atf: '{giš}BAR-KIN₂',
      wordId: ['sehpu I'],
      schrammLogogramme:
        '<sup>giš</sup>BAR-KIN₂; *seḫpu* (Bast, Rinde); ME 69 CD 320a',
    },
  ],
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
