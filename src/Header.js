import React from 'react'
import { Navbar, Nav } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'
import _ from 'lodash'

import User from './auth/User'

import './Header.css'

export default function Header ({ auth }) {
  const id = _.uniqueId('Header-')
  return (
    <header className='Header'>
      <Navbar variant='light' expand='md'>
        <Navbar.Brand>
          <h1 className='Header__title'>
            <span className='Header__title-main'>electronic<br />Babylonian<br />Literature</span>
            <small className='Header__title-abbreviation'>eBL</small>
          </h1>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls={id} />
        <Navbar.Collapse id={id}>
          <Nav>
            <Nav.Item><LinkContainer to='/'><Nav.Link>Home</Nav.Link></LinkContainer></Nav.Item>
            <Nav.Item><LinkContainer to='/dictionary'><Nav.Link>Dictionary</Nav.Link></LinkContainer></Nav.Item>
            <Nav.Item><LinkContainer to='/fragmentarium'><Nav.Link>Fragmentarium</Nav.Link></LinkContainer></Nav.Item>
          </Nav>
        </Navbar.Collapse>
        <Navbar.Text>
          <User auth={auth} />
        </Navbar.Text>
      </Navbar>
    </header>
  )
}
