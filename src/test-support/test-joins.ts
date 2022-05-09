import { Join } from 'fragmentarium/domain/join'

type JoinWithMuseumNumber =
  | Omit<Join, 'museumNumber'>
  | { museumNumber: { prefix: string; number: string; suffix: string } }

const basicJoinDto = {
  joinedBy: 'Mustermann',
  date: 'Monday 01/01/2000',
  note: 'Random note',
  legacyData: 'Tuesday test 01/01/2000',
}

export const testJoinsDto: Array<Array<JoinWithMuseumNumber>> = [
  [
    {
      museumNumber: { prefix: 'X', number: '1', suffix: '' },
      isChecked: false,
      isInFragmentarium: true,
      ...basicJoinDto,
    },
    {
      museumNumber: { prefix: 'X', number: '2', suffix: '' },
      isChecked: false,
      isInFragmentarium: false,
      ...basicJoinDto,
    },
  ],
  [
    {
      museumNumber: { prefix: 'X', number: '3', suffix: '' },
      isChecked: true,
      isInFragmentarium: true,
      ...basicJoinDto,
    },
    {
      museumNumber: { prefix: 'X', number: '4', suffix: '' },
      isChecked: true,
      isInFragmentarium: false,
      ...basicJoinDto,
    },
  ],
]
