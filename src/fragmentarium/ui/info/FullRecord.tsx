import React from 'react'
import { RecordEntry } from 'fragmentarium/domain/RecordEntry'
import { RecordList } from './Record'

interface FullRecordProps {
  record: ReadonlyArray<RecordEntry>
}

const FullRecord: React.FC<FullRecordProps> = ({ record }) => {
  return (
    <div>
      <h2>Full Record History</h2>
      <RecordList record={record} className="" />
    </div>
  )
}
export default FullRecord
