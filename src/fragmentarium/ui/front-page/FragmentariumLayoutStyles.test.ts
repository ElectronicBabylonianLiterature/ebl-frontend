import { readFileSync } from 'fs'
import { join } from 'path'

const searchFormStyles = readFileSync(
  join(__dirname, '..', 'SearchForm.sass'),
  'utf8',
)
const fragmentariumStyles = readFileSync(
  join(__dirname, 'Fragmentarium.css'),
  'utf8',
)

it('allows the selected Literature value to shrink within the search form', () => {
  expect(searchFormStyles).toMatch(
    /\.search-form-select__value-container\n\s+min-width: 0/,
  )
  expect(searchFormStyles).toMatch(
    /\.search-form-select__single-value\n\s+max-width: 100%\n\s+min-width: 0/,
  )
  expect(searchFormStyles).toMatch(
    /\.search-form-select__single-value-label\n\s+display: block\n\s+overflow: hidden\n\s+text-overflow: ellipsis\n\s+white-space: nowrap/,
  )
})

it('allows both Library columns to shrink within their row', () => {
  expect(fragmentariumStyles).toMatch(
    /\.Fragmentarium__search-column,\n\.Fragmentarium__image-column \{\n {2}min-width: 0;/,
  )
})
