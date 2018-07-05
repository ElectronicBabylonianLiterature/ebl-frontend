import React, { Component, Fragment } from 'react'
import _ from 'lodash'

import './Details.css'

const museums = {
  'The British Museum': 'http://britishmuseum.org/'
}

class Details extends Component {
  get collection () {
    return this.props.fragment.collection && `(${this.props.fragment.collection} Collection)`
  }

  get museum () {
    const musuemUrl = museums[this.props.fragment.museum]
    return (
      <a href={musuemUrl}>
        {this.props.fragment.museum}
      </a>
    )
  }

  get joins () {
    return (
      <Fragment>
        Joins: {_.isEmpty(this.props.fragment.joins)
          ? '-'
          : (
            <ul className='Details-joins'>
              {this.props.fragment.joins.map(join =>
                <li className='Details-joins_join' key={join}>{join}</li>
              )}
            </ul>
          )
        }
      </Fragment>
    )
  }

  get measurements () {
    return `${this.props.fragment.length} x ${this.props.fragment.width} x ${this.props.fragment.thickness} cm`
  }

  get cdliNumber () {
    const cdliUrl = `https://cdli.ucla.edu/${this.props.fragment.cdliNumber}`
    return (
      <Fragment>
        CDLI: {this.props.fragment.cdliNumber
          ? <a href={cdliUrl}>{this.props.fragment.cdliNumber}</a>
          : '-'}
      </Fragment>
    )
  }

  render () {
    return (
      <ul className='Details'>
        <li className='Details-item'>{this.museum}</li>
        <li className='Details-item'>{this.collection}</li>
        <li className='Details-item'>{this.joins}</li>
        <li className='Details-item Details-item_measures'>{this.measurements}</li>
        <li className='Details-item'>{this.cdliNumber}</li>
        <li className='Details-item'>Accession: {this.props.fragment.accession || '-'}</li>
      </ul>
    )
  }
}

export default Details
