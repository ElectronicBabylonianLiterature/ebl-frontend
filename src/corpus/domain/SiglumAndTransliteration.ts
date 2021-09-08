import { Text } from 'transliteration/domain/text'

export default interface SiglumAndTransliteration {
  readonly siglum: string
  readonly text: Text
}
