import React from 'react'
import { FormGroup } from 'react-bootstrap'

import List from 'common/List'
import TextInput from './TextInput'
import { OraccWord } from 'dictionary/domain/Word'

interface Props {
  value: readonly OraccWord[]
  onChange: (value: readonly OraccWord[]) => void
}

export default function OraccWordsList({
  value,
  onChange,
}: Props): JSX.Element {
  return (
    <FormGroup>
      <List
        label="Oracc words"
        value={value}
        onChange={onChange}
        noun="Oracc word"
        defaultValue={{ lemma: '', guideWord: '' }}
      >
        {(
          word: OraccWord,
          onChange: (value: OraccWord) => void,
        ): JSX.Element => (
          <>
            <TextInput
              onChange={(value: string): void =>
                onChange({ ...word, lemma: value })
              }
              value={word.lemma}
            >
              Lemma
            </TextInput>
            <TextInput
              onChange={(value: string): void =>
                onChange({ ...word, guideWord: value })
              }
              value={word.guideWord}
            >
              Guide word
            </TextInput>
          </>
        )}
      </List>
    </FormGroup>
  )
}
