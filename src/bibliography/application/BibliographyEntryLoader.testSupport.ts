import BibliographyEntry from 'bibliography/domain/BibliographyEntry'
import BibliographyEntryLoader from 'bibliography/application/BibliographyEntryLoader'
import BibliographyRepository from 'bibliography/infrastructure/BibliographyRepository'
import { bibliographyEntryFactory } from 'test-support/bibliography-fixtures'

export type Deferred<Value> = {
  promise: Promise<Value>
  resolve: (value: Value) => void
}

export type LoaderTestContext = {
  repository: jest.Mocked<BibliographyRepository>
  loader: BibliographyEntryLoader
  entries: Record<string, BibliographyEntry>
}

export function entryWithId(id: string): BibliographyEntry {
  return bibliographyEntryFactory.build({}, { transient: { id } })
}

export function defer<Value>(): Deferred<Value> {
  let resolve!: (value: Value) => void
  const promise = new Promise<Value>((resolvePromise) => {
    resolve = resolvePromise
  })
  return { promise, resolve }
}

export function createLoaderTestContext(ids: string[]): LoaderTestContext {
  const MockBibliographyRepository = BibliographyRepository as jest.Mock<
    jest.Mocked<BibliographyRepository>
  >
  const repository = new MockBibliographyRepository()
  return {
    repository,
    loader: new BibliographyEntryLoader(repository),
    entries: Object.fromEntries(ids.map((id) => [id, entryWithId(id)])),
  }
}
