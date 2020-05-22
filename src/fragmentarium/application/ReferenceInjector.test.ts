import { factory } from 'factory-girl'
import ReferenceInjector from './ReferenceInjector'
import setUpReferences from 'test-helpers/setUpReferences'
import Promise from 'bluebird'
import { Fragment } from 'fragmentarium/domain/fragment'
import Reference from 'bibliography/domain/Reference'

const bibliographyService = {
  find: jest.fn(),
}

const injector = new ReferenceInjector(bibliographyService as any)

let promise: Promise<Fragment>
let expectedReferences: Reference[]

beforeEach(async () => {
  const config = await setUpReferences(bibliographyService)
  const fragment = await factory.build('fragment', {
    references: config.references,
  })

  expectedReferences = config.expectedReferences
  promise = injector.injectReferences(fragment)
})

test('injectReferences injects references to the fragment', async () => {
  const injectedFragment = await promise
  expect(injectedFragment.references).toEqual(expectedReferences)
})

test('injectReferences returns a Bluebird promise', async () => {
  expect(promise).toBeInstanceOf(Promise)
})
