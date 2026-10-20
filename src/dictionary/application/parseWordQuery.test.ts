import parseWordQuery from 'dictionary/application/parseWordQuery'

it.each([
  ['', {}],
  ['?word', {}],
  ['?word=&meaning&vowelClass=&origin', {}],
  ['?word=šarru&root=šrr', { word: 'šarru', root: 'šrr' }],
  ['?word=a&word=b', { word: 'a' }],
  ['?vowelClass=a%2Fu&origin=SAD', { vowelClass: ['a/u'], origin: ['SAD'] }],
  [
    '?origin=CDA&origin=&origin=SAD&vowelClass=a%2Fa&vowelClass=i%2Fi',
    { origin: ['CDA', 'SAD'], vowelClass: ['a/a', 'i/i'] },
  ],
  ['?meaning=king&unknown=1', { meaning: 'king' }],
])('parses %p', (search, expected) => {
  expect(parseWordQuery(search)).toEqual(expected)
})
