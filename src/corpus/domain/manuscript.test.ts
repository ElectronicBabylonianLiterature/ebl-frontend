import { manuscriptFactory } from 'test-support/manuscript-fixtures'
import { testContainsAllValues } from 'test-support/test-values-complete'
import {
  compareManuscripts,
  compareManuscriptTypes,
  ManuscriptTypes,
  types,
} from './manuscript'
import { Provenances } from './provenance'

testContainsAllValues(ManuscriptTypes, types, 'types')
test.each(Object.values(ManuscriptTypes))(
  'compareManuscriptTypes same type %s',
  (type) => {
    expect(compareManuscriptTypes(type, type)).toEqual(0)
  },
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
    expected === 0 ? expected : -expected,
  )
})

test.each([
  [
    manuscriptFactory.standardText().build(),
    manuscriptFactory.standardText().build(),
    0,
  ],
  [
    manuscriptFactory.standardText().build(),
    manuscriptFactory.assyria().build(),
    -1,
  ],
  [
    manuscriptFactory.standardText().build(),
    manuscriptFactory.babylonia().build(),
    -1,
  ],
  [
    manuscriptFactory.standardText().build(),
    manuscriptFactory.city().build(),
    -1,
  ],
  [
    manuscriptFactory.type(ManuscriptTypes.Library).build(),
    manuscriptFactory.type(ManuscriptTypes.School).build(),
    -1,
  ],
  [
    manuscriptFactory.type(ManuscriptTypes.School).build(),
    manuscriptFactory.type(ManuscriptTypes.Excerpt).build(),
    -1,
  ],
  [
    manuscriptFactory.type(ManuscriptTypes.School).build(),
    manuscriptFactory.type(ManuscriptTypes.Excerpt).build(),
    -1,
  ],
  [
    manuscriptFactory.type(ManuscriptTypes.Excerpt).build(),
    manuscriptFactory.type(ManuscriptTypes.Quotation).build(),
    -1,
  ],
  [
    manuscriptFactory.type(ManuscriptTypes.Quotation).build(),
    manuscriptFactory.type(ManuscriptTypes.Parallel).build(),
    -1,
  ],
  [
    manuscriptFactory.type(ManuscriptTypes.Parallel).build(),
    manuscriptFactory.type(ManuscriptTypes.Commentary).build(),
    -1,
  ],
  [
    manuscriptFactory.type(ManuscriptTypes.Parallel).build(),
    manuscriptFactory.type(ManuscriptTypes.Varia).build(),
    -1,
  ],
  [
    manuscriptFactory.assyria().type(ManuscriptTypes.Varia).build(),
    manuscriptFactory.assyria().type(ManuscriptTypes.Commentary).build(),
    0,
  ],
  [
    manuscriptFactory.assyria().type(ManuscriptTypes.Library).build(),
    manuscriptFactory.assyria().type(ManuscriptTypes.Library).build(),
    0,
  ],
  [
    manuscriptFactory.babylonia().type(ManuscriptTypes.Library).build(),
    manuscriptFactory.babylonia().type(ManuscriptTypes.Library).build(),
    0,
  ],
  [
    manuscriptFactory.assyria().type(ManuscriptTypes.Library).build(),
    manuscriptFactory.babylonia().type(ManuscriptTypes.Library).build(),
    -1,
  ],
  [
    manuscriptFactory.assyria().type(ManuscriptTypes.Library).build(),
    manuscriptFactory.city().type(ManuscriptTypes.Library).build(),
    -1,
  ],
  [
    manuscriptFactory.babylonia().type(ManuscriptTypes.Library).build(),
    manuscriptFactory.city().type(ManuscriptTypes.Library).build(),
    -1,
  ],
  [
    manuscriptFactory
      .type(ManuscriptTypes.Library)
      .provenance(Provenances.Babylon)
      .build(),
    manuscriptFactory
      .type(ManuscriptTypes.Library)
      .provenance(Provenances.Babylon)
      .build(),
    0,
  ],
  [
    manuscriptFactory
      .type(ManuscriptTypes.Library)
      .provenance(Provenances.Babylon)
      .build(),
    manuscriptFactory
      .type(ManuscriptTypes.Library)
      .provenance(Provenances.Emar)
      .build(),
    -1,
  ],
])('compareManuscripts %s and %s', (first, second, expected) => {
  expect(compareManuscripts(first, second)).toEqual(expected)
  expect(compareManuscripts(second, first)).toEqual(
    expected === 0 ? expected : -expected,
  )
})
