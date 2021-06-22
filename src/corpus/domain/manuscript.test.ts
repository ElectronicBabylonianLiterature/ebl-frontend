import { compareManuscriptTypes, ManuscriptTypes, types } from './manuscript'

test.each(Object.values(ManuscriptTypes))('%s is in types', (type) => {
  expect(types).toContain(type)
})

test.each(Object.values(ManuscriptTypes))(
  'compareManuscriptTypes same type %s',
  (type) => {
    expect(compareManuscriptTypes(type, type)).toEqual(0)
  }
)

test.each([
  [ManuscriptTypes.None, ManuscriptTypes.Library, 1],
  [ManuscriptTypes.None, ManuscriptTypes.School, 1],
  [ManuscriptTypes.None, ManuscriptTypes.Varia, 0],
  [ManuscriptTypes.None, ManuscriptTypes.Commentary, 0],
  [ManuscriptTypes.None, ManuscriptTypes.Quotation, 1],
  [ManuscriptTypes.None, ManuscriptTypes.Excerpt, 1],
  [ManuscriptTypes.None, ManuscriptTypes.Parallel, 1],
  [ManuscriptTypes.Library, ManuscriptTypes.School, -1],
  [ManuscriptTypes.Library, ManuscriptTypes.Varia, -1],
  [ManuscriptTypes.Library, ManuscriptTypes.Commentary, -1],
  [ManuscriptTypes.Library, ManuscriptTypes.Quotation, -1],
  [ManuscriptTypes.Library, ManuscriptTypes.Excerpt, -1],
  [ManuscriptTypes.Library, ManuscriptTypes.Parallel, -1],
  [ManuscriptTypes.School, ManuscriptTypes.Varia, -1],
  [ManuscriptTypes.School, ManuscriptTypes.Commentary, -1],
  [ManuscriptTypes.School, ManuscriptTypes.Quotation, -1],
  [ManuscriptTypes.School, ManuscriptTypes.Excerpt, -1],
  [ManuscriptTypes.School, ManuscriptTypes.Parallel, -1],
  [ManuscriptTypes.Varia, ManuscriptTypes.Commentary, 0],
  [ManuscriptTypes.Varia, ManuscriptTypes.Quotation, 1],
  [ManuscriptTypes.Varia, ManuscriptTypes.Excerpt, 1],
  [ManuscriptTypes.Varia, ManuscriptTypes.Parallel, 1],
  [ManuscriptTypes.Commentary, ManuscriptTypes.Quotation, 1],
  [ManuscriptTypes.Commentary, ManuscriptTypes.Excerpt, 1],
  [ManuscriptTypes.Commentary, ManuscriptTypes.Parallel, 1],
  [ManuscriptTypes.Quotation, ManuscriptTypes.Excerpt, 1],
  [ManuscriptTypes.Quotation, ManuscriptTypes.Parallel, -1],
  [ManuscriptTypes.Excerpt, ManuscriptTypes.Parallel, -1],
])('compareManuscriptTypes %s and %s', (first, second, expected) => {
  expect(compareManuscriptTypes(first, second)).toEqual(expected)
  expect(compareManuscriptTypes(second, first)).toEqual(
    expected === 0 ? expected : -expected
  )
})
