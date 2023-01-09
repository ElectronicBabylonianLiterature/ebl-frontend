import { JoinWithMuseumNumber } from './join-fixtures'

const basicJoinDto = {
  joinedBy: 'Mustermann',
  date: 'Monday 01/01/2000',
  note: 'Random note',
  legacyData: 'Tuesday test 01/01/2000',
}

const basicMuseumNumber = {
  prefix: 'X',
  suffix: '',
}

export const testJoinsDto: Array<Array<JoinWithMuseumNumber>> = [
  [
    {
      museumNumber: { number: '1', ...basicMuseumNumber },
      isChecked: false,
      isInFragmentarium: true,
      ...basicJoinDto,
    },
    {
      museumNumber: { number: '2', ...basicMuseumNumber },
      isChecked: false,
      isInFragmentarium: false,
      ...basicJoinDto,
    },
  ],
  [
    {
      museumNumber: { number: '3', ...basicMuseumNumber },
      isChecked: true,
      isInFragmentarium: true,
      ...basicJoinDto,
    },
    {
      museumNumber: { number: '4', ...basicMuseumNumber },
      isChecked: true,
      isInFragmentarium: false,
      ...basicJoinDto,
    },
  ],
]
