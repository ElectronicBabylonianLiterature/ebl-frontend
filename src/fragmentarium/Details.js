import React, { Component, Fragment } from 'react'
import _ from 'lodash'

import './Details.css'

const museums = {
  'The British Museum': fragment => fragment.bmIdNumber
    ? `https://www.britishmuseum.org/research/collection_online/collection_object_details.aspx?objectId=${fragment.bmIdNumber}&partId=1`
    : 'https://britishmuseum.org/'
}

class Details extends Component {
  get collection () {
    return this.props.fragment.collection && `(${this.props.fragment.collection} Collection)`
  }

  get museum () {
    const musuemUrl = _.get(museums, this.props.fragment.museum, () => null)(this.props.fragment)
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
                <li className='Details-joins__join' key={join}>{join}</li>
              )}
            </ul>
          )
        }
      </Fragment>
    )
  }

  get measurements () {
    return `${this.props.fragment.length} × ${this.props.fragment.width} × ${this.props.fragment.thickness} cm`
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
        <li className='Details__item'>{this.museum}</li>
        <li className='Details__item'>{this.collection}</li>
        <li className='Details__item'>{this.joins}</li>
        <li className='Details__item Details-item--extra-margin'>{this.measurements}</li>
        <li className='Details__item'>{this.cdliNumber}</li>
        <li className='Details__item'>Accession: {this.props.fragment.accession || '-'}</li>
      </ul>
    )
  }
}

export default Details
