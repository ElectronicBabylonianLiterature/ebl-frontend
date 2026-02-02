import { Factory } from 'fishery'
import Chance from 'chance'
import AfoRegisterRecord, {
  AfoRegisterRecordSuggestion,
} from 'afo-register/domain/Record'

const chance = new Chance()
const PUBLICATIONS = [
  'StOr',
  'Al.T.',
  'OECT',
  'VS',
  'STT',
  'CCT',
  'CM',
  'CST',
  'SAAB',
]

const getRandomPublication = (): string => chance.pickone(PUBLICATIONS)

const getAfoNumber = (): string => `AfO ${chance.integer({ min: 10, max: 52 })}`

const getPage = (): string => `${chance.integer({ min: 1, max: 700 })}`

const getText = (): string =>
  `${getRandomPublication()}, ${chance.integer({ min: 1, max: 40 })}`

const getTextNumber = (): string =>
  `Nr. ${chance.integer({ min: 1, max: 300 })}`

const getTextNumbers = (): string[] =>
  Array.from({ length: chance.integer({ min: 1, max: 15 }) }, getTextNumber)

const getLinesDiscussed = (): string =>
  `${chance.integer({ min: 1, max: 40 })}f.`

const getDiscussedBy = (): string =>
  `${chance.last()}, ${getRandomPublication()}, ${chance.integer({
    min: 1,
    max: 40,
  })}, ${chance.integer({ min: 1, max: 50 })}`

const getFragmentNumber = (): string[] =>
  Array.from(
    { length: chance.integer({ min: 0, max: 5 }) },
    () => `${chance.word()}.${chance.natural()}`,
  )

export const afoRegisterRecordFactory = Factory.define<AfoRegisterRecord>(
  () =>
    new AfoRegisterRecord({
      afoNumber: getAfoNumber(),
      page: getPage(),
      text: getText(),
      textNumber: getTextNumber(),
      linesDiscussed: getLinesDiscussed(),
      discussedBy: getDiscussedBy(),
      discussedByNotes: chance.sentence(),
      fragmentNumbers: getFragmentNumber(),
    }),
)

export const afoRegisterRecordSuggestionFactory =
  Factory.define<AfoRegisterRecordSuggestion>(
    () =>
      new AfoRegisterRecordSuggestion({
        text: getText(),
        textNumbers: getTextNumbers().sort(),
      }),
  )
