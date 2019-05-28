import React, { Fragment } from 'react'
import { Badge } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { Map } from 'immutable'
import TransliterationHeader from 'fragmentarium/view/TransliterationHeader'
import SessionContext from 'auth/SessionContext'

import './Display.css'

function Display ({ fragment }) {
  return (
    <Fragment>
      <TransliterationHeader fragment={fragment} />
      <ol className='Display__lines'>
        {fragment.atf.split('\n').map((line, index) => (
          <li key={index}>{line}</li>
        ))}
      </ol>
      <SessionContext.Consumer>
        {session =>
          session.hasBetaAccess() && (
            <section>
              <h4>
                Glossary{' '}
                <small>
                  <Badge variant='warning'>Beta</Badge>
                </small>
              </h4>
              {fragment.text.lines
                .map(line =>
                  line.content
                    .filter(token => token.get('lemmatizable'))
                    .map(token =>
                      Map({
                        number: line.prefix,
                        value: token.get('value'),
                        uniqueLemma: token.get('uniqueLemma')
                      })
                    )
                )
                .flatten(1)
                .filter(token => !token.get('uniqueLemma').isEmpty())
                .groupBy(token => token.get('uniqueLemma'))
                .toOrderedMap()
                .sortBy((tokensByLemma, lemma) => lemma.first())
                .map((tokensByLemma, lemma) => (
                  <div key={lemma.join(' ')}>
                    {lemma.map(l => (
                      <span>
                        {' '}
                        <Link to={`/dictionary/${l}`}>{l}</Link>
                      </span>
                    ))}
                    {': '}
                    {tokensByLemma
                      .groupBy(token => token.get('value'))
                      .map(
                        (tokensByValue, value) =>
                          value +
                          ' (' +
                          tokensByValue
                            .map(token => token.get('number'))
                            .join(', ') +
                          ')'
                      )
                      .join(', ')}
                  </div>
                ))
                .toList()}
            </section>
          )
        }
      </SessionContext.Consumer>
    </Fragment>
  )
}

export default Display
