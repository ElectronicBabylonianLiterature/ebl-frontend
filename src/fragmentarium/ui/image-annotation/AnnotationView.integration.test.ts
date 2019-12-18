import AppDriver from 'test-helpers/AppDriver'
import FakeApi from 'test-helpers/FakeApi'
import { fragmentDto } from 'test-helpers/test-fragment'
import { annotationsDto } from 'test-helpers/test-annotation'
import produce from 'immer'

const fragmentWithoutReferences = produce(fragmentDto, draft => {
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
    fakeApi = new FakeApi()
      .expectFragment(fragmentWithoutReferences)
      .expectPhoto(fragmentNumber)
      .expectAnnotations(fragmentNumber, annotationsDto)
    appDriver = new AppDriver(fakeApi.client)
      .withSession()
      .withPath(`/fragmentarium/${fragmentNumber}/annotate`)
      .render()
    await appDriver.waitForText(`Save`)
  })

  test('Breadcrumbs', () => {
    appDriver.expectBreadcrumbs([
      'eBL',
      'Fragmentarium',
      fragmentDto._id,
      'Annotate'
    ])
  })

  test('Snapshot', () => {
    expect(appDriver.getElement().container).toMatchSnapshot()
  })

  test('Save', () => {
    fakeApi.expectUpdateAnnotations(fragmentNumber, annotationsDto)
    appDriver.click('Save')
  })
})
