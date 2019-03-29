import toRomanSequence from './convertToRoman'

test.each([
  [0, ''],
  [1, 'I'],
  [2, 'II'],
  [3, 'III'],
  [4, 'IV'],
  [5, 'V'],
  [6, 'VI'],
  [7, 'VII'],
  [8, 'VIII'],
  [9, 'IX'],
  [10, 'X'],
  [39, 'XXXIX'],
  [50, 'L'],
  [100, 'C'],
  [160, 'CLX'],
  [200, 'CC'],
  [207, 'CCVII'],
  [246, 'CCXLVI'],
  [300, 'CCC'],
  [400, 'CD'],
  [500, 'D'],
  [600, 'DC'],
  [700, 'DCC'],
  [800, 'DCCC'],
  [900, 'CM'],
  [1000, 'M'],
  [1066, 'MLXVI'],
  [1776, 'MDCCLXXVI'],
  [2000, 'MM'],
  [3000, 'MMM']
])('%i is %s', (integer, expected) => {
  expect(toRomanSequence(integer)).toEqual(expected)
})
