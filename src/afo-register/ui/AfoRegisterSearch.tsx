import React from 'react'
import _ from 'lodash'

import withData from 'http/withData'

import AfoRegisterRecord from 'afo-register/domain/Record'
import AfoRegisterService from 'afo-register/application/AfoRegisterService'
import { LiteratureRedirectBox } from 'common/LiteratureRedirectBox'
import { AfoRegisterQuery } from './AfoRegisterSearchForm'
import { stringify } from 'query-string'
import { AfoRegisterRecordsList } from './AfoRegister'

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

function AfoRegisterSearch({ data }: { data: readonly AfoRegisterRecord[] }) {
  return (
    <>
      <AfoRegisterRecordsList
        records={data}
        className="afoRegisterSearchResults"
      />
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
  readonly AfoRegisterRecord[]
>(
  AfoRegisterSearch,
  (props) => props.afoRegisterService.search(stringify(props.query)),
  {
    watch: (props) => [props.query],
    filter: (props) => !_.isEmpty(props.query),
    defaultData: () => [],
  }
)
