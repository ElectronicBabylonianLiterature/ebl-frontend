import {
  createFragmentAnnotationSpans,
  getWordIds,
} from 'fragmentarium/ui/text-annotation/fragmentSpans'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { atfTokenKur } from 'test-support/test-tokens'
import {
  annotatedFragment,
  annotatedText,
  createAnnotatedFragment,
  createAnnotatedWord,
  previewNamedEntities,
  previewRealia,
} from 'test-support/named-entity-fixtures'

describe('getWordIds', () => {
  it('lists the words of the text in reading order', () => {
    expect(getWordIds(annotatedText)).toEqual([
      'Word-1',
      'Word-2',
      'Word-3',
      '',
    ])
  })
})

describe('createFragmentAnnotationSpans', () => {
  it('rebuilds the named entity spans in reading order', () => {
    expect(
      createFragmentAnnotationSpans(annotatedFragment).namedEntities,
    ).toEqual([
      { id: 'Entity-1', type: 'PERSONAL_NAME', span: ['Word-2'] },
      { id: 'Entity-2', type: 'BUILDING_NAME', span: ['Word-2', 'Word-3'] },
    ])
  })

  it('rebuilds the realia spans in reading order', () => {
    expect(createFragmentAnnotationSpans(annotatedFragment).realia).toEqual([
      { id: 'Realia-1', realiaId: 'realia_000846', span: ['Word-3'] },
    ])
  })

  it('ignores annotations no word refers to', () => {
    const fragment = createAnnotatedFragment(
      [createAnnotatedWord('kur', 'Word-1')],
      previewNamedEntities,
      previewRealia,
    )

    expect(createFragmentAnnotationSpans(fragment)).toEqual({
      namedEntities: [],
      realia: [],
    })
  })

  it('does not resolve a realia id against the named entities', () => {
    const fragment = createAnnotatedFragment(
      [createAnnotatedWord('kur', 'Word-1', ['Realia-1'])],
      previewNamedEntities,
      previewRealia,
    )

    expect(createFragmentAnnotationSpans(fragment)).toEqual({
      namedEntities: [],
      realia: [],
    })
  })

  it('does not resolve a named entity id against the realia', () => {
    const fragment = createAnnotatedFragment(
      [createAnnotatedWord('kur', 'Word-1', [], ['Entity-1'])],
      previewNamedEntities,
      previewRealia,
    )

    expect(createFragmentAnnotationSpans(fragment)).toEqual({
      namedEntities: [],
      realia: [],
    })
  })

  it('returns no spans for a fragment without annotations', () => {
    expect(createFragmentAnnotationSpans(fragmentFactory.build())).toEqual({
      namedEntities: [],
      realia: [],
    })
  })

  it('returns no spans for words without annotation ids', () => {
    const fragment = createAnnotatedFragment(
      [{ ...atfTokenKur, id: 'Word-1' }],
      previewNamedEntities,
      previewRealia,
    )

    expect(createFragmentAnnotationSpans(fragment)).toEqual({
      namedEntities: [],
      realia: [],
    })
  })
})
