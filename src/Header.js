import React from 'react'
import { Nav, Navbar, Container } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'
import _ from 'lodash'

import User from './auth/User'

import './Header.css'

function NavItem (props) {
  return <Nav.Item><LinkContainer to={props.href}><Nav.Link>{props.title}</Nav.Link></LinkContainer></Nav.Item>
}

export default function Header ({ auth }) {
  const id = _.uniqueId('Header-')
  return (
    <header className='Header'>
      <Navbar variant='light' expand='md'>
        <Container>
          <LinkContainer to='/' title='electronic Babylonian Literature (eBL)'>
            <Navbar.Brand>
              <h1 className='Header__title'>
                <span className='Header__title-main'>electronic<br />Babylonian<br />Literature</span>
                <small className='Header__title-abbreviation'>eBL</small>
              </h1>
            </Navbar.Brand>
          </LinkContainer>
          <Navbar.Collapse id={id}>
            <Nav className='mx-auto'>
              <NavItem href='/dictionary' title='Dictionary' />
              <NavItem href='/corpus' title='Corpus' />
              <NavItem href='/fragmentarium' title='Fragmentarium' />
              <NavItem href='/bibliography' title='Bibliography' />
            </Nav>
            <Navbar.Text>
              <User auth={auth} />
            </Navbar.Text>
          </Navbar.Collapse>
          <Navbar.Toggle aria-controls={id} />
        </Container>
      </Navbar>
    </header>
  )
}
