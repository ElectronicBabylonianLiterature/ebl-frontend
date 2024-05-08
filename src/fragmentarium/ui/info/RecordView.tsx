import React from 'react'
import { RecordEntry } from 'fragmentarium/domain/RecordEntry'
import { RecordList } from './Record'

interface RecordViewProps {
  record: ReadonlyArray<RecordEntry>
}

const RecordView: React.FC<RecordViewProps> = ({ record }) => {
  return (
    <div>
      <h2>Full Record History</h2>
      <RecordList record={record} className="" />
    </div>
  )
}
export default RecordView
