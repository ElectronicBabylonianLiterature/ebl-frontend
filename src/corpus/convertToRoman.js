// Derived from https://stackoverflow.com/questions/9083037/convert-a-number-into-a-roman-numeral-in-javascript#37723879
import { List, Record } from 'immutable'

const RomanNumeral = Record({ value: 0, symbol: '' })

const romanNumerals = List.of(
  RomanNumeral({ value: 1000, symbol: 'M' }),
  RomanNumeral({ value: 900, symbol: 'CM' }),
  RomanNumeral({ value: 500, symbol: 'D' }),
  RomanNumeral({ value: 400, symbol: 'CD' }),
  RomanNumeral({ value: 100, symbol: 'C' }),
  RomanNumeral({ value: 90, symbol: 'XC' }),
  RomanNumeral({ value: 50, symbol: 'L' }),
  RomanNumeral({ value: 40, symbol: 'XL' }),
  RomanNumeral({ value: 10, symbol: 'X' }),
  RomanNumeral({ value: 9, symbol: 'IX' }),
  RomanNumeral({ value: 5, symbol: 'V' }),
  RomanNumeral({ value: 4, symbol: 'IV' }),
  RomanNumeral({ value: 1, symbol: 'I' })
)

export default function convertToRoman (number) {
  return romanNumerals
    .toSeq()
    .filter(roman => number >= roman.value)
    .map(roman => roman.symbol + convertToRoman(number - roman.value))
    .first('')
}
