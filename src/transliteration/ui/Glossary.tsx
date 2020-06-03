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
import './Glossary.sass'
import compareWord from 'transliteration/domain/compareWord'
import lineNumberToString from 'transliteration/domain/lineNumberToString'

function Glossary({
  data,
}: {
  data: [string, readonly GlossaryToken[]][]
}): JSX.Element {
  return (
    <section>
      <h4>Glossary</h4>
      {[...data]
        .sort(
          (
            [, [{ dictionaryWord: firstWord }]],
            [, [{ dictionaryWord: secondWord }]]
          ) =>
            compareWord(
              firstWord as DictionaryWord,
              secondWord as DictionaryWord
            )
        )
        .map(([lemma, tokensByLemma]) => (
          <GlossaryEntry key={lemma} tokens={tokensByLemma} />
        ))}
    </section>
  )
}

function GlossaryEntry({
  tokens,
}: {
  tokens: readonly GlossaryToken[]
}): JSX.Element {
  return (
    <div>
      <GlossaryLemma word={tokens[0].dictionaryWord as DictionaryWord} />
      {', '}
      <GlossaryGuideword word={tokens[0].dictionaryWord as DictionaryWord} />
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

function GlossaryLemma({ word }: { word: DictionaryWord }): JSX.Element {
  return (
    <Link to={`/dictionary/${word._id}`}>
      <span className="Glossary__lemma">{word.lemma.join(' ')}</span>
      {word.homonym !== 'I' && (
        <span className="Glossary__homonym"> {word.homonym}</span>
      )}
    </Link>
  )
}

function GlossaryGuideword({ word }: { word: DictionaryWord }): JSX.Element {
  return <>“{word.guideWord}”</>
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
      (
      {tokens
        .map(({ label }) =>
          _.compact([
            label.object?.abbreviation,
            label.surface?.abbreviation,
            label.column?.abbreviation,
            label.line && lineNumberToString(label.line),
          ]).join(' ')
        )
        .join(', ')}
      )
    </>
  )
}

function isDictionaryWord(word: DictionaryWord | null): word is DictionaryWord {
  return word !== null
}

export default withData<
  {},
  { text: Text; wordService: WordService },
  [string, readonly GlossaryToken[]][]
>(Glossary, ({ text, wordService: dictionary }) => {
  return new Promise((resolve, reject) => {
    produce(text.glossary, async (draft) => {
      for (const [, tokens] of draft) {
        for (const token of tokens) {
          const word = await dictionary
            .find(token.uniqueLemma)
            .catch(() => null)
          if (isDictionaryWord(word)) {
            token.dictionaryWord = castDraft(word)
          }
        }
      }
    })
      .then(resolve)
      .catch(reject)
  })
})
