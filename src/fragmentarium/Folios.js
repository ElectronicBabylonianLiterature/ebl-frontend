import React, { Component, Fragment } from 'react'
import { Tab, Tabs } from 'react-bootstrap'
import _ from 'lodash'

import ApiImage from './ApiImage'
import CdliImage from './CdliImage'

const displayNames = {
  WGL: 'Lambert',
  FWG: 'Geers',
  EL: 'Leichty'
}

function isLambert (entry) {
  return entry.name === 'WGL'
}

class Folios extends Component {
  folioTab = (entry, index) => (
    <Tab
      key={index}
      eventKey={index}
      title={`${displayNames[entry.name] || ''} Folio ${entry.number}`}
      disabled={!isLambert(entry)}>
      {isLambert(entry) && (
        <ApiImage apiClient={this.props.apiClient} fileName={`${entry.name}_${entry.number}.jpg`} />
      )}
    </Tab>
  )

  render () {
    return (
      <Fragment>
        <Tabs
          id='folio-container'
          defaultActiveKey={_.findIndex(this.props.folios, isLambert)}>
          {this.props.folios.map(this.folioTab)}
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
