import React from 'react'
import './Footer.sass'
import { NavItem } from 'Header'

export default function Footer(): JSX.Element {
  return (
    <footer className="main-footer">
      <ol className="breadcrumb">
        <NavItem href="/impressum" title="Impressum" as={'li'} />
        <NavItem href="/datenschutz" title="Datenschutz" as={'li'} />
      </ol>
    </footer>
  )
}
