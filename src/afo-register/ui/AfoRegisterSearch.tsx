import React from 'react'
import _ from 'lodash'

import withData from 'http/withData'

import Record from 'afo-register/domain/Record'
import AfoRegisterService from 'afo-register/application/AfoRegisterService'
import { LiteratureRedirectBox } from 'common/LiteratureRedirectBox'
import { AfoRegisterQuery } from './AfoRegisterSearchForm'
import { stringify } from 'query-string'

export const AfoRegisterRedirectBox = (
  <LiteratureRedirectBox
    authors="Hirsch, H.; Hunger, H.; Jursa, M.; Weszeli, M.; et al."
    book="Archiv für Orientforschung (Register Assyriologie)"
    notelink=""
    subtitle="25 (1974/1977) – 54 (2021)"
    note="By permission from the AfO Redaktion"
    link="https://orientalistik.univie.ac.at/publikationen/afo/register/"
    icon="pointer__hover my-2 fas fa-external-link-square-alt"
  />
)

function afoRegisterSearch({ data }: { data: readonly Record[] }) {
  console.log(data)
  return (
    <>
      <ol className="afoRegisterSearch">
        {data.map((record) => (
          <li
            key={record.afoNumber + record.page}
            className="afoRegisterSearch__record"
          >
            {record.toMarkdownString([])}
          </li>
        ))}
      </ol>
      {data.length > 0 && AfoRegisterRedirectBox}
    </>
  )
}

export default withData<
  unknown,
  {
    afoRegisterService: AfoRegisterService
    query: AfoRegisterQuery
  },
  readonly Record[]
>(
  afoRegisterSearch,
  (props) => props.afoRegisterService.search(stringify(props.query)),
  {
    watch: (props) => [props.query],
    filter: (props) => !_.isEmpty(props.query),
    defaultData: () => [],
  }
)
