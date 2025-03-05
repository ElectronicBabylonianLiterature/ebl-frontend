import React from 'react'
import _ from 'lodash'
import { Popover } from 'react-bootstrap'

interface HelpPopoverProps {
  title: string
  content: JSX.Element
}

function HelpPopover({ title, content }: HelpPopoverProps): JSX.Element {
  return (
    <Popover
      id={_.uniqueId(`${title.replace(/\s+/g, '')}-`)}
      title={title}
      placement="right"
    >
      <Popover.Content>{content}</Popover.Content>
    </Popover>
  )
}

export function SiglumSearchHelp(): JSX.Element {
  return (
    <HelpPopover
      title="Search Museum Numbers"
      content={
        <>
          Museum siglum is separated by a period from the number, <br />
          e.g. <code>IM.123455</code>, <code>K.1234.A</code>, and <br />
          <code>1883,0118.486</code>. Use <code>*</code> to search for any value
          for individual elements, e.g. <code>IM.*</code>, <code>K.1234.*</code>
          , <code>*.42</code>.
        </>
      }
    />
  )
}

export function ReferenceSearchHelp(): JSX.Element {
  return (
    <HelpPopover
      title="Search References"
      content={
        <>
          Search for Author and Year <br />
          (e.g. <code>George 20</code> or <code>George 2003</code>) or
          Abbreviation (and Number) <br />
          (e.g. <code>BWL</code> or <code>CT 13</code>)
        </>
      }
    />
  )
}

export function LemmaSearchHelp(): JSX.Element {
  return (
    <HelpPopover
      title="Search Lemmas"
      content={
        <>
          Search for fragments containing
          <ul>
            <li>
              All of the lemmata in the same line: <code>Same line</code>
            </li>
            <li>
              All of the lemmata in the same line and in the specified order:{' '}
              <code>Exact phrase</code>
            </li>
            <li>
              All of the lemmata: <code>Same text</code>
            </li>
            <li>
              Any of the lemmata: <code>Anywhere</code>
            </li>
          </ul>
        </>
      }
    />
  )
}

export function TransliterationSearchHelp(): JSX.Element {
  return (
    <HelpPopover
      title="Search Transliterations"
      content={
        <>
          <ul>
            <li>
              Sequences of signs are retrieved regardless of the values entered:
              e.g., <code>me lik</code> will retrieve <code>šip taš</code>,{' '}
              <code>me ur</code>, etc.
            </li>
            <li>
              Signs in consecutive lines can be searched by entering them in
              consecutive lines of the search field.
            </li>
            <li>
              Text with diacritics (e.g. <code>ša₂</code>, <code>á</code>) or
              without them (e.g. <code>sza2</code> or <code>ca2</code>,{' '}
              <code>s,a3</code>, <code>t,a4</code>) can be entered.
            </li>
            <li>
              Accepted Wildcards: <code>?</code> (any one sign); <code>*</code>{' '}
              (any sign or sequence of signs in a line); <code>[a|b]</code>{' '}
              (alternative signs, e.g. <code>[bu|ba]</code>).
            </li>
          </ul>
        </>
      }
    />
  )
}

function FilterSearchHelp(filterType: string): JSX.Element {
  return (
    <HelpPopover
      title={`Search ${filterType}`}
      content={
        <>{`Filter by ${filterType.toLowerCase()} (only takes effect on fragment search)`}</>
      }
    />
  )
}

export function ScriptSearchHelp(): JSX.Element {
  return FilterSearchHelp('Script')
}

export function GenreSearchHelp(): JSX.Element {
  return FilterSearchHelp('Genre')
}

export function ProvenanceSearchHelp(): JSX.Element {
  return FilterSearchHelp('Provenance')
}

export function MuseumSearchHelp(): JSX.Element {
  return FilterSearchHelp('Museum')
}
