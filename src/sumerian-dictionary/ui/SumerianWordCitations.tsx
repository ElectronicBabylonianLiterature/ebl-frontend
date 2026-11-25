import React, { useState } from 'react'
import _ from 'lodash'
import { OverlayTrigger, Popover } from 'react-bootstrap'
import ExternalLink from 'common/ui/ExternalLink'
import { SumerianWord } from 'sumerian-dictionary/domain/SumerianWord'
import { Citation } from 'sumerian-dictionary/domain/SumerianWordParts'
import { getEtcslUrl } from 'sumerian-dictionary/domain/sumerianWordHelpers'

function CitedWork({ citation }: { citation: Citation }): JSX.Element {
  const [popoverId] = useState(() => _.uniqueId('SumerianCitedWork-'))
  const popover = (
    <Popover id={popoverId}>
      <Popover.Header>{citation.work}</Popover.Header>
      <Popover.Body>
        {citation.etcsl ? (
          <ExternalLink href={getEtcslUrl(citation.etcsl)}>
            ETCSL {citation.etcsl}
          </ExternalLink>
        ) : (
          'No ETCSL edition'
        )}
      </Popover.Body>
    </Popover>
  )
  return (
    <OverlayTrigger
      rootClose
      overlay={popover}
      trigger={['click']}
      placement="top"
    >
      <button type="button" className="SumerianDictionary__work">
        {citation.work}
      </button>
    </OverlayTrigger>
  )
}

export default function SumerianWordCitations({
  word,
}: {
  word: SumerianWord
}): JSX.Element {
  return (
    <ol className="SumerianDictionary__citations">
      {word.citations.map((citation, index) => (
        <li key={index}>
          <CitedWork citation={citation} />
          {citation.passage && (
            <span className="SumerianDictionary__passage">
              {' '}
              {citation.passage}
            </span>
          )}
        </li>
      ))}
    </ol>
  )
}
