import React from 'react'
import { Popover } from 'react-bootstrap'
import _ from 'lodash'

export default function LemmatizationHelp () {
  return (
    <Popover id={_.uniqueId('LemmatizationHelp-')} title='Lemmatization Help'>
      <p>
        The lemmatization follows the{' '}
        <code>Concise Dictionary of Akkadian.</code>
      </p>
      <p>
        Automatically entered lemmata are marked in red. After revising them,
        press <code>Save</code> to consolidate them.
      </p>
      <p>
        The lemmatization dialogue is insensitive to special characters:{' '}
        <code> s </code>=<code>s, ṣ, š;</code> <code> a </code> ={' '}
        <code>a, ā, â.</code>
      </p>
      <p>
        Statives should be lemmatized under the infinitive (<code>par-sat</code>{' '}
        → <code> parāsu I</code>)
      </p>
      <p>
        Most participles have independent entries (so <code>pa-ri-su</code> →{' '}
        <code>pārisu</code>). If they don’t, lemmatize them under the infinitive
        (<code>ta-bi-ku</code> → <code>tabāku</code>, since there is no{' '}
        <code>tābiku</code>).
      </p>
    </Popover>
  )
}
