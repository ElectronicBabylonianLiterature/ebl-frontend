import React, { Component } from 'react'
import { Form, Input, Button } from 'element-react'

class WordSearch extends Component {
  constructor (props) {
    super(props)

    this.state = {
      form: {
        lemma: '',
        homonym: ''
      }
    }
  }

  onChange (key, value) {
    this.setState({
      form: Object.assign(this.state.form, { [key]: value })
    })
  }

  submit (e) {
    e.preventDefault()
    fetch(`http://localhost:8000/words/${this.state.form.lemma}/${this.state.form.homonym}`)
      .then(response => response.json())
      .then(this.props.onResponse)
  }

  render () {
    return (
      <Form inline model={this.state.form} onSubmit={this.submit.bind(this)}>
        <Form.Item prop='lemma'>
          <Input placeholder='lemma' onChange={this.onChange.bind(this, 'lemma')} />
        </Form.Item>
        <Form.Item prop='homonym'>
          <Input placeholder='homonym' onChange={this.onChange.bind(this, 'homonym')} />
        </Form.Item>
        <Form.Item>
          <Button nativeType='submit' type='primary'>Query</Button>
        </Form.Item>
      </Form>
    )
  }
}

export default WordSearch
