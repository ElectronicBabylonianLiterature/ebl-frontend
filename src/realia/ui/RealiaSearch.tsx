import React from 'react'
import withData from 'http/withData'
import { RealiaEntry } from 'realia/domain/RealiaEntry'
import RealiaService from 'realia/application/RealiaService'
import RealiaResultsList from 'realia/ui/RealiaResultsList'

function RealiaSearchDisplay({
  data,
}: {
  data: readonly RealiaEntry[]
}): JSX.Element {
  return <RealiaResultsList entries={data} />
}

export default withData<
  unknown,
  { realiaService: RealiaService; query: string },
  readonly RealiaEntry[]
>(RealiaSearchDisplay, (props) => props.realiaService.search(props.query), {
  watch: (props) => [props.query],
  filter: (props) => props.query.trim().length > 0,
  defaultData: () => [],
})
