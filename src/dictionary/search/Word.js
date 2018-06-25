import React, { Component, Fragment } from 'react'
import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import _ from 'lodash'
import './Word.css'

class InlineMarkdown extends Component {
  render () {
    return <ReactMarkdown className='InlineMarkdown' source={this.props.source} disallowedTypes={['paragraph']} unwrapDisallowed />
  }
}

class Lemma extends Component {
  render () {
    const container = this.props.container || 'em'
    const attested = this.props.value.attested === false ? '*' : ''
    const lemma = this.props.value.lemma.join(' ')
    return (
      <Fragment>
        {this.props.value._id
          ? React.createElement(container, {}, <Link to={`/dictionary/${this.props.value._id}`}>{attested}{lemma}</Link>)
          : React.createElement(container, {}, `${attested}${lemma}`)
        }
        {' '}
        {this.props.value.homonym}
      </Fragment>
    )
  }
}

class Notes extends Component {
  render () {
    const preNote = _.head(this.props.value)
    const postNote = _.tail(this.props.value).join(' ')
    return (
      <Fragment>
        {!_.isEmpty(preNote) && <span className='Notes-note'><InlineMarkdown source={preNote} /> </span>}
        {this.props.children}
        {!_.isEmpty(postNote) && <span className='Notes-note'> <InlineMarkdown className='Notes-note' source={postNote} /></span>}
      </Fragment>
    )
  }
}

class Form extends Component {
  render () {
    return _.isString(this.props.value) ? (
      <InlineMarkdown source={this.props.value} />
    ) : (
      <Notes value={this.props.value.notes}>
        <Lemma value={this.props.value} container='em' />
      </Notes>
    )
  }
}

class AmplifiedMeanings extends Component {
  render () {
    return (
      <ul className='AmplifiedMeanings'>
        {_.map(this.props.value, (value, topLevelindex) =>
          <li key={topLevelindex}>
            {value.key !== '' && <strong>{value.key}</strong>}
            {' '}
            <InlineMarkdown source={value.meaning} />
            {' '}
            <ul>
              {value.entries.map((value, enryIndex) =>
                <li className='AmplifiedMeanings-entry' key={enryIndex}><strong>{`${enryIndex + 1}.`}</strong> <InlineMarkdown source={value.meaning} /></li>
              )}
            </ul>
          </li>
        )}
      </ul>
    )
  }
}

class Derived extends Component {
  render () {
    return (
      <ul className='Derived'>
        {this.props.value.map((group, index) =>
          <li key={index}><ul className='Derived-group'>{group.map((derived, innerIndex) =>
            <li key={innerIndex}>
              <Form value={derived} />
            </li>
          )}</ul></li>
        )}
      </ul>
    )
  }
}

class Word extends Component {
  get word () {
    return this.props.value
  }

  get forms () {
    return (
      <ul className='Word-forms'>
        {this.word.forms.map((form, index) => <li key={index}><Form value={form} /></li>)}
      </ul>
    )
  }

  render () {
    return (
      <div className='Word'>
        <Lemma value={this.word} container='strong' />
        {!_.isEmpty(this.forms) && this.forms}
        {' '}
        <InlineMarkdown source={this.word.meaning} />
        {' '}
        {!_.isEmpty(this.word.amplifiedMeanings) && <AmplifiedMeanings value={this.word.amplifiedMeanings} /> }
        {' '}
        {!_.isEmpty(this.word.derived) && <Derived value={this.word.derived} />}
        {' '}
        {this.word.derivedFrom && (
          <span className='Word-derivedFrom'>
            <Form className='Word-derivedFrom' value={this.word.derivedFrom} />
          </span>
        )}
      </div>
    )
  }
}

export default Word
