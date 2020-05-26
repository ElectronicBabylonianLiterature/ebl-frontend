import React from 'react'
import _ from 'lodash'
import { Link } from 'react-router-dom'
import DisplayToken from 'transliteration/ui/DisplayToken'
import { Text, GlossaryToken } from 'transliteration/domain/text'
import DictionaryWord from 'dictionary/domain/Word'
import withData from 'http/withData'
import { Promise } from 'bluebird'
import WordService from 'dictionary/application/WordService'
import produce, { castDraft } from 'immer'

function Glossary({
  data,
}: {
  data: [readonly string[], readonly GlossaryToken[]][]
}): JSX.Element {
  return (
    <section>
      <h4>Glossary</h4>
      {data.map(([lemma, tokensByLemma]) => (
        <GlossaryEntry
          key={lemma.join(' ')}
          lemma={lemma}
          tokens={tokensByLemma}
        />
      ))}
    </section>
  )
}

function GlossaryEntry({
  lemma,
  tokens,
}: {
  lemma: readonly string[]
  tokens: readonly GlossaryToken[]
}): JSX.Element {
  return (
    <div>
      <GlossaryLemma lemma={lemma} />
      <GlossaryGuideword words={tokens[0].words ?? []} />
      {': '}
      {_(tokens)
        .groupBy((token) => token.value)
        .toPairs()
        .map(([value, tokensByValue], index) => (
          <React.Fragment key={value}>
            {index > 0 && ', '}
            <GlossaryWord tokens={tokensByValue} />
          </React.Fragment>
        ))
        .value()}
    </div>
  )
}

function GlossaryLemma({ lemma }: { lemma: readonly string[] }): JSX.Element {
  return (
    <>
      {lemma.map((l, index) => (
        <span key={index}>
          {' '}
          <Link to={`/dictionary/${l}`}>{l}</Link>
        </span>
      ))}
    </>
  )
}

function GlossaryGuideword({
  words,
}: {
  words: readonly DictionaryWord[]
}): JSX.Element {
  return (
    <>
      {!_.isEmpty(words) && ', '}
      {words.map((word, index) => (
        <span key={index}>
          {index > 0 && ' '}“{word.guideWord}”
        </span>
      ))}
    </>
  )
}

function GlossaryWord({
  tokens,
}: {
  tokens: readonly GlossaryToken[]
}): JSX.Element {
  const word = _.head(tokens)?.word
  return (
    <>
      <span className="Transliteration">
        {word && <DisplayToken token={word} />}
      </span>{' '}
      ({tokens.map((token) => token.number).join(', ')})
    </>
  )
}

function isDictionaryWord(word: DictionaryWord | null): word is DictionaryWord {
  return word !== null
}

export default withData<
  {},
  { text: Text; wordService: WordService },
  [readonly string[], readonly GlossaryToken[]][]
>(Glossary, ({ text, wordService: dictionary }) => {
  return new Promise((resolve, reject) => {
    produce(text.glossary, async (draft) => {
      for (const [, tokens] of draft) {
        for (const token of tokens) {
          const words = await Promise.all(
            token.uniqueLemma.map(
              async (lemma) => await dictionary.find(lemma).catch(() => null)
            )
          )
          token.words = castDraft(words.filter(isDictionaryWord))
        }
      }
    })
      .then(resolve)
      .catch(reject)
  })
})
