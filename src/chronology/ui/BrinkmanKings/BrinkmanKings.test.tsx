import BrinkmanKingsTable from 'chronology/ui/BrinkmanKings/BrinkmanKings'

test('Snapshot', () => {
  expect(BrinkmanKingsTable()).toMatchSnapshot()
})
