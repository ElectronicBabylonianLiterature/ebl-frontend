// @flow
import React, { useContext } from 'react'
import { Tab, Tabs, Badge } from 'react-bootstrap'
import { withRouter } from 'react-router-dom'
import _ from 'lodash'

import FolioPager from './FolioPager'
import FolioImage from './FolioImage'
import CdliImage from './CdliImage'
import Photo from './Photo'
import {
  createFragmentUrlWithFolio,
  createFragmentUrlWithTab
} from 'fragmentarium/FragmentLink'

import './Folios.css'
import SessionContext from 'auth/SessionContext'

function FolioDetails({ fragmentService, fragmentNumber, folio }) {
  return (
    folio.hasImage && (
      <>
        <header className="Folios__Pager">
          <FolioPager
            fragmentService={fragmentService}
            folio={folio}
            fragmentNumber={fragmentNumber}
          />
        </header>
        <FolioImage
          fragmentService={fragmentService}
          folio={folio}
          alt={folio.fileName}
        />
      </>
    )
  )
}

function Folios({ fragment, fragmentService, tab, activeFolio, history }) {
  const session = useContext(SessionContext)

  function onSelect(key) {
    if (_.isNumber(key)) {
      const folio = fragment.folios[key]
      history.push(
        createFragmentUrlWithFolio(fragment.number, folio.name, folio.number)
      )
    } else {
      history.push(createFragmentUrlWithTab(fragment.number, key))
    }
  }

  let activeKey = tab || (fragment.cdliNumber ? 'cdli' : 0)

  if (tab === 'folio') {
    const key = fragment.folios.findIndex(folio =>
      _.isEqual(folio, activeFolio)
    )
    if (key >= 0) {
      activeKey = key
    }
  }

  return (
    <>
      <Tabs id="folio-container" activeKey={activeKey} onSelect={onSelect}>
        {fragment.folios.map((folio, index) => (
          <Tab
            key={index}
            eventKey={index}
            title={`${folio.humanizedName} Folio ${folio.number}`}
            disabled={!folio.hasImage}
          >
            <FolioDetails
              fragmentService={fragmentService}
              fragmentNumber={fragment.number}
              folio={folio}
            />
          </Tab>
        ))}
        {session.hasBetaAccess() && (
          <Tab eventKey="photo" title="Photo">
            <Badge variant="warning">Beta</Badge>
            <Photo fragment={fragment} fragmentService={fragmentService} />
          </Tab>
        )}
        {fragment.cdliNumber && (
          <Tab eventKey="cdli" title="CDLI Image">
            <CdliImage cdliNumber={fragment.cdliNumber} />
          </Tab>
        )}
      </Tabs>
      {_.isEmpty(fragment.folios) &&
        _.isEmpty(fragment.cdliNumber) &&
        'No folios'}
    </>
  )
}

export default withRouter(Folios)
