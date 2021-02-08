import _ from 'lodash'

export default function escapeRegExp(arr: string[]): string {
  return arr.map((character) => _.escapeRegExp(character)).join('|')
}
