import BrinkmanKingsTable from 'chronology/ui/BrinkmanKings'

test('Snapshot', () => {
  expect(BrinkmanKingsTable()).toMatchSnapshot()
})
