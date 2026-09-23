import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useParams } from 'react-router-dom'
import Bluebird from 'bluebird'
import SessionContext from 'auth/SessionContext'
import MemorySession from 'auth/Session'
import RealiaService from 'realia/application/RealiaService'
import RealiaRepository from 'realia/infrastructure/RealiaRepository'
import RealiaDisplay from 'realia/ui/RealiaDisplay'
import { installMockIntersectionObserver } from 'test-support/intersectionObserverMock'
import { realiaEntryFactory } from 'test-support/realia-fixtures'

jest.mock('realia/infrastructure/RealiaRepository')

const lemma = 'Apkallu'
const realiaId = 'realia_000846'

const realiaRepository = new (RealiaRepository as jest.Mock)()

function RealiaRouteEntry({
  realiaService,
}: {
  realiaService: RealiaService
}): JSX.Element {
  const { id } = useParams()
  return (
    <RealiaDisplay
      id={decodeURIComponent(id ?? '')}
      realiaService={realiaService}
    />
  )
}

function mountAtUrl(url: string): jest.SpyInstance {
  const entry = realiaEntryFactory.build({ id: lemma, realiaId })
  realiaRepository.findByRealiaId.mockReturnValue(Bluebird.resolve(entry))
  realiaRepository.find.mockReturnValue(Bluebird.resolve(entry))
  const realiaService = new RealiaService(realiaRepository)
  const findSpy = jest.spyOn(realiaService, 'find')

  render(
    <MemoryRouter initialEntries={[url]}>
      <SessionContext.Provider value={new MemorySession(['read:realia'])}>
        <Routes>
          <Route
            path="/tools/realia/:id"
            element={<RealiaRouteEntry realiaService={realiaService} />}
          />
        </Routes>
      </SessionContext.Provider>
    </MemoryRouter>,
  )

  return findSpy
}

beforeEach(() => {
  jest.clearAllMocks()
  installMockIntersectionObserver()
})

it('requests the entry only once across the canonicalising redirect', async () => {
  const findSpy = mountAtUrl(`/tools/realia/${realiaId}`)

  await waitFor(() => expect(findSpy).toHaveBeenCalledTimes(2))

  expect(findSpy.mock.calls.map((call) => call[0])).toEqual([realiaId, lemma])
  expect(realiaRepository.findByRealiaId).toHaveBeenCalledTimes(1)
  expect(realiaRepository.find).not.toHaveBeenCalled()
})

it('requests the entry only once for a canonical lemma URL', async () => {
  const findSpy = mountAtUrl(`/tools/realia/${lemma}`)

  await waitFor(() => expect(findSpy).toHaveBeenCalledTimes(1))

  expect(realiaRepository.find).toHaveBeenCalledTimes(1)
  expect(realiaRepository.findByRealiaId).not.toHaveBeenCalled()
})
