import React, { Component } from 'react';
import { Form } from 'element-react';
import { Input } from 'element-react';
import { Button } from 'element-react';

class WordSearch extends Component {
  render() {
    return (
      <Form inline={true}>
        <Form.Item>
          <Input placeholder="lemma"></Input>
        </Form.Item>
        <Form.Item>
          <Input placeholder="homonym"></Input>
        </Form.Item>
        <Form.Item>
          <Button nativeType="submit" type="primary">Query</Button>
        </Form.Item>
      </Form>
    );
  }
};

export default WordSearch;
