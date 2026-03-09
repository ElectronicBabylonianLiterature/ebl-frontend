import React from 'react'
import { Form, Row, Col } from 'react-bootstrap'
import withData from 'http/withData'
import Select from 'react-select'
import _ from 'lodash'
import WordService from 'dictionary/application/WordService'
import { QueryType } from 'query/FragmentQuery'
import Word from 'dictionary/domain/Word'
import { LemmaOption } from 'fragmentarium/ui/lemmatization/LemmaSelectionForm'
import LemmaSelectionForm from 'fragmentarium/ui/lemmatization/LemmaSelectionForm'
import { HelpCol, LemmaSearchHelp } from 'fragmentarium/ui/SearchHelp'
import { helpColSize } from 'fragmentarium/ui/SearchForm'

interface LemmaSearchFormGroupProps {
  lemmas: string | null
  lemmaOperator: QueryType | null
  onChange: (name: string) => (value: string) => void
  onChangeLemmaOperator: (value: QueryType) => void
  wordService: WordService
}

function createOptions(
  lemmaIds: string[],
  words: readonly Word[],
): LemmaOption[] {
  const lemmaMap: ReadonlyMap<string, Word> = new Map(
    words.map((word) => [word._id, word]),
  )

  return _.compact(
    lemmaIds.map((lemma) =>
      _.isNil(lemmaMap.get(lemma))
        ? null
        : new LemmaOption(lemmaMap.get(lemma) as Word),
    ),
  )
}

const LemmaSearchFormGroup = withData<
  LemmaSearchFormGroupProps,
  { wordService: WordService; lemmas: string | null },
  LemmaOption[]
>(
  ({
    data,
    lemmas,
    lemmaOperator,
    onChange,
    onChangeLemmaOperator,
    wordService,
  }) => {
    const lemmaOptions: Record<QueryType, string> = {
      line: 'Same line',
      phrase: 'Exact phrase',
      and: 'Same text',
      or: 'Anywhere',
    }

    return (
      <Form.Group as={Row} controlId="lemmas" className="align-items-center">
        <HelpCol overlay={LemmaSearchHelp()} />
        <Col sm={12 - helpColSize}>
          <Row className="g-0 align-items-center">
            <Col sm={8}>
              <LemmaSelectionForm
                wordService={wordService}
                onChange={(query) => {
                  onChange('lemmas')(
                    query.map((lemma) => lemma.value).join('+'),
                  )
                }}
                query={data}
              />
            </Col>
            <Col sm={4}>
              <Select<{ value: QueryType; label: string }, false>
                aria-label="Select lemma query type"
                options={Object.entries(lemmaOptions).map(([value, label]) => ({
                  value: value as QueryType,
                  label: label,
                }))}
                value={{
                  value: lemmaOperator || 'line',
                  label: lemmaOptions[lemmaOperator || 'line'],
                }}
                onChange={(event) =>
                  onChangeLemmaOperator((event?.value || 'line') as QueryType)
                }
                className={'SearchForm__select script-selection__selection'}
                classNamePrefix="search-form-select"
              />
            </Col>
          </Row>
        </Col>
      </Form.Group>
    )
  },
  ({ wordService, lemmas }) => {
    const lemmaIds = lemmas ? lemmas.split('+') : []
    return wordService
      .findAll(lemmaIds)
      .then(_.partial(createOptions, lemmaIds))
  },
  {
    filter: (props) => !_.isNil(props.lemmas) && props.lemmas !== '',
    defaultData: () => [],
  },
)

export default LemmaSearchFormGroup
