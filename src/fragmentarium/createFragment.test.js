import { factory } from 'factory-girl'
import createFragment from './createFragment'
import createFolio from 'fragmentarium/createFolio'

it('Creates fragmenet with transliteration and folios', async () => {
  const dto = await factory.build('fragmentDto')
  const expected = {
    ...dto,
    folios: dto.folios.map(({ name, number }) => createFolio(name, number)),
    transliteration: dto.text.lines
      .map(row => `${
        row.prefix
      }${
        row.type === 'TextLine' ? ' ' : ''
      }${
        row.content.map(token => token.value).join(' ')
      }`)
      .join('\n')
  }

  expect(createFragment(dto)).toEqual(expected)
})
