import React, { Component, Fragment } from 'react'
import _ from 'lodash'

import CdliLink from './CdliLink'
import FragmentLink from 'fragmentarium/FragmentLink'

import './Details.css'

const museums = {
  'The British Museum': 'https://britishmuseum.org/'
}

class Details extends Component {
  get collection () {
    return this.props.fragment.collection && `(${this.props.fragment.collection} Collection)`
  }

  get museum () {
    const museum = this.props.fragment.museum
    const musuemUrl = museums[museum]
    return (
      <a href={musuemUrl}>
        {museum}
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
                <li className='Details-joins__join' key={join}>
                  <FragmentLink number={join}>{join}</FragmentLink>
                </li>
              )}
            </ul>
          )
        }
      </Fragment>
    )
  }

  get measurements () {
    const measurements = _([
      this.props.fragment.length.value,
      this.props.fragment.width.value,
      this.props.fragment.thickness.value
    ]).compact().join(' × ')

    return `${measurements}${_.isEmpty(measurements) ? '' : ' cm'}`
  }

  get cdliNumber () {
    const cdliNumber = this.props.fragment.cdliNumber
    return (
      <Fragment>
        CDLI: {cdliNumber
          ? <CdliLink cdliNumber={cdliNumber}>{cdliNumber}</CdliLink>
          : '-'}
      </Fragment>
    )
  }

  get hits () {
    const hits = this.props.fragment.hits
    return (
      <Fragment>
        Cited in {hits} documents
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
        {!_.isNil(this.props.fragment.hits) && <li className='Details__item'>{this.hits}</li>}
      </ul>
    )
  }
}

export default Details
