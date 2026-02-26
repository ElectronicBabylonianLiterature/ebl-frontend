import { Popover } from 'react-bootstrap'
import _ from 'lodash'
import React from 'react'
import signSearchHelpList from './signSearchHelpList.json'
import InlineMarkdown from 'common/InlineMarkdown'

export default function SignsSearchHelp(): JSX.Element {
  const Section = ({ label, text }: { label: string; text: string }) => (
    <li className="signs__help__list">
      <div className="signs__help__list__label">{label}</div>
      <div>&nbsp;=&nbsp;</div>
      <div className="ml-2">
        <InlineMarkdown source={text} />
      </div>
    </li>
  )
  return (
    <Popover
      id={_.uniqueId('SignsSearchHelp-')}
      title="Search transliterations"
      className="signs__help__popover"
    >
      <Popover.Body>
        <ul>
          {signSearchHelpList.map((help, index) => (
            <Section key={index} label={help[0]} text={help[1]} />
          ))}
        </ul>
      </Popover.Body>
    </Popover>
  )
}
