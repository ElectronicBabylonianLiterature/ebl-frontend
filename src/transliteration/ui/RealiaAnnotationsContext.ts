import React, { Context } from 'react'
import {
  emptyRealiaIdLookup,
  RealiaIdLookup,
} from 'fragmentarium/domain/realiaAnnotations'

const RealiaAnnotationsContext: Context<RealiaIdLookup> =
  React.createContext<RealiaIdLookup>(emptyRealiaIdLookup)

export default RealiaAnnotationsContext
