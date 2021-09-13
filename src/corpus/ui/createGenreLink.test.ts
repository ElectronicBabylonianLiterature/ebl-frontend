import createGenreLink from './createGenreLink'

test('create link', () => {
  expect(createGenreLink('genre')).toEqual('/corpus/genre')
})
