import React, { Component, Fragment } from 'react'
import { Tab, Tabs } from 'react-bootstrap'
import _ from 'lodash'

import FolioImage from './FolioImage'
import CdliImage from './CdliImage'

const displayNames = {
  WGL: 'Lambert',
  FWG: 'Geers',
  EL: 'Leichty',
  AKG: 'Grayson',
  MJG: 'Geller'
}

function hasImage (entry) {
  return ['WGL', 'AKG', 'MJG'].includes(entry.name)
}

class Folios extends Component {
  FolioTab = (entry, index) => (
    <Tab
      key={index}
      eventKey={index}
      title={`${displayNames[entry.name] || entry.name} Folio ${entry.number}`}
      disabled={!hasImage(entry)}>
      {hasImage(entry) &&
        <FolioImage fragmentService={this.props.fragmentService} folio={entry} alt={`${entry.name}_${entry.number}.jpg`} />
      }
    </Tab>
  )

  render () {
    return (
      <Fragment>
        <Tabs
          id='folio-container'
          defaultActiveKey={_.findIndex(this.props.folios, hasImage)}>
          {this.props.folios.map(this.FolioTab)}
          {this.props.cdliNumber && (
            <Tab eventKey={-1} title='CDLI Image'>
              <CdliImage cdliNumber={this.props.cdliNumber} />
            </Tab>
          )}
        </Tabs>
        {_.isEmpty(this.props.folios) && _.isEmpty(this.props.cdliNumber) && 'No folios'}
      </Fragment>
    )
  }
}

export default Folios
