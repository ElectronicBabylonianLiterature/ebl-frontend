import React, { Component } from 'react'
import { Form, Input, Button } from 'element-react'
import _ from 'lodash'

class WordSearch extends Component {
  constructor (props) {
    super(props)

    this.state = {
      form: {
        lemma: ''
      }
    }
  }

  onChange = (key, value) => {
    this.setState({
      form: Object.assign(this.state.form, { [key]: value })
    })
  }

  submit = event => {
    event.preventDefault()
    this.props.httpClient
      .fetchJson(`${process.env.REACT_APP_DICTIONARY_API_URL}/words/search/${this.state.form.lemma}`)
      .then(this.props.onResponse)
      .catch(_.partial(this.props.onResponse, null))
  }

  render () {
    return (
      <Form inline model={this.state.form} onSubmit={this.submit}>
        <Form.Item prop='lemma'>
          <Input placeholder='lemma' onChange={_.partial(this.onChange, 'lemma')} />
        </Form.Item>
        <Form.Item>
          <Button nativeType='submit' type='primary'>Query</Button>
        </Form.Item>
      </Form>
    )
  }
}

export default WordSearch
