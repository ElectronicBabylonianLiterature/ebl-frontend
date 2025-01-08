import React, { useRef, useState } from 'react'
import DossierRecord from 'dossiers/domain/DossierRecord'
import MarkdownAndHtmlToHtml from 'common/MarkdownAndHtmlToHtml'
import withData from 'http/withData'
import DossiersService from 'dossiers/application/DossiersService'
import _ from 'lodash'
import Bluebird from 'bluebird'
import { Popover, Overlay } from 'react-bootstrap'
import { Fragment } from 'fragmentarium/domain/fragment'
import './DossiersDisplay.sass'

export function DossierRecordDisplay({
  record,
  index,
}: {
  record: DossierRecord
  index: number
}): JSX.Element {
  return (
    <MarkdownAndHtmlToHtml
      key={`dossier-md-${index}`}
      markdownAndHtml={record.toMarkdownString()}
      className="dossier-record"
    />
  )
}

function DossierInfoSpan({
  index,
  isActive,
  setActiveDossier,
  targetRef,
  recordId,
}: {
  index: number
  isActive: boolean
  setActiveDossier: React.Dispatch<React.SetStateAction<number | null>>
  targetRef: React.RefObject<HTMLElement>
  recordId: string
}): JSX.Element {
  return (
    <span
      key={`dossier-span-${index}`}
      className={`dossier-records__item${isActive ? '__active' : ''}`}
      onClick={() => setActiveDossier(isActive ? null : index)}
      ref={targetRef}
    >
      {`Dossier: ${recordId}`}
    </span>
  )
}

function DossierPopover({
  index,
  isActive,
  targetRef,
  setActiveDossier,
  record,
}: {
  index: number
  isActive: boolean
  targetRef: React.RefObject<HTMLElement>
  setActiveDossier: React.Dispatch<React.SetStateAction<number | null>>
  record: DossierRecord
}): JSX.Element {
  return (
    <Overlay
      key={`dossier-overlay-${index} fade`}
      target={targetRef.current}
      placement="right"
      show={isActive}
      onEnter={() => setActiveDossier(index)}
      onHide={() => setActiveDossier(null)}
      rootClose={true}
      rootCloseEvent={'click'}
    >
      <Popover
        id={`DossierReferencePopOver-${index}`}
        className="reference-popover__popover"
      >
        <Popover.Title as="h3">{record.id}</Popover.Title>
        <Popover.Content>
          <DossierRecordDisplay record={record} index={index} />
        </Popover.Content>
      </Popover>
    </Overlay>
  )
}

function DossierRecordItem(props: {
  record: DossierRecord
  index: number
  activeDossier: number | null
  setActiveDossier: React.Dispatch<React.SetStateAction<number | null>>
}): JSX.Element {
  const { record, index, activeDossier, setActiveDossier } = props
  const target = useRef(null)
  const isActive = activeDossier === index

  return (
    <>
      <DossierInfoSpan
        index={index}
        isActive={isActive}
        setActiveDossier={setActiveDossier}
        targetRef={target}
        recordId={record.id}
      />
      <DossierPopover
        index={index}
        isActive={isActive}
        targetRef={target}
        setActiveDossier={setActiveDossier}
        record={record}
      />
    </>
  )
}

export function DossierRecordsListDisplay({
  data,
}: {
  data: { records: readonly DossierRecord[] }
} & React.OlHTMLAttributes<HTMLOListElement>): JSX.Element {
  const { records } = data
  const [activeDossier, setActiveDossier] = useState<number | null>(null)

  if (records.length < 1) {
    return <></>
  }
  return (
    <>
      {records.map((record, index) => (
        <DossierRecordItem
          key={index}
          {...{ index, record, activeDossier, setActiveDossier }}
        />
      ))}
    </>
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
