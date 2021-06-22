import { compareManuscriptTypes, ManuscriptType, types } from './manuscript'

test.each([...types.values()])(
  'compareManuscriptTypes same type %s',
  (type) => {
    expect(compareManuscriptTypes(type, type)).toEqual(0)
  }
)

test.each([
  [types.get('None'), types.get('Library'), 1],
  [types.get('None'), types.get('School'), 1],
  [types.get('None'), types.get('Varia'), 0],
  [types.get('None'), types.get('Commentary'), 0],
  [types.get('None'), types.get('Quotation'), 1],
  [types.get('None'), types.get('Excerpt'), 1],
  [types.get('None'), types.get('Parallel'), 1],
  [types.get('Library'), types.get('School'), -1],
  [types.get('Library'), types.get('Varia'), -1],
  [types.get('Library'), types.get('Commentary'), -1],
  [types.get('Library'), types.get('Quotation'), -1],
  [types.get('Library'), types.get('Excerpt'), -1],
  [types.get('Library'), types.get('Parallel'), -1],
  [types.get('School'), types.get('Varia'), -1],
  [types.get('School'), types.get('Commentary'), -1],
  [types.get('School'), types.get('Quotation'), -1],
  [types.get('School'), types.get('Excerpt'), -1],
  [types.get('School'), types.get('Parallel'), -1],
  [types.get('Varia'), types.get('Commentary'), 0],
  [types.get('Varia'), types.get('Quotation'), 1],
  [types.get('Varia'), types.get('Excerpt'), 1],
  [types.get('Varia'), types.get('Parallel'), 1],
  [types.get('Commentary'), types.get('Quotation'), 1],
  [types.get('Commentary'), types.get('Excerpt'), 1],
  [types.get('Commentary'), types.get('Parallel'), 1],
  [types.get('Quotation'), types.get('Excerpt'), 1],
  [types.get('Quotation'), types.get('Parallel'), -1],
  [types.get('Excerpt'), types.get('Parallel'), -1],
])('compareManuscriptTypes %s and %s', (first, second, expected) => {
  expect(
    compareManuscriptTypes(first as ManuscriptType, second as ManuscriptType)
  ).toEqual(expected)
  expect(
    compareManuscriptTypes(second as ManuscriptType, first as ManuscriptType)
  ).toEqual(expected === 0 ? expected : -expected)
})
