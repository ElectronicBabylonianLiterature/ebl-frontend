import React from 'react'
import Bluebird from 'bluebird'
import RealiaService from 'realia/application/RealiaService'
import RealiaServiceContext from 'realia/application/RealiaServiceContext'
import { RealiaEntry } from 'realia/domain/RealiaEntry'

export const realiaServiceMock = new (RealiaService as jest.Mock<
  jest.Mocked<RealiaService>
>)()

export function mockRealiaSearch(entries: readonly RealiaEntry[]): void {
  realiaServiceMock.search.mockReturnValue(Bluebird.resolve(entries))
}

export function WithRealiaService({
  children,
}: {
  children: React.ReactNode
}): JSX.Element {
  return (
    <RealiaServiceContext.Provider value={realiaServiceMock}>
      {children}
    </RealiaServiceContext.Provider>
  )
}
