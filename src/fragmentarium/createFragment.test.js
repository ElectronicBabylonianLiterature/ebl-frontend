import { factory } from 'factory-girl'
import createFragment from './createFragment'
import createFolio from 'fragmentarium/createFolio'

it('Creates fragmenet with transliteration and folios', async () => {
  const dto = await factory.build('fragmentDto')
  const expected = {
    ...dto,
    folios: dto.folios.map(({ name, number }) => createFolio(name, number)),
    transliteration: dto.lemmatization.map(row => row.map(token => token.value).join(' ')).join('\n')
  }

  expect(createFragment(dto)).toEqual(expected)
})
