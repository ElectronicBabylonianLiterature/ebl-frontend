import { factory } from 'factory-girl'
import ReferenceInjector from './ReferenceInjector'
import setUpReferences from 'test-helpers/setUpReferences'

const bibliographyService = {
  find: jest.fn(),
}

const injector = new ReferenceInjector(bibliographyService as any)

test('hydrateReferences', async () => {
  const { references, expectedReferences } = await setUpReferences(
    bibliographyService
  )
  const fragment = await factory.build('fragment', {
    references: references,
  })

  const injectedFragment = await injector.injectReferences(fragment)
  expect(injectedFragment.references).toEqual(expectedReferences)
})
