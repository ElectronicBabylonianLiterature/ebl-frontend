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
  [ManuscriptTypes.None, ManuscriptTypes.Amulet, 1],
  [ManuscriptTypes.None, ManuscriptTypes.Excerpt, 1],
  [ManuscriptTypes.None, ManuscriptTypes.Quotation, 1],
  [ManuscriptTypes.None, ManuscriptTypes.Parallel, 1],
  [ManuscriptTypes.None, ManuscriptTypes.MultiColumnTablet, 1],
  [ManuscriptTypes.None, ManuscriptTypes.CollectiveTablet, 1],
  [ManuscriptTypes.None, ManuscriptTypes.StudentTeacherTablet, 1],
  [ManuscriptTypes.None, ManuscriptTypes.SchoolLentil, 1],
  [ManuscriptTypes.None, ManuscriptTypes.Prism, 1],
  [ManuscriptTypes.None, ManuscriptTypes.Uncertain, 0],
  [ManuscriptTypes.None, ManuscriptTypes.Varia, 0],
  [ManuscriptTypes.None, ManuscriptTypes.Commentary, 0],
  [ManuscriptTypes.Library, ManuscriptTypes.School, -1],
  [ManuscriptTypes.Library, ManuscriptTypes.Amulet, -1],
  [ManuscriptTypes.Library, ManuscriptTypes.Excerpt, -1],
  [ManuscriptTypes.Library, ManuscriptTypes.Quotation, -1],
  [ManuscriptTypes.Library, ManuscriptTypes.Parallel, -1],
  [ManuscriptTypes.Library, ManuscriptTypes.MultiColumnTablet, -1],
  [ManuscriptTypes.Library, ManuscriptTypes.CollectiveTablet, -1],
  [ManuscriptTypes.Library, ManuscriptTypes.StudentTeacherTablet, -1],
  [ManuscriptTypes.Library, ManuscriptTypes.SchoolLentil, -1],
  [ManuscriptTypes.Library, ManuscriptTypes.Prism, -1],
  [ManuscriptTypes.Library, ManuscriptTypes.Uncertain, -1],
  [ManuscriptTypes.Library, ManuscriptTypes.Varia, -1],
  [ManuscriptTypes.Library, ManuscriptTypes.Commentary, -1],
  [ManuscriptTypes.School, ManuscriptTypes.Amulet, -1],
  [ManuscriptTypes.School, ManuscriptTypes.Excerpt, -1],
  [ManuscriptTypes.School, ManuscriptTypes.Quotation, -1],
  [ManuscriptTypes.School, ManuscriptTypes.Parallel, -1],
  [ManuscriptTypes.School, ManuscriptTypes.MultiColumnTablet, -1],
  [ManuscriptTypes.School, ManuscriptTypes.CollectiveTablet, -1],
  [ManuscriptTypes.School, ManuscriptTypes.StudentTeacherTablet, -1],
  [ManuscriptTypes.School, ManuscriptTypes.SchoolLentil, -1],
  [ManuscriptTypes.School, ManuscriptTypes.Prism, -1],
  [ManuscriptTypes.School, ManuscriptTypes.Uncertain, -1],
  [ManuscriptTypes.School, ManuscriptTypes.Varia, -1],
  [ManuscriptTypes.School, ManuscriptTypes.Commentary, -1],
  [ManuscriptTypes.Amulet, ManuscriptTypes.Excerpt, -1],
  [ManuscriptTypes.Amulet, ManuscriptTypes.Quotation, -1],
  [ManuscriptTypes.Amulet, ManuscriptTypes.Parallel, -1],
  [ManuscriptTypes.Amulet, ManuscriptTypes.MultiColumnTablet, -1],
  [ManuscriptTypes.Amulet, ManuscriptTypes.CollectiveTablet, -1],
  [ManuscriptTypes.Amulet, ManuscriptTypes.StudentTeacherTablet, -1],
  [ManuscriptTypes.Amulet, ManuscriptTypes.SchoolLentil, -1],
  [ManuscriptTypes.Amulet, ManuscriptTypes.Prism, -1],
  [ManuscriptTypes.Amulet, ManuscriptTypes.Uncertain, -1],
  [ManuscriptTypes.Amulet, ManuscriptTypes.Varia, -1],
  [ManuscriptTypes.Amulet, ManuscriptTypes.Commentary, -1],
  [ManuscriptTypes.Excerpt, ManuscriptTypes.Quotation, -1],
  [ManuscriptTypes.Excerpt, ManuscriptTypes.Parallel, -1],
  [ManuscriptTypes.Excerpt, ManuscriptTypes.MultiColumnTablet, -1],
  [ManuscriptTypes.Excerpt, ManuscriptTypes.CollectiveTablet, -1],
  [ManuscriptTypes.Excerpt, ManuscriptTypes.StudentTeacherTablet, -1],
  [ManuscriptTypes.Excerpt, ManuscriptTypes.SchoolLentil, -1],
  [ManuscriptTypes.Excerpt, ManuscriptTypes.Prism, -1],
  [ManuscriptTypes.Excerpt, ManuscriptTypes.Uncertain, -1],
  [ManuscriptTypes.Excerpt, ManuscriptTypes.Varia, -1],
  [ManuscriptTypes.Excerpt, ManuscriptTypes.Commentary, -1],
  [ManuscriptTypes.Quotation, ManuscriptTypes.Parallel, -1],
  [ManuscriptTypes.Quotation, ManuscriptTypes.MultiColumnTablet, -1],
  [ManuscriptTypes.Quotation, ManuscriptTypes.CollectiveTablet, -1],
  [ManuscriptTypes.Quotation, ManuscriptTypes.StudentTeacherTablet, -1],
  [ManuscriptTypes.Quotation, ManuscriptTypes.SchoolLentil, -1],
  [ManuscriptTypes.Quotation, ManuscriptTypes.Prism, -1],
  [ManuscriptTypes.Quotation, ManuscriptTypes.Uncertain, -1],
  [ManuscriptTypes.Quotation, ManuscriptTypes.Varia, -1],
  [ManuscriptTypes.Quotation, ManuscriptTypes.Commentary, -1],
  [ManuscriptTypes.Parallel, ManuscriptTypes.MultiColumnTablet, -1],
  [ManuscriptTypes.Parallel, ManuscriptTypes.CollectiveTablet, -1],
  [ManuscriptTypes.Parallel, ManuscriptTypes.StudentTeacherTablet, -1],
  [ManuscriptTypes.Parallel, ManuscriptTypes.SchoolLentil, -1],
  [ManuscriptTypes.Parallel, ManuscriptTypes.Prism, -1],
  [ManuscriptTypes.Parallel, ManuscriptTypes.Uncertain, -1],
  [ManuscriptTypes.Parallel, ManuscriptTypes.Varia, -1],
  [ManuscriptTypes.Parallel, ManuscriptTypes.Commentary, -1],
  [ManuscriptTypes.MultiColumnTablet, ManuscriptTypes.CollectiveTablet, -1],
  [ManuscriptTypes.MultiColumnTablet, ManuscriptTypes.StudentTeacherTablet, -1],
  [ManuscriptTypes.MultiColumnTablet, ManuscriptTypes.SchoolLentil, -1],
  [ManuscriptTypes.MultiColumnTablet, ManuscriptTypes.Prism, -1],
  [ManuscriptTypes.MultiColumnTablet, ManuscriptTypes.Uncertain, -1],
  [ManuscriptTypes.MultiColumnTablet, ManuscriptTypes.Varia, -1],
  [ManuscriptTypes.MultiColumnTablet, ManuscriptTypes.Commentary, -1],
  [ManuscriptTypes.CollectiveTablet, ManuscriptTypes.StudentTeacherTablet, -1],
  [ManuscriptTypes.CollectiveTablet, ManuscriptTypes.SchoolLentil, -1],
  [ManuscriptTypes.CollectiveTablet, ManuscriptTypes.Prism, -1],
  [ManuscriptTypes.CollectiveTablet, ManuscriptTypes.Uncertain, -1],
  [ManuscriptTypes.CollectiveTablet, ManuscriptTypes.Varia, -1],
  [ManuscriptTypes.CollectiveTablet, ManuscriptTypes.Commentary, -1],
  [ManuscriptTypes.StudentTeacherTablet, ManuscriptTypes.SchoolLentil, -1],
  [ManuscriptTypes.StudentTeacherTablet, ManuscriptTypes.Prism, -1],
  [ManuscriptTypes.StudentTeacherTablet, ManuscriptTypes.Uncertain, -1],
  [ManuscriptTypes.StudentTeacherTablet, ManuscriptTypes.Varia, -1],
  [ManuscriptTypes.StudentTeacherTablet, ManuscriptTypes.Commentary, -1],
  [ManuscriptTypes.SchoolLentil, ManuscriptTypes.Prism, -1],
  [ManuscriptTypes.SchoolLentil, ManuscriptTypes.Uncertain, -1],
  [ManuscriptTypes.SchoolLentil, ManuscriptTypes.Varia, -1],
  [ManuscriptTypes.SchoolLentil, ManuscriptTypes.Commentary, -1],
  [ManuscriptTypes.Prism, ManuscriptTypes.Uncertain, -1],
  [ManuscriptTypes.Prism, ManuscriptTypes.Varia, -1],
  [ManuscriptTypes.Prism, ManuscriptTypes.Commentary, -1],
  [ManuscriptTypes.Uncertain, ManuscriptTypes.Varia, 0],
  [ManuscriptTypes.Uncertain, ManuscriptTypes.Commentary, 0],
  [ManuscriptTypes.Varia, ManuscriptTypes.Commentary, 0],
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
    manuscriptFactory.type(ManuscriptTypes.Amulet).build(),
    -1,
  ],
  [
    manuscriptFactory.type(ManuscriptTypes.Amulet).build(),
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
