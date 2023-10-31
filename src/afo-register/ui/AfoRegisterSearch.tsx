import React from 'react'
import _ from 'lodash'

import withData from 'http/withData'

import Record from 'afo-register/domain/Record'
import AfoRegisterService from 'afo-register/application/AfoRegisterService'

function afoRegisterSearch({ data }: { data: readonly Record[] }) {
  return (
    <ol className="afoRegisterSearch">
      {data.map((record) => (
        <li
          key={record.afoNumber + record.page}
          className="afoRegisterSearch__record"
        >
          {record.toMarkdownString}
        </li>
      ))}
    </ol>
  )
}

export default withData<
  unknown,
  {
    afoRegisterService: AfoRegisterService
    query: string
  },
  readonly Record[]
>(afoRegisterSearch, (props) => props.afoRegisterService.search(props.query), {
  watch: (props) => [props.query],
  filter: (props) => !_.isEmpty(props.query),
  defaultData: () => [],
})
