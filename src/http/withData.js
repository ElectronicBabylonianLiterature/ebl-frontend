import React, { Component } from 'react'
import _ from 'lodash'
import Promise from 'bluebird'
import Spinner from 'Spinner'
import ErrorAlert from 'ErrorAlert'
import ErrorBoundary from 'ErrorBoundary'

const defaultConfig = {
  shouldUpdate: () => false,
  filter: () => true,
  defaultData: null
}

export default function withData (WrappedComponent, getter, config = {}) {
  const fullConfig = {
    ...defaultConfig,
    ...config
  }
  return class extends Component {
    fetchPromise = Promise.resolve()

    state = {
      data: null,
      error: null
    }

    fetchData = () => {
      this.fetchPromise.cancel()
      if (fullConfig.filter(this.props)) {
        this.setState({ data: null, error: null })
        this.fetchPromise = getter(this.props)
          .then(data => this.setState({ data: data, error: null }))
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
