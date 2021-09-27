import GenreCrumb from './GenreCrumb'

const genre = 'L'
const crumb = new GenreCrumb(genre)

test('text', () => {
  expect(crumb.text).toEqual(genre)
})

test('link', () => {
  expect(crumb.link).toEqual(`/corpus/${genre}`)
})
