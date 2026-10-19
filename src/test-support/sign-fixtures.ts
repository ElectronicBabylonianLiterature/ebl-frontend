import Sign, { OrderedSign, Value } from 'signs/domain/Sign'
import Chance from 'chance'
import { Factory } from 'fishery'

const chance = new Chance('sign-fixtures')

const mesZL = `123	**ALSK13**	𒁇𒍴
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
const LaBaSi = `123`

export const OrderedSignFactory = Factory.define<[OrderedSign[]]>(() => {
  return [
    [
      {
        name: chance.pickone(['BA', 'BAD', 'BAR', 'PI']),
        unicode: [chance.integer({ min: 10000, max: 99999 })],
        mzl: chance.pickone(['131', '156', '131', '161']),
      },
    ],
  ]
})

export const signFactory = Factory.define<Sign>(() => {
  return new Sign({
    name: chance.pickone(['BA', 'BAD', 'BAR', 'PI']),
    lists: chance.pickone([
      [{ name: 'MESZL', number: '1' }],
      [
        { name: 'HZL', number: '20' },
        { name: 'LAK', number: '752' },
      ],
    ]),
    values: [new Value('war', 1)],
    unicode: chance.pickone([[73799], [74848, 73849]]),
    logograms: [
      {
        logogram: '<sup>giš</sup>BAR.KIN₂',
        atf: '{giš}BAR-KIN₂',
        wordId: ['sehpu I'],
        schrammLogogramme:
          '<sup>giš</sup>BAR-KIN₂; *seḫpu* (Bast, Rinde); ME 69 CD 320a',
        unicode: '',
      },
    ],
    fossey: [
      {
        page: 405,
        number: 25728,
        reference: 'Mai: MDP, VI, 11.I, 11',
        newEdition: 'Paulus AOAT 50, 981',
        secondaryLiterature: 'NABU 1997/1',
        cdliNumber: 'P123456',
        museumNumber: null,
        externalProject: 'dcclt',
        notes: 'Das Zeichen ist eigentlich ZA₇',
        date: 'Marduk-apla-iddina I, 1171-1159 BC',
        transliteration: 'me-luḫ-ḫa',
        sign: '<svg xmlns="http://www.w3.org/2000/svg" width="204" height="150">M15,21.7c-0.1-0.1-0.2-0.4-0.2-0.8c-0.1-1-0.1-1.2-0.5-1.3c-0.2</svg>',
      },
    ],
    mesZl: mesZL,
    LaBaSi: LaBaSi,
  })
})
