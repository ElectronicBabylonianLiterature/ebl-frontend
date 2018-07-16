import React from 'react'

export default function CdliLink ({cdliNumber, children}) {
  const cdliUrl = `https://cdli.ucla.edu/${cdliNumber}`
  return (
    <a href={cdliUrl}>{children}</a>
  )
}
