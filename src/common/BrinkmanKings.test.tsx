import BrinkmanKingsTable from 'common/BrinkmanKings'

test('Snapshot', () => {
  expect(BrinkmanKingsTable()).toMatchSnapshot()
})
