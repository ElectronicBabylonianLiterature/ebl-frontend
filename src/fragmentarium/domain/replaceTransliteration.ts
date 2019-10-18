import replaceSpecialCharacters from './replaceSpecialCharacters'
import normalizeNumbers from './normalizeNumbers'
import normalizeAccents from './normalizeAccents'
import _ from 'lodash'

export default function replaceTransliteration(transliteration) {
  return _(transliteration)
    .thru(replaceSpecialCharacters)
    .thru(normalizeNumbers)
    .thru(normalizeAccents)
    .value()
}
