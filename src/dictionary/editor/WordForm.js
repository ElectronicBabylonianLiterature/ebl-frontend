import React, { Component, Fragment } from 'react'
import { Form, Input, Checkbox, Button, Select } from 'element-react'
import _ from 'lodash'

import './WordEditor.css'
class WordForm extends Component {
  constructor (props) {
    super(props)

    this.state = {
      word: this.props.value
    }
  }

  render () {
    const positionsOfScpeech = {
      '': 'undefined',
      'AJ': 'adjective',
      'AV': 'adverb',
      'N': 'noun',
      'NU': 'number',
      'V': 'verb',
      'DP': 'demonstrative pronoun',
      'IP': 'independent/anaphoric pronoun',
      'PP': 'possessive pronoun',
      'QP': 'interrogative pronoun',
      'RP': 'reflexive/reciprocal pronoun',
      'XP': 'indefinite pronoun',
      'REL': 'relative pronoun',
      'DET': 'determinative pronoun',
      'CNJ': 'conjunction',
      'J': 'interjection',
      'MOD': 'modal, negative, or conditional particle',
      'PRP': 'preposition',
      'SBJ': 'subjunction'
    }
    const posOptions = _.map(positionsOfScpeech, (value, key) => ({value: key, label: value}))

    return (
      <Form model={this.state.word} >
        <Form.Item label='Lemma'>
          <Input value={this.state.word.lemma.join(' ')} />
        </Form.Item>
        <Form.Item label='Homonym'>
          <Input value={this.state.word.homonym} />
        </Form.Item>
        <Form.Item label='Attested'>
          <Checkbox
            selected={this.state.word.attested} />
        </Form.Item>
        <Form.Item label='POS'>
          <Select value={this.state.word.pos}>
            {posOptions.map(option => <Select.Option key={option.value} label={option.label} value={option.value} />)}
          </Select>
        </Form.Item>
        {this.state.word.roots &&
          <Form.Item label='Roots'>
            {this.state.word.roots.map((wordRoot, index) =>
              <Form.Item key={index}>
                <Input value={wordRoot} />
                <Button>Delete root</Button>
              </Form.Item>
            )}
            <Button>Add root</Button>
          </Form.Item>
        }
        <Form.Item label='Forms'>
          {this.state.word.forms.map((form, index) =>
            _.isString(form) ? (
              <span key={index}>
                {form}
              </span>
            ) : (
              <Form.Item key={index}>
                <Form.Item label='Lemma'>
                  <Input value={form.lemma.join(' ')} />
                </Form.Item>
                <Form.Item label='Attested'>
                  <Checkbox
                    selected={form.attested} />
                </Form.Item>
                <Form.Item label='Notes'>
                  {form.notes.map((note, index) =>
                    <Form.Item key={index}>
                      <Input value={note} />
                      <Button>Delete note</Button>
                    </Form.Item>
                  )}
                  <Button>Add note</Button>
                </Form.Item>
                <Button>Delete form</Button>
              </Form.Item>
            )
          )}
          <Button>Add form</Button>
        </Form.Item>
        <Form.Item label='Meaning'>
          <Input value={this.state.word.meaning} />
        </Form.Item>
        <Form.Item label='Amplified meanings'>
          {_.map(this.state.word.amplifiedMeanings, (amplifiedMeaning, key) =>
            <Form.Item key={key}>
              <Form.Item label='Conjugation/Function'>
                <Input value={key} />
              </Form.Item>
              <Form.Item label='Meaning'>
                <Input value={amplifiedMeaning.meaning} />
              </Form.Item>
              <Form.Item label='Vowels'>
                {amplifiedMeaning.vowels.map((vowel, index) =>
                  <Form.Item key={index}>
                    <Form.Item label='Value'>
                      <Input value={vowel.value.join('/')} />
                    </Form.Item>
                    <Form.Item label='Notes'>
                      {vowel.notes.map((note, index) =>
                        <Form.Item key={index}>
                          <Input value={note} />
                          <Button>Delete note</Button>
                        </Form.Item>
                      )}
                      <Button>Add note</Button>
                    </Form.Item>
                    <Button>Delete vowels</Button>
                  </Form.Item>
                )}
                <Button>Add vowels</Button>
              </Form.Item>
              <Form.Item label='Entries'>
                {_(amplifiedMeaning).pick(key => /\d+\./.test(key)).map((entry, key) =>
                  <Form.Item key={key}>
                    <Form.Item label='Key'>
                      <Input value={key} />
                    </Form.Item>
                    <Form.Item label='Meaning'>
                      <Input value={entry.meaning} />
                    </Form.Item>
                    <Form.Item label='Vowels'>
                      {entry.vowels.map((vowel, index) =>
                        <Form.Item key={index}>
                          <Form.Item label='Value'>
                            <Input value={vowel.value.join('/')} />
                          </Form.Item>
                          <Form.Item label='Notes'>
                            {vowel.notes.map((note, index) =>
                              <Form.Item key={index}>
                                <Input value={note} />
                                <Button>Delete note</Button>
                              </Form.Item>
                            )}
                            <Button>Add note</Button>
                          </Form.Item>
                          <Button>Delete vowels</Button>
                        </Form.Item>
                      )}
                      <Button>Add vowels</Button>
                    </Form.Item>
                    <Button>Delete entry</Button>
                  </Form.Item>
                ).value()}
                <Button>Add entry</Button>
              </Form.Item>
              <Button>Delete amplified meaning</Button>
            </Form.Item>
          )}
          <Button>Add amplified meaning</Button>
        </Form.Item>
        <Form.Item label='Logograms'>
          {_.map(this.state.word.logograms, (logogram, index) =>
            <Form.Item key={index}>
              <Form.Item label='Logogram'>
                <Input value={logogram.logogram.join(' ')} />
              </Form.Item>
              <Form.Item label='Notes'>
                {logogram.notes.map((note, index) =>
                  <Form.Item key={index}>
                    <Input value={note} />
                    <Button>Delete note</Button>
                  </Form.Item>
                )}
                <Button>Add note</Button>
              </Form.Item>
              <Button>Delete Logogram</Button>
            </Form.Item>
          )}
          <Button>Add Logogram</Button>
        </Form.Item>
        <Form.Item label='Derived'>
          {this.state.word.derived.map((group, index) =>
            <Form.Item key={index}>
              {group.map((form, index) =>
                _.isString(form) ? (
                  <span key={index}>
                    {form}
                  </span>
                ) : (
                  <Form.Item key={index}>
                    <Form.Item label='Lemma'>
                      <Input value={form.lemma.join(' ')} />
                    </Form.Item>
                    <Form.Item label='Homonym' >
                      <Input value={form.homonym} />
                    </Form.Item>
                    <Form.Item label='Notes'>
                      {form.notes.map((note, index) =>
                        <Form.Item key={index}>
                          <Input value={note} />
                          <Button>Delete note</Button>
                        </Form.Item>
                      )}
                      <Button>Add note</Button>
                    </Form.Item>
                    <Button>Delete form</Button>
                  </Form.Item>
                )
              )}
              <Button>Add form</Button>
              <Button>Delete group</Button>
            </Form.Item>
          )}
          <Button>Add group</Button>
        </Form.Item>
        <Form.Item label='Derived from'>
          {this.state.word.derivedFrom ? (
            <Fragment>
              <Form.Item label='Lemma'>
                <Input value={this.state.word.derivedFrom.lemma.join(' ')} />
              </Form.Item>
              <Form.Item label='Homonym' >
                <Input value={this.state.word.derivedFrom.homonym} />
              </Form.Item>
              <Form.Item label='Notes'>
                {this.state.word.derivedFrom.notes.map((note, index) =>
                  <Form.Item key={index}>
                    <Input value={note} />
                    <Button>Delete note</Button>
                  </Form.Item>
                )}
                <Button>Add note</Button>
              </Form.Item>
              <Button>Delete derived from</Button>
            </Fragment>
          ) : (
            <Button>Add derived from</Button>
          )}
        </Form.Item>

        <Form.Item>
          <Button nativeType='submit' type='primary'>Save</Button>
        </Form.Item>
      </Form>
    )
  }
}

export default WordForm
