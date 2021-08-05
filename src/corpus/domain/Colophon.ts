import { Text } from 'transliteration/domain/text'

export default interface Colophon {
  readonly siglum: string
  readonly text: Text
}
