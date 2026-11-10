import {
  getHeadCuneiform,
  getKeyRenderingSpellings,
  getPartialPieces,
  getSpellingCuneiform,
} from 'sumerian-dictionary/domain/sumerianRendering'
import { renderingFactory } from 'test-support/sumerian-dictionary-fixtures'

describe('getPartialPieces', () => {
  it('puts each unrendered token back where its mark stood', () => {
    const rendering = renderingFactory.build({
      cuneiform: ['𒀊𒋛?'],
      complete: false,
      unrendered: [{ token: 'N', reason: 'noCharacter' }],
    })
    expect(getPartialPieces(rendering)).toEqual([
      { kind: 'sign', value: '𒀊𒋛' },
      { kind: 'missing', value: 'n' },
    ])
  })

  it('keeps a longer token without a character as written', () => {
    const rendering = renderingFactory.build({
      cuneiform: ['X𒀊'],
      complete: false,
      unrendered: [{ token: 'gap', reason: 'gap' }],
    })
    expect(getPartialPieces(rendering)).toEqual([
      { kind: 'missing', value: 'gap' },
      { kind: 'sign', value: '𒀊' },
    ])
  })

  it('appends the tokens after the signs when marks and tokens disagree', () => {
    const rendering = renderingFactory.build({
      cuneiform: ['𒀊??'],
      complete: false,
      unrendered: [{ token: 'ŋa₂', reason: 'unresolved' }],
    })
    expect(getPartialPieces(rendering)).toEqual([
      { kind: 'sign', value: '𒀊' },
      { kind: 'missing', value: 'ŋa₂' },
    ])
  })

  it('shows only the signs when no token is named', () => {
    const rendering = renderingFactory.build({
      cuneiform: ['𒀊?'],
      complete: false,
      unrendered: [],
    })
    expect(getPartialPieces(rendering)).toEqual([{ kind: 'sign', value: '𒀊' }])
  })

  it.each([[[]], [['??']]])(
    'returns null without any sign (%j)',
    (cuneiform) => {
      const rendering = renderingFactory.build({ cuneiform, complete: false })
      expect(getPartialPieces(rendering)).toBeNull()
    },
  )
})

describe('getSpellingCuneiform', () => {
  it('joins the first sign sequence of each distinct complete rendering', () => {
    const renderings = [
      renderingFactory.build({ spelling: 'lu-ga-al', cuneiform: ['𒇻𒂵𒀠'] }),
      renderingFactory.build({
        spelling: 'lu₂-ga-al',
        printed: 'lu-ga-al',
        cuneiform: ['𒇽𒂵𒀠', '𒇽𒂵𒀠𒀠'],
        knownWrongCharacters: ['𒀠'],
      }),
      renderingFactory.build({ spelling: 'lu-ga-al', cuneiform: ['𒇻𒂵𒀠'] }),
      renderingFactory.build({ spelling: 'lu-ga-al', source: 'epsd2' }),
    ]
    expect(getSpellingCuneiform(renderings, 'attinger', ' lu-ga-al ')).toEqual({
      complete: '𒇻𒂵𒀠 / 𒇽𒂵𒀠',
      partial: [],
      knownWrongCharacters: ['𒀠'],
    })
  })

  it('falls back to the first incomplete rendering that shows a sign', () => {
    const renderings = [
      renderingFactory.build({
        spelling: 'ab-si-n',
        complete: false,
        cuneiform: ['??'],
      }),
      renderingFactory.build({
        spelling: 'ab-si-n',
        complete: false,
        cuneiform: ['𒀊𒋛?'],
        unrendered: [{ token: 'n', reason: 'noCharacter' }],
        knownWrongCharacters: ['𒋛'],
      }),
    ]
    expect(getSpellingCuneiform(renderings, 'attinger', 'ab-si-n')).toEqual({
      complete: '',
      partial: [
        { kind: 'sign', value: '𒀊𒋛' },
        { kind: 'missing', value: 'n' },
      ],
      knownWrongCharacters: ['𒋛'],
    })
  })

  it('falls back to the partial rendering when the complete one is empty', () => {
    const renderings = [
      renderingFactory.build({
        spelling: 'ab-si-n',
        complete: true,
        cuneiform: [''],
      }),
      renderingFactory.build({
        spelling: 'ab-si-n',
        complete: false,
        cuneiform: ['𒀊?'],
        unrendered: [{ token: 'si', reason: 'unread' }],
      }),
    ]
    expect(getSpellingCuneiform(renderings, 'attinger', 'ab-si-n')).toEqual({
      complete: '',
      partial: [
        { kind: 'sign', value: '𒀊' },
        { kind: 'missing', value: 'si' },
      ],
      knownWrongCharacters: [],
    })
  })

  it('is empty when nothing renders the spelling', () => {
    expect(getSpellingCuneiform([], 'epsd2', 'lugal')).toEqual({
      complete: '',
      partial: [],
      knownWrongCharacters: [],
    })
  })
})

describe('getKeyRenderingSpellings', () => {
  it('lists each key spelling once, in order', () => {
    const renderings = [
      renderingFactory.build({ spelling: 'lugal', kind: 'key' }),
      renderingFactory.build({ spelling: 'lu-gal', kind: 'variant' }),
      renderingFactory.build({ spelling: 'lugal', kind: 'key' }),
      renderingFactory.build({ spelling: 'lugal₂', kind: 'key' }),
    ]
    expect(getKeyRenderingSpellings(renderings)).toEqual(['lugal', 'lugal₂'])
  })
})

describe('getHeadCuneiform', () => {
  it('uses the first complete key rendering', () => {
    const renderings = [
      renderingFactory.build({ kind: 'key', complete: false }),
      renderingFactory.build({ kind: 'key', cuneiform: ['𒈗', '𒈗𒈗'] }),
    ]
    expect(getHeadCuneiform({ renderings, citationForm: 'lugal' })).toEqual('𒈗')
  })

  it('falls back to the ePSD2 form equal to the citation form', () => {
    const renderings = [
      renderingFactory.build({
        kind: 'form',
        source: 'epsd2',
        spelling: 'lugal',
        cuneiform: ['𒈗'],
      }),
    ]
    expect(getHeadCuneiform({ renderings, citationForm: 'lugal' })).toEqual('𒈗')
  })

  it('is empty without either', () => {
    expect(getHeadCuneiform({ renderings: [], citationForm: 'lugal' })).toEqual(
      '',
    )
  })
})
