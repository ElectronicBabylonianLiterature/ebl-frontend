import React, { useState } from 'react'
import _ from 'lodash'
import { Link } from 'react-router-dom'
import DisplayToken from 'transliteration/ui/DisplayToken'
import { GlossaryToken } from 'transliteration/domain/glossary'
import { Label, statusAbbreviation } from 'transliteration/domain/labels'
import DictionaryWord from 'dictionary/domain/Word'
import lineNumberToString from 'transliteration/domain/lineNumberToString'
import {
  createLemmaMap,
  LemmaMap,
  LineLemmasContext,
} from './LineLemmasContext'
import WordInfoWithPopover from 'transliteration/ui/WordInfo'

export default function GlossaryLine({
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
  const [lemmaMap, lemmaSetter] = useState<LemmaMap>(
    createLemmaMap(tokens.map((token) => token.uniqueLemma))
  )

  return (
    <LineLemmasContext.Provider
      value={{
        lemmaMap: lemmaMap,
        lemmaSetter: lemmaSetter,
      }}
    >
      <span className="Transliteration">
        {word && (
          <WordInfoWithPopover word={word}>
            <DisplayToken token={word} />
          </WordInfoWithPopover>
        )}
      </span>
      {_(tokens)
        .map('label')
        .uniq()
        .map((label, index) => (
          <React.Fragment key={index}>
            {index > 0 ? ', ' : ' ('}
            {_.compact([label.object, label.surface, label.column])
              .map((singleLabel, index) => (
                <GlossaryLabel key={index} label={singleLabel} />
              ))
              .concat(
                <React.Fragment key="line number">
                  {label.line && lineNumberToString(label.line)}
                </React.Fragment>
              )}
          </React.Fragment>
        ))
        .value()}
      )
    </LineLemmasContext.Provider>
  )
}

function GlossaryLabel({
  label: { abbreviation, status },
}: {
  label: Label
}): JSX.Element {
  return (
    <>
      {abbreviation}
      {status && <sup>{status.map(statusAbbreviation)}</sup>}{' '}
    </>
  )
}
