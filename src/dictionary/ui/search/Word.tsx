import React, { Component, Fragment, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import _ from 'lodash'
import './Word.css'
import Word from 'dictionary/domain/Word'
import { Markdown } from 'dictionary/ui/display/WordDisplayParts'

function Lemma({
  container = 'em',
  word,
}: {
  container: string
  word: Word
}): JSX.Element {
  const attested = word.attested === false ? '*' : ''
  const lemma = word.lemma.join(' ')
  return (
    <Fragment>
      {word._id
        ? React.createElement(
            container,
            {},
            <Link to={`/dictionary/${word._id}`}>
              {attested}
              {lemma}
            </Link>
          )
        : React.createElement(container, {}, `${attested}${lemma}`)}
      {word.homonym && <Markdown text={` ${word.homonym}`} />}
    </Fragment>
  )
}

function Notes({
  notes,
  children,
}: {
  notes: readonly string[]
  children: ReactNode
}): JSX.Element {
  const preNote = _.head(notes) || ''
  const postNote = _.tail(notes).join(' ')
  return (
    <Fragment>
      {!_.isEmpty(preNote) && (
        <span className="Notes-note">
          <Markdown text={preNote as string} />{' '}
        </span>
      )}
      {children}
      {!_.isEmpty(postNote) && (
        <span className="Notes-note">
          {' '}
          <Markdown text={postNote} />
        </span>
      )}
    </Fragment>
  )
}

function Form({ value }: { value: string | Word }): JSX.Element {
  return _.isString(value) ? (
    <Markdown text={value} />
  ) : (
    <Notes notes={value.notes}>
      <Lemma word={value} container="em" />
    </Notes>
  )
}
function AmplifiedMeanings({
  values,
}: {
  values: readonly any[]
}): JSX.Element {
  return (
    <ul>
      {_.map(values, (value, topLevelindex) => (
        <li key={topLevelindex}>
          {value.key !== '' && <strong>{value.key}</strong>}{' '}
          <Markdown text={value.meaning} />{' '}
          <ul>
            {value.entries.map((value, enryIndex) => (
              <li className="AmplifiedMeanings__entry" key={enryIndex}>
                <strong>{`${enryIndex + 1}.`}</strong>{' '}
                <Markdown text={value.meaning} />
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  )
}

function Derived({ derived }: { derived: readonly any[][] }): JSX.Element {
  return (
    <ul>
      {derived.map((group, index) => (
        <li key={index}>
          <ul className="Derived__group">
            {group.map((derived, innerIndex) => (
              <li className="Derived__entry" key={innerIndex}>
                <Form value={derived} />
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  )
}

class WordDisplay extends Component<{ value: Word }> {
  get word(): Word {
    return this.props.value
  }

  get forms(): JSX.Element {
    return (
      <ul className="Word__forms">
        {this.word.forms.map((form, index) => (
          <li key={index} className="Word__form">
            <Form value={form} />
          </li>
        ))}
      </ul>
    )
  }

  isNotEmpty(property: string): boolean {
    return !_.isEmpty(this.word[property])
  }

  render(): JSX.Element {
    return (
      <div className="Word">
        <Link
          to={`/dictionary/${this.props.value._id}/edit`}
          className="BibliographySearch__edit"
        >
          <i className="fas fa-edit" />
        </Link>
        <dfn title={`${this.word.lemma.join(' ')} ${this.word.homonym}`}>
          <Lemma word={this.word} container="strong" />
        </dfn>
        {!_.isEmpty(this.forms) && this.forms}{' '}
        <Markdown text={this.word.meaning} />{' '}
        {this.isNotEmpty('amplifiedMeanings') && (
          <AmplifiedMeanings values={this.word.amplifiedMeanings} />
        )}{' '}
        {this.isNotEmpty('derived') && <Derived derived={this.word.derived} />}{' '}
        {this.word.derivedFrom && (
          <span className="Word__derivedFrom">
            <Form value={this.word.derivedFrom} />
          </span>
        )}
      </div>
    )
  }
}

export default WordDisplay
