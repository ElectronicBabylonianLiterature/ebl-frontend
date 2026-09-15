import React from 'react'
import { renderHook } from '@testing-library/react'
import RealiaService from 'realia/application/RealiaService'
import RealiaServiceContext, {
  requireRealiaService,
  useRealiaService,
} from 'realia/application/RealiaServiceContext'

jest.mock('realia/application/RealiaService')

const realiaService = new (RealiaService as jest.Mock<
  jest.Mocked<RealiaService>
>)()

describe('requireRealiaService', () => {
  it('returns the service when present', () => {
    expect(requireRealiaService(realiaService)).toBe(realiaService)
  })

  it('throws when the service is missing', () => {
    expect(() => requireRealiaService(null)).toThrow(
      'RealiaServiceContext is missing a RealiaService.',
    )
  })
})

describe('useRealiaService', () => {
  it('returns the provided service', () => {
    const { result } = renderHook(() => useRealiaService(), {
      wrapper: ({ children }) => (
        <RealiaServiceContext.Provider value={realiaService}>
          {children}
        </RealiaServiceContext.Provider>
      ),
    })

    expect(result.current).toBe(realiaService)
  })
})
