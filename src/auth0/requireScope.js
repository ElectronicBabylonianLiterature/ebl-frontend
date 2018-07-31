import React from 'react'
import PropTypes from 'prop-types'
import Auth from 'auth0/Auth'

export default function requireScope (Component, scope) {
  const WrappedComponent = props => props.auth.hasScope(scope) && <Component {...props} />
  WrappedComponent.propTypes = {
    auth: PropTypes.instanceOf(Auth)
  }
  return WrappedComponent
}
