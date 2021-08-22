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

describe('Diplay annotate view', () => {
  beforeEach(async () => {
    ;(URL.createObjectURL as jest.Mock).mockReturnValueOnce('mock url')
    fakeApi = new FakeApi()
      .expectPager(fragmentNumber, { previous: 'X.0', next: 'X.1' })
      .expectFragment(fragmentWithoutReferences)
      .expectPhoto(fragmentNumber, photo)
      .expectAnnotations(fragmentNumber, annotationsDto)
    appDriver = await new AppDriver(fakeApi.client)
      .withSession()
      .withPath(`/fragmentarium/${fragmentNumber}/annotate`)
      .render()
    await appDriver.waitForText('blank')
  })

  test('Breadcrumbs', () => {
    appDriver.breadcrumbs.expectCrumbs([
      'eBL',
      'Fragmentarium',
      fragmentNumber,
      'Annotations',
    ])
  })

  test('Fragment crumb', () => {
    appDriver.breadcrumbs.expectCrumb(
      fragmentNumber,
      `/fragmentarium/${fragmentNumber}`
    )
  })

  test('Snapshot', () => {
    expect(appDriver.getView().container).toMatchSnapshot()
  })
})
