import Bluebird from 'bluebird'

import BibliographyRepository from 'bibliography/infrastructure/BibliographyRepository'

export interface Deferred<Value> {
  readonly promise: Bluebird<Value>
  readonly resolve: (value: Value) => void
}

export function createDeferred<Value>(): Deferred<Value> {
  let resolvePromise = (_value: Value): void => {
    throw new Error('Deferred promise was not initialized')
  }
  const promise = new Bluebird<Value>((resolve) => {
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
