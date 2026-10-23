import BibliographyRepository from 'bibliography/infrastructure/BibliographyRepository'

export interface Deferred<Value> {
  readonly promise: Promise<Value>
  readonly resolve: (value: Value) => void
}

export function createDeferred<Value>(): Deferred<Value> {
  let resolvePromise!: (value: Value) => void
  const promise = new Promise<Value>((resolve) => {
    resolvePromise = resolve
  })
  return { promise, resolve: resolvePromise }
}

export function createBibliographyRepositoryMock(): jest.Mocked<BibliographyRepository> {
  return Object.assign(Object.create(BibliographyRepository.prototype), {
    find: jest.fn(),
    findMany: jest.fn(),
    search: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
    listAllBibliography: jest.fn(),
  })
}
