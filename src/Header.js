import React from 'react'
import { Link } from 'react-router-dom'

import User from './auth0/User'

import logo from './Electronic_Babylonian_Literature.svg'
import './Header.css'

export default function Header ({auth}) {
  return (
    <header className='Header'>
      <h1 className='Header__title'>
        <img src={logo}
          className='Header__logo'
          alt='Electronic Babylonian Literature (eBL)'
          title='Electronic Babylonian Literature' />
      </h1>
      <nav>
        <ul className='Header__nav'>
          <li className='Header__nav-item'><Link to='/'>Home</Link></li>
          <li className='Header__nav-item'><Link to='/dictionary'>Dictionary</Link></li>
          <li className='Header__nav-item'><Link to='/fragmentarium'>Fragmentarium</Link></li>
          <li className='Header__nav-item'><User auth={auth} /></li>
        </ul>
      </nav>
    </header>
  )
}
