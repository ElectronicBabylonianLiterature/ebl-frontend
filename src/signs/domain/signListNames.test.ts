import { getDisplayName } from 'signs/domain/signListNames'

test.each([
  ['MZL', 'MesZL'],
  ['OBZL', 'aBZL'],
  ['SLLHA', 'ŠL/MÉA'],
  ['ABZ', 'ABZ'],
])('getDisplayName(%s)', (name, expected) => {
  expect(getDisplayName(name)).toEqual(expected)
})
