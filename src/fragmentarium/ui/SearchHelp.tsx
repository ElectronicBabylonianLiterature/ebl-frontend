import React from 'react'
import _ from 'lodash'
import { Popover, Col } from 'react-bootstrap'
import HelpTrigger from 'common/HelpTrigger'
import { helpColSize } from './SearchForm'

interface HelpPopoverProps {
  title: string
  content: JSX.Element
  id: string
}

function HelpPopover({ title, content, id }: HelpPopoverProps): JSX.Element {
  return (
    <Popover id={id} title={title}>
      <Popover.Content>{content}</Popover.Content>
    </Popover>
  )
}

interface HelpColProps {
  overlay: JSX.Element
}

export function HelpCol({ overlay }: HelpColProps): JSX.Element {
  const uniqueId = _.uniqueId('library-help-')

  return (
    <Col sm={helpColSize}>
      <HelpTrigger
        overlay={
          <Popover id={uniqueId} title={overlay.props.title}>
            <Popover.Content>{overlay.props.content}</Popover.Content>
          </Popover>
        }
      />
    </Col>
  )
}

export const SiglumSearchHelp = (): JSX.Element => (
  <HelpPopover
    title="Search Museum Numbers"
    content={
      <>
        Museum siglum is separated by a period from the number, <br />
        e.g. <code>IM.123455</code>, <code>K.1234.A</code>, and <br />
        <code>1883,0118.486</code>. Use <code>*</code> to search for any value
        for individual elements, e.g. <code>IM.*</code>, <code>K.1234.*</code>,
        <code>*.42</code>.
      </>
    }
    id="siglum-search-help"
  />
)

export const ReferenceSearchHelp = (): JSX.Element => (
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
    id="reference-search-help"
  />
)

export const LemmaSearchHelp = (): JSX.Element => (
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
    id="lemma-search-help"
  />
)

export const TransliterationSearchHelp = (): JSX.Element => (
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
    id="transliteration-search-help"
  />
)

const FilterSearchHelp = (filterType: string): JSX.Element => (
  <HelpPopover
    title={`Search ${filterType}`}
    content={
      <>{`Filter by ${filterType.toLowerCase()} (only takes effect on fragment search)`}</>
    }
    id={`${filterType.toLowerCase()}-search-help`}
  />
)

export const ScriptSearchHelp = (): JSX.Element => FilterSearchHelp('Script')
export const GenreSearchHelp = (): JSX.Element => FilterSearchHelp('Genre')
export const ProvenanceSearchHelp = (): JSX.Element =>
  FilterSearchHelp('Provenance')
export const MuseumSearchHelp = (): JSX.Element => FilterSearchHelp('Museum')
