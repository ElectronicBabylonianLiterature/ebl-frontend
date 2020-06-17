import AppDriver from 'test-support/AppDriver'
import FakeApi from 'test-support/FakeApi'
import { fragmentDto } from 'test-support/test-fragment'
import { annotationsDto } from 'test-support/test-annotation'
import produce from 'immer'

const fragmentWithoutReferences = produce(fragmentDto, (draft) => {
  draft.references = []
})
const fragmentNumber = fragmentWithoutReferences._id

let fakeApi: FakeApi
let appDriver: AppDriver

afterEach(() => {
  fakeApi.verifyExpectations()
})

describe('Diplay annotate view', () => {
  beforeEach(async () => {
    ;(URL.createObjectURL as jest.Mock).mockReturnValueOnce('mock url')
    fakeApi = new FakeApi()
      .expectFragment(fragmentWithoutReferences)
      .expectPhoto(fragmentNumber)
      .expectAnnotations(fragmentNumber, annotationsDto)
    appDriver = await new AppDriver(fakeApi.client)
      .withSession()
      .withPath(`/fragmentarium/${fragmentNumber}/annotate`)
      .render()
    await appDriver.waitForText('Save')
  })

  test('Breadcrumbs', () => {
    appDriver.expectBreadcrumbs([
      'eBL',
      'Fragmentarium',
      fragmentDto._id,
      'Annotate',
    ])
  })

  test('Fragment crumb', () => {
    appDriver.expectBreadcrumb(
      fragmentDto._id,
      `/fragmentarium/${fragmentDto._id}`
    )
  })

  test('Snapshot', () => {
    expect(appDriver.getElement().container).toMatchSnapshot()
  })

  test('Save', async () => {
    fakeApi.expectUpdateAnnotations(fragmentNumber, annotationsDto)
    await appDriver.click('Save')
  })
})
