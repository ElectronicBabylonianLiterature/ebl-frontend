import React from 'react'
import DossierRecord from 'dossiers/domain/DossierRecord'
import MarkdownAndHtmlToHtml from 'common/MarkdownAndHtmlToHtml'
import { Fragment } from 'fragmentarium/domain/fragment'
import withData from 'http/withData'
import DossiersService from 'dossiers/application/DossiersService'
import _ from 'lodash'
import Bluebird from 'bluebird'
import { OverlayTrigger, Popover } from 'react-bootstrap'

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

  function getDossierPopover({
    record,
    index,
  }: {
    record: DossierRecord
    index: number
  }): JSX.Element {
    return (
      <Popover
        id={_.uniqueId(`DossierReferencePopOver-${index}`)}
        className="reference-popover__popover"
      >
        <Popover.Content>
          <DossierRecordDisplay record={record} index={index} />
        </Popover.Content>
      </Popover>
    )
  }

  return (
    <div>
      Dossiers:
      <ol>
        {records.map((record, index) => (
          <li
            key={`dossier-li-${index}`}
            className="dossier-records__list-item"
          >
            <OverlayTrigger
              placement="right"
              overlay={getDossierPopover({ record: record, index: index })}
            >
              <span style={{ textDecoration: 'underline dotted' }}>
                {record.id}
              </span>
            </OverlayTrigger>
          </li>
        ))}
      </ol>
    </div>
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
