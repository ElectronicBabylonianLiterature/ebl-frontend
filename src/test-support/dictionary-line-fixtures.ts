import { Factory } from 'fishery'
import Chance from 'chance'
import { periods } from 'corpus/domain/period'
import _ from 'lodash'
import { reconstructionTokens } from 'test-support/test-corpus-text'
import { DictionaryLineDisplay } from 'corpus/domain/chapter'
import { LineDetails, LineVariantDetails } from 'corpus/domain/line-details'
import { manuscriptLineDisplayFactory } from 'test-support/line-details-fixtures'
import {
  lineDisplayDtoFactory,
  lineDisplayFactory,
  textIdFactory,
} from 'test-support/chapter-fixtures'

const defaultChance = new Chance()

export const lineVariantDetailsFactory = Factory.define<
  LineVariantDetails,
  { chance: Chance.Chance }
>(({ associations, transientParams }) => {
  return new LineVariantDetails(
    associations.reconstruction ?? _.cloneDeep(reconstructionTokens),
    null,
    associations.manuscripts ?? manuscriptLineDisplayFactory.buildList(1),
    [],
    []
  )
})

export const dictionaryLineDisplayFactory = Factory.define<
  DictionaryLineDisplay,
  { chance: Chance.Chance }
>(({ associations, transientParams }) => {
  const chance = transientParams.chance ?? defaultChance
  return {
    textId:
      associations.textId ??
      textIdFactory.build({}, { transient: { chance: chance } }),
    textName: associations.textName ?? chance.sentence(),
    chapterName: associations.chapterName ?? chance.sentence(),
    stage: associations.stage ?? chance.pickone([...periods]).name,
    line:
      associations.line ??
      lineDisplayFactory.build({}, { transient: { chance: chance } }),
    lineDetails:
      associations.lineDetails ??
      new LineDetails([new LineVariantDetails([], null, [], [], [])], 0),
  }
})

export const dictionaryLineDisplayDto = {
  textId: textIdFactory.build(),
  textName: 'text name',
  chapterName: 'chapter name',
  stage: 'stage',
  line: lineDisplayDtoFactory.build(),
  lineDetails: {
    variants: lineVariantDetailsFactory.buildList(1),
    activeVariant: 0,
  },
}
