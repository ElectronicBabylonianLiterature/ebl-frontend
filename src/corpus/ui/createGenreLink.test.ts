import createGenreLink from 'corpus/ui/createGenreLink'

test('create link', () => {
  expect(createGenreLink('genre')).toEqual('/corpus/genre')
})
