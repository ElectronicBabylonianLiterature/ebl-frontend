import React from 'react'
import { Link } from 'react-router-dom'

import User from './auth/User'

import './Header.css'

export default function Header ({ auth }) {
  return (
    <header className='Header'>
      <h1 className='Header__title'>
        <span className='Header__title-main'>electronic<br />Babylonian<br />Literature</span>
        <small className='Header__title-abbreviation'>eBL</small>
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
