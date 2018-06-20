import React, { Component, Fragment } from 'react'
import { Form, Input, Checkbox, Button, Layout } from 'element-react'
import _ from 'lodash'

class Forms extends Component {
  render () {
    return (
      <Form.Item label='Forms'>
        {this.props.value.map((form, index) =>
          <Form.Item key={index}>
            {_.isString(form) ? (
              <span>{form}</span>
            ) : (
              <Fragment>
                <Form.Item>
                  <Layout.Col span='4'>
                    <Form.Item label='Attested'>
                      <Checkbox checked={form.attested} />
                    </Form.Item>
                  </Layout.Col>
                  <Layout.Col span='12'>
                    <Form.Item label='Lemma'>
                      <Input value={form.lemma.join(' ')} />
                    </Form.Item>
                  </Layout.Col>
                </Form.Item>
                <Form.Item label='Notes'>
                  {form.notes.map((note, index) =>
                    <Form.Item key={index}>
                      <Input className='WordForm-notes_note' value={note} />
                      <Button className='WordForm-notes_delete'>Delete note</Button>
                    </Form.Item>
                  )}
                  <Button>Add note</Button>
                </Form.Item>
              </Fragment>
            )}
            <Button>Delete form</Button>
          </Form.Item>
        )}
        <Button>Add form</Button>
      </Form.Item>
    )
  }
}

export default Forms
