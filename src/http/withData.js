import React, { Component } from 'react'
import _ from 'lodash'
import Promise from 'bluebird'
import Spinner from 'Spinner'
import ErrorAlert from 'ErrorAlert'
import ErrorBoundary from 'ErrorBoundary'

const defaultConfig = {
  shouldUpdate: () => false,
  authorize: true,
  filter: () => true,
  defaultData: null,
  method: 'fetchJson'
}

export default function withData (WrappedComponent, getPath, config = {}) {
  const fullConfig = {
    ...defaultConfig,
    ...config
  }
  return class extends Component {
    constructor (props) {
      super(props)
      this.fetchPromise = Promise.resolve()
    }

    state = {
      data: null,
      error: null
    }

    fecthFromApi = () => this.props.apiClient[fullConfig.method](getPath(this.props), fullConfig.authorize)

    fetchData = () => {
      this.fetchPromise.cancel()
      if (fullConfig.filter(this.props)) {
        this.setState({ data: null, error: null })
        this.fetchPromise = this.fecthFromApi()
          .then(json => this.setState({ data: json, error: null }))
          .catch(error => this.setState({ data: null, error: error }))
      } else {
        this.setState({ data: fullConfig.defaultData, error: null })
      }
    }

    componentDidMount () {
      this.fetchData()
    }

    componentDidUpdate (prevProps, prevState, snapshot) {
      if (fullConfig.shouldUpdate(prevProps, this.props)) {
        this.fetchData()
      }
    }

    componentWillUnmount () {
      this.fetchPromise.cancel()
    }

    render () {
      return (
        <ErrorBoundary>
          <Spinner loading={_.values(this.state).every(_.isNil)} />
          <ErrorAlert error={this.state.error} />
          {this.state.data && <WrappedComponent data={this.state.data} reload={this.fetchData} {...this.props} />}
        </ErrorBoundary>
      )
    }
  }
}
