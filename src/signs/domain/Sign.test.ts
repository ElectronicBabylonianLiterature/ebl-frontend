import Sign, { Value } from 'signs/domain/Sign'

const signDto = {
  lists: [],
  logograms: [],
  mesZl: '',
  name: 'BU',
  unicode: [74127, 73805],
  values: [
    { value: 'gabu' },
    { value: 'dul', subIndex: 10 },
    { value: 'du', subIndex: 1 },
  ],
}
const sign = new Sign({
  lists: [],
  logograms: [],
  mesZl: '',
  name: 'BU',
  unicode: [74127, 73805],
  values: [new Value('gabu'), new Value('dul', 10), new Value('du', 1)],
})
describe('Sign', () => {
  test('from Json', () => {
    expect(Sign.fromJson(signDto)).toEqual(sign)
  })
  test('sort Values', () => {
    expect(sign.sortValues()).toEqual([
      { value: 'du', subIndex: 1 },
      { value: 'dul', subIndex: 10 },
      { value: 'gabu' },
    ])
  })
  test('cuneiform signs', () => {
    expect(sign.displayCuneiformSigns).toEqual('𒆏𒁍')
  })
})
