import React from 'react'
import { Link } from 'react-router-dom'
import {
  RealiaCrossReference,
  realiaCrossReferenceTarget,
} from 'realia/domain/RealiaEntry'
import { getRealiaPageUrl } from 'realia/ui/realiaPage'

export function RealiaCrossReferenceLink({
  crossReference,
  anchor = '',
}: {
  crossReference: RealiaCrossReference
  anchor?: string
}): JSX.Element {
  const target = realiaCrossReferenceTarget(crossReference)
  return <Link to={`${getRealiaPageUrl(target)}${anchor}`}>{target}</Link>
}
