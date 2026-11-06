import {
  initializeSearchFormState,
  isValidFindspotId,
} from 'fragmentarium/ui/SearchForm.state'

it.each([0, 7, '0', '007', '200', undefined])(
  'accepts exact numeric findspot constraint %s',
  (findspotId) => {
    expect(isValidFindspotId(findspotId)).toBe(true)
    expect(initializeSearchFormState({ findspotId }).isValid).toBe(true)
  },
)

it.each([
  '',
  '1.5',
  '-1',
  ' 7 ',
  '7x',
  '1e2',
  '9007199254740992',
  -1,
  Infinity,
  NaN,
])(
  'blocks malformed findspot %s while retaining the visible constraint',
  (findspotId) => {
    const state = initializeSearchFormState({ findspotId })
    expect(state.isValid).toBe(false)
    expect(state.findspotId).toBe(findspotId)
  },
)
