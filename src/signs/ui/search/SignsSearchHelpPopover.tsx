import { Popover } from 'react-bootstrap'
import _ from 'lodash'
import React from 'react'
import signSearchHelpList from './signSearchHelpList.json'

export default function SignsSearchHelp(): JSX.Element {
  const Section = ({ label, text }: { label: string; text: string }) => (
    <li className="Help__list">
      <div className="Help__list-name">{label}</div>
      <div>&nbsp;=&nbsp;</div>
      <div className="ml-2">{text}</div>
    </li>
  )
  return (
    <Popover
      id={_.uniqueId('SignsSearchHelp-')}
      title="Search transliterations"
      className="Help__popover"
    >
      <Popover.Content>
        <ul>
          {signSearchHelpList.map((help, index) => (
            <Section key={index} label={help[0]} text={help[1]} />
          ))}
        </ul>
      </Popover.Content>
    </Popover>
  )
}
