import { Token, Enclosure } from 'fragmentarium/domain/text'

export default function isEnclosure(token: Token): token is Enclosure {
  return [
    'BrokenAway',
    'PerhapsBrokenAway',
    'AccidentalOmmission',
    'IntentionalOmission',
    'Removal',
    'Erasure'
  ].includes(token.type)
}
