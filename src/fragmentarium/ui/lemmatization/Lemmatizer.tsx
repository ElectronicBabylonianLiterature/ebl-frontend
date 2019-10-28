import React, { Component, Fragment } from 'react'
import { Button } from 'react-bootstrap'
import _ from 'lodash'
import HelpTrigger from 'common/HelpTrigger'
import WordLemmatizer from './WordLemmatizer'
import withData, { WithoutData } from 'http/withData'
import Lemmatization from 'fragmentarium/domain/Lemmatization'

import LemmatizationHelp from './LemmatizationHelp'

import './Lemmatizer.css'
import { Text } from 'fragmentarium/domain/text';


type Props = {
  data: Lemmatization;
  fragmentService;
  updateLemmatization(lemmatization: Lemmatization): any;
  disabled?: boolean;
}
type State = {lemmatization: Lemmatization}

class Lemmatizer extends Component<Props, State> {
  static readonly defaultProps = {
    disabled: false
  }
  constructor(props: Props) {
    super(props)
    this.state = {
      lemmatization: _.cloneDeep(props.data)
    }
  }

  get hasNoChanges() {
    return (
      _.isEqual(this.state.lemmatization.tokens, this.props.data.tokens) &&
      !this.state.lemmatization.tokens.some(row =>
        row.some(token => token.suggested)
      )
    )
  }

  Row = ({ rowIndex, row }) => (
    <Fragment>
      {this.state.lemmatization.getRowPrefix(rowIndex)}{' '}
      {row.map((token, columnIndex) => (
        <Fragment key={columnIndex}>
          <WordLemmatizer
            fragmentService={this.props.fragmentService}
            token={token}
            onChange={_.partial(this.setLemma, rowIndex, columnIndex)}
          />{' '}
        </Fragment>
      ))}
    </Fragment>
  )

  SubmitButton = () => (
    <Button
      onClick={this.submit}
      disabled={this.props.disabled || this.hasNoChanges}
      variant="primary"
    >
      Save
    </Button>
  )

  setLemma = (rowIndex, columnIndex, uniqueLemma) => {
    this.setState({
      lemmatization: this.state.lemmatization.setLemma(
        rowIndex,
        columnIndex,
        uniqueLemma
      )
    })
  }

  submit = () => {
    this.props.updateLemmatization(this.state.lemmatization)
  }

  render() {
    return (
      <>
        <ol className="Lemmatizer__transliteration">
          {this.state.lemmatization.tokens.map((row, rowIndex) => (
            <li key={rowIndex} className="Lemmatizer__row">
              <this.Row rowIndex={rowIndex} row={row} />
            </li>
          ))}
        </ol>
        <HelpTrigger overlay={LemmatizationHelp()} /> <this.SubmitButton />
      </>
    )
  }
}

export default withData<WithoutData<Props>, {text: Text}, Lemmatization>(
  Lemmatizer,
  props =>
    props.fragmentService
      .createLemmatization(props.text)
      .then((lemmatization: Lemmatization) => lemmatization.applySuggestions()),
  {
    watch: props => [props.text]
  }
)
