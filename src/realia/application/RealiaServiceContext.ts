import React, { Context, useContext } from 'react'
import RealiaService from 'realia/application/RealiaService'

const RealiaServiceContext: Context<RealiaService | null> =
  React.createContext<RealiaService | null>(null)

export function requireRealiaService(
  realiaService: RealiaService | null,
): RealiaService {
  if (realiaService === null) {
    throw new Error('RealiaServiceContext is missing a RealiaService.')
  }

  return realiaService
}

export function useRealiaService(): RealiaService {
  return requireRealiaService(useContext(RealiaServiceContext))
}

export default RealiaServiceContext
