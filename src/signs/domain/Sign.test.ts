import Sign, { Value } from 'signs/domain/Sign'

const logograms = [
  {
    logogram: 'GID₂',
    atf: 'GID₂',
    wordId: ['arāku I'],
    schrammLogogramme: '*GID₂* some notes',
    unicode: '𒁍',
  },
]

const signDto = {
  lists: [],
  logograms: logograms,
  mesZl: '',
  fossey: [],
  LaBaSi: '',
  name: 'BU',
  unicode: [74127, 73805],
  values: [
    { value: 'gabu' },
    { value: 'dul', subIndex: 10 },
    { value: 'du', subIndex: 1 },
  ],
}
export const sign = new Sign({
  lists: [],
  logograms: logograms,
  fossey: [],
  mesZl: '',
  LaBaSi: '',
  name: 'BU',
  unicode: [74127, 73805],
  values: [new Value('gabu'), new Value('dul', 10), new Value('du', 1)],
})
describe('Sign', () => {
  test('from Json', () => {
    expect(Sign.fromDto(signDto)).toEqual(sign)
  })
  test('sort Values', () => {
    expect(sign.displayValuesMarkdown).toEqual('*du*, *dul*₁₀, *gabu*~x~')
  })
  test('cuneiform signs', () => {
    expect(sign.displayCuneiformSigns).toEqual('𒆏𒁍')
  })
  test('MesZL numbers', () => {
    const lists = [
      { name: 'MZL', number: '264' },
      { name: 'ABZ', number: '150' },
      { name: 'MZL', number: '516' },
    ]
    expect(new Sign({ ...sign, lists }).mesZlNumbers).toEqual(['264', '516'])
  })
})
