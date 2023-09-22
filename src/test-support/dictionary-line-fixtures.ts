import { Factory } from 'fishery'
import Chance from 'chance'
import { periods } from 'common/period'
import _ from 'lodash'
import { reconstructionTokens } from 'test-support/test-corpus-text'
import {
  DictionaryLineDisplay,
  LineVariantDisplay,
} from 'corpus/domain/chapter'
import { LineDetails } from 'corpus/domain/line-details'
import { manuscriptLineDisplayFactory } from 'test-support/line-details-fixtures'
import {
  lineDisplayDtoFactory,
  lineDisplayFactory,
  textIdFactory,
} from 'test-support/chapter-fixtures'

const defaultChance = new Chance()

export const lineVariantDisplayFactory = Factory.define<
  LineVariantDisplay,
  { chance: Chance.Chance }
>(({ associations }) => ({
  reconstruction:
    associations.reconstruction ?? _.cloneDeep(reconstructionTokens),
  note: associations.note ?? null,
  manuscripts:
    associations.manuscripts ?? manuscriptLineDisplayFactory.buildList(1),
  parallelLines: associations.parallelLines ?? [],
  intertext: associations.intertext ?? [],
  originalIndex: associations.originalIndex ?? 0,
  isPrimaryVariant: associations.isPrimaryVariant ?? true,
}))

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
      new LineDetails(
        [
          lineVariantDisplayFactory.build({
            reconstruction: [],
            manuscripts: [],
          }),
        ],
        0
      ),
  }
})

export const dictionaryLineDisplayDto = {
  textId: textIdFactory.build(),
  textName: 'text name',
  chapterName: 'chapter name',
  stage: 'stage',
  line: lineDisplayDtoFactory.build(),
  lineDetails: {
    variants: lineVariantDisplayFactory.buildList(1),
    activeVariant: 0,
  },
}
