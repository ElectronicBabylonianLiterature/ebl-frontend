import React from 'react'
import DossierRecord from 'dossiers/domain/DossierRecord'
import MarkdownAndHtmlToHtml from 'common/MarkdownAndHtmlToHtml'
import { Fragment } from 'fragmentarium/domain/fragment'
import withData from 'http/withData'
import DossiersService from 'dossiers/application/DossiersService'
import _ from 'lodash'
import Bluebird from 'bluebird'

export function DossierRecordDisplay({
  record,
  index,
}: {
  record: DossierRecord
  index: string | number
}): JSX.Element {
  return (
    <MarkdownAndHtmlToHtml
      key={`dossier-md-${index}`}
      markdownAndHtml={record.toMarkdownString()}
      className="dossier-record"
    />
  )
}

export function DossierRecordsListDisplay({
  data,
}: {
  data: { records: readonly DossierRecord[] }
} & React.OlHTMLAttributes<HTMLOListElement>): JSX.Element {
  const { records } = data

  if (records.length < 1) {
    return <></>
  }
  return (
    <ol>
      {records.map((record, index) => (
        <li key={`dossier-li-${index}`} className="dossier-records__list-item">
          <DossierRecordDisplay record={record} index={index} />
        </li>
      ))}
    </ol>
  )
}

const FragmentDossierRecordsDisplay = withData<
  unknown,
  {
    dossiersService: DossiersService
    fragment: Fragment
  },
  { records: readonly DossierRecord[] }
>(
  DossierRecordsListDisplay,
  (props) => {
    return Bluebird.resolve(
      props.dossiersService
        .queryByIds([
          ...props.fragment.dossiers.map((record) => record.dossierId),
        ])
        .then((records) => ({ records }))
    )
  },
  {
    watch: (props) => [...props.fragment.dossiers],
    filter: (props) => !_.isEmpty(props.fragment.dossiers),
    defaultData: () => ({ records: [] }),
  }
)

export default FragmentDossierRecordsDisplay
