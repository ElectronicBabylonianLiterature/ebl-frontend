import React, { Component } from 'react'
import { Form, Input, Button } from 'element-react'

class WordSearch extends Component {
  render () {
    return (
      <Form inline>
        <Form.Item>
          <Input placeholder='lemma' />
        </Form.Item>
        <Form.Item>
          <Input placeholder='homonym' />
        </Form.Item>
        <Form.Item>
          <Button nativeType='submit' type='primary'>Query</Button>
        </Form.Item>
      </Form>
    )
  }
};

export default WordSearch
