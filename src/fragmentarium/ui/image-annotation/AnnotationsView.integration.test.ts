import AppDriver from 'test-support/AppDriver'
import FakeApi from 'test-support/FakeApi'
import { fragmentDto } from 'test-support/test-fragment'
import { annotationsDto } from 'test-support/test-annotation'
import produce from 'immer'

const fragmentWithoutReferences = produce(fragmentDto, (draft) => {
  draft.references = []
})
const fragmentNumber = 'Test.Fragment'
const photo = { blobParts: [''], options: { type: 'image/jpeg' }, size: 1 }
let fakeApi: FakeApi
let appDriver: AppDriver

afterEach(() => {
  fakeApi.verifyExpectations()
})

describe('Display annotate view', () => {
  beforeEach(async () => {
    ;(URL.createObjectURL as jest.Mock).mockReturnValueOnce('mock url')
    fakeApi = new FakeApi()
      .expectFragment(fragmentWithoutReferences)
      .expectPhoto(fragmentNumber, photo)
      .expectAnnotations(fragmentNumber, annotationsDto)
    appDriver = new AppDriver(fakeApi.client)
      .withSession()
      .withPath(`/library/${fragmentNumber}/annotate`)
      .render()
    await appDriver.waitForText('blank')
  })

  test('Breadcrumbs', () => {
    appDriver.breadcrumbs.expectCrumbs([
      'eBL',
      'Fragmentarium',
      fragmentNumber,
      'Tag Signs',
    ])
  })

  test('Fragment crumb', () => {
    appDriver.breadcrumbs.expectCrumb(
      fragmentNumber,
      `/library/${fragmentNumber}`
    )
  })

  test('Snapshot', () => {
    expect(appDriver.getView().container).toMatchSnapshot()
  })
})
