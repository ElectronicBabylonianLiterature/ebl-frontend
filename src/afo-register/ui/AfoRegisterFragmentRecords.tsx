import React from 'react'
import AfoRegisterService from 'afo-register/application/AfoRegisterService'
import { Fragment } from 'fragmentarium/domain/fragment'
import withData from 'http/withData'
import AfoRegisterRecord from 'afo-register/domain/Record'
import _ from 'lodash'
import { AfoRegisterRecordsListDisplay } from './AfoRegisterDisplay'

function AfoRegisterFragmentRecords({
  data,
}: {
  data: { records: readonly AfoRegisterRecord[] }
}): JSX.Element {
  return (
    <AfoRegisterRecordsListDisplay
      records={data.records}
      className="AfORegisterRecordsInFragment"
    />
  )
}

export default withData<
  unknown,
  {
    afoRegisterService: AfoRegisterService
    fragment: Fragment
  },
  { records: readonly AfoRegisterRecord[] }
>(
  AfoRegisterFragmentRecords,
  (props) => {
    return props.afoRegisterService
      .searchTextsAndNumbers(props.fragment.traditionalReferences)
      .then((records) => ({ records }))
  },
  {
    watch: (props) => [...props.fragment.traditionalReferences],
    filter: (props) => !_.isEmpty(props.fragment.traditionalReferences),
    defaultData: () => ({ records: [] }),
  },
)
