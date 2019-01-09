import { factory } from 'factory-girl'
import createFragment from './createFragment'
import createFolio from 'fragmentarium/createFolio'

it('Creates fragment with folios', async () => {
  const dto = await factory.build('fragmentDto')
  const expected = {
    ...dto,
    folios: dto.folios.map(({ name, number }) => createFolio(name, number))
  }

  expect(createFragment(dto)).toEqual(expected)
})
