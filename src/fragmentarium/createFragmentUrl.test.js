import Chance from 'chance'
import { createFragmentUrl } from './FragmentLink'

it('Creates double encoded URL', () => {
  // Double encoding is needed due to https://github.com/ReactTraining/history/issues/505
  const number = new Chance().string()
  expect(createFragmentUrl(number))
    .toEqual(`/fragmentarium/${encodeURIComponent(encodeURIComponent(number))}`)
})
