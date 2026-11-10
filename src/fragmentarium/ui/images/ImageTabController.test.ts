import {
  CDLI,
  PHOTO,
  TabController,
  VisitedImageTabs,
  parseFolioIndex,
  visitImageTab,
} from 'fragmentarium/ui/images/ImageTabController'
import { fragmentFactory } from 'test-support/fragment-fixtures'
import { folioFactory } from 'test-support/fragment-data-fixtures'

const noVisitedTabs: VisitedImageTabs = {
  namedTabs: new Set(),
  folioIndexes: new Set(),
}

const fragmentWithPhotoAndFolio = fragmentFactory.build(
  { hasPhoto: true, cdliImages: [] },
  { associations: { folios: [folioFactory.build({ name: 'WGL' })] } },
)

describe('parseFolioIndex', () => {
  it.each([
    ['0', 0],
    ['12', 12],
    ['0abc', null],
    ['1.5', null],
    ['-1', null],
    ['', null],
    [PHOTO, null],
  ])('parses %p as %p', (key, expected) => {
    expect(parseFolioIndex(key)).toEqual(expected)
  })
})

describe('visitImageTab', () => {
  it('keeps folio indexes and named tabs in separate sets', () => {
    const visited = [PHOTO, '0', CDLI, '2'].reduce(visitImageTab, noVisitedTabs)

    expect(visited.namedTabs).toEqual(new Set([PHOTO, CDLI]))
    expect(visited.folioIndexes).toEqual(new Set([0, 2]))
  })

  it.each([undefined, '0abc', 'nonsense'])('ignores the key %p', (key) => {
    expect(visitImageTab(noVisitedTabs, key)).toBe(noVisitedTabs)
  })

  it('returns the same state for an already visited key', () => {
    const visited = visitImageTab(visitImageTab(noVisitedTabs, '0'), PHOTO)

    expect(visitImageTab(visited, '0')).toBe(visited)
    expect(visitImageTab(visited, PHOTO)).toBe(visited)
  })
})

describe('TabController with a malformed folio key', () => {
  it('falls back to the default tab for a key that only starts with a digit', () => {
    const controller = new TabController(
      fragmentWithPhotoAndFolio,
      '0abc',
      null,
      jest.fn(),
    )

    expect(controller.activeKey).toEqual(PHOTO)
  })

  it('opens a malformed key as a plain tab URL', () => {
    const navigate = jest.fn()
    new TabController(fragmentWithPhotoAndFolio, null, null, navigate).openTab(
      '0abc',
    )

    expect(navigate).toHaveBeenCalledWith(expect.stringContaining('tab=0abc'))
  })

  it('opens a folio by index', () => {
    const navigate = jest.fn()
    new TabController(
      fragmentWithPhotoAndFolio,
      null,
      null,
      navigate,
    ).openFolio(0)

    expect(navigate).toHaveBeenCalledWith(expect.stringContaining('tab=folio'))
  })
})

describe('TabController with an Images tab offered without imagery', () => {
  const fragmentWithFolioWithoutPhoto = fragmentFactory.build(
    { hasPhoto: false, cdliImages: [] },
    { associations: { folios: [folioFactory.build({ name: 'WGL' })] } },
  )

  it('prefers a folio as the default tab', () => {
    const controller = new TabController(
      fragmentWithFolioWithoutPhoto,
      null,
      null,
      jest.fn(),
      true,
      false,
    )

    expect(controller.defaultKey).toEqual('0')
    expect(controller.activeKey).toEqual('0')
  })

  it('keeps the Images tab selectable on request', () => {
    const controller = new TabController(
      fragmentWithFolioWithoutPhoto,
      PHOTO,
      null,
      jest.fn(),
      true,
      false,
    )

    expect(controller.activeKey).toEqual(PHOTO)
  })

  it('falls back to the Images tab when nothing else is available', () => {
    const controller = new TabController(
      fragmentFactory.build({ hasPhoto: false, cdliImages: [], folios: [] }),
      null,
      null,
      jest.fn(),
      true,
      false,
    )

    expect(controller.defaultKey).toEqual(PHOTO)
  })

  it('defaults to the Images tab when there is imagery', () => {
    const controller = new TabController(
      fragmentWithFolioWithoutPhoto,
      null,
      null,
      jest.fn(),
      true,
      true,
    )

    expect(controller.defaultKey).toEqual(PHOTO)
  })
})
