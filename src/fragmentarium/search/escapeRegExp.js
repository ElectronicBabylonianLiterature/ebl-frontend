import _ from 'lodash'

export default function escapeRegExp (arr) {
  return arr.map(character => _.escapeRegExp(character)).join('|')
}
