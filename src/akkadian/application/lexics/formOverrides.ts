import lemmaPropsMap from 'akkadian/domain/transcription/lemmataRules.json'
import { PhoneticProps } from 'akkadian/application/phonetics/segments'
import {
  allARegex,
  allERegex,
  allIRegex,
  allURegex,
  consonantRegex,
} from 'akkadian/domain/transcription/transcription'
import {
  Transformations,
  getSandhiTransformations,
} from 'akkadian/application/phonetics/transformations'

enum CONDITION {
  NEXTWORDBEGINSWITH = 'nextWordBeginsWith',
}

type FormOverrideRules = {
  readonly [key in CONDITION]?: string
}

interface OverrideFormProps {
  readonly rules?: FormOverrideRules
  readonly isSandhi?: boolean
  readonly isStressless?: boolean
}
interface OverrideForms {
  readonly [form: string]: OverrideFormProps
}

interface LemmaProps {
  readonly overrideForms?: OverrideForms
  readonly isSandhi?: boolean
  readonly isStressless?: boolean
}

export interface LemmasRules {
  readonly [uniqueLemma: string]: LemmaProps
}

export interface FormOverride {
  readonly initialForm: string
  readonly overrideForm: string
  readonly transformedForm?: string
  readonly isSandhi?: boolean
  readonly isStressless?: boolean
  readonly isMidSyllableSandhi?: boolean
  readonly rules?: FormOverrideRules
  readonly transformations?: Transformations
}

const lemmasRules: LemmasRules = lemmaPropsMap ?? {}

interface OverrideData {
  overrideForm?: string
  rules?: FormOverrideRules
  isStressless?: boolean
  isSandhi?: boolean
  isMidSyllableSandhi?: boolean
}

function ruleToRegex(rule: string): string {
  return rule
    .replaceAll('C', consonantRegex)
    .replaceAll('A', allARegex)
    .replaceAll('E', allERegex)
    .replaceAll('I', allIRegex)
    .replaceAll('U', allURegex)
}

function isRuleApplicable(
  rules?: FormOverrideRules,
  phoneticProps?: PhoneticProps,
): boolean {
  if (rules?.nextWordBeginsWith && phoneticProps?.wordContext?.nextWord) {
    const regexp = new RegExp(
      `^(${ruleToRegex(rules.nextWordBeginsWith)}).*`,
      'g',
    )
    return regexp.test(phoneticProps.wordContext.nextWord.cleanValue)
  }
  return false
}

function isOverrideApplicable(
  overrideFormProps: OverrideFormProps,
  phoneticProps: PhoneticProps,
): boolean {
  const { rules } = overrideFormProps
  return (
    (!!overrideFormProps && !rules) ||
    (!!rules && isRuleApplicable(rules, phoneticProps))
  )
}

function getOverrideFormBooleanProp(
  lemmaProps: LemmaProps,
  overrideFormProps: OverrideFormProps,
  prop: 'isStressless' | 'isSandhi',
): boolean {
  return !!lemmaProps[prop] || !!overrideFormProps[prop] === true
}

const MidSyllableSandhiRegexp = new RegExp(
  `(^${consonantRegex}$)|(${consonantRegex}{2,}$)`,
)

function isMidSyllableSandhi(isSandhi: boolean, form: string): boolean {
  return isSandhi && MidSyllableSandhiRegexp.test(form)
}

export function getFormOverrideAndTransform(
  initialForm: string,
  uniqueLemma: string,
  phoneticProps: PhoneticProps = {},
): FormOverride | undefined {
  const { overrideForm, rules, isStressless, isSandhi, isMidSyllableSandhi } = {
    ...getOverrideData(uniqueLemma, initialForm, phoneticProps),
  }
  if (overrideForm || isStressless || isSandhi) {
    const transformations = getSandhiTransformations(
      overrideForm ?? initialForm,
      phoneticProps,
    )
    return {
      initialForm,
      overrideForm:
        transformations?.transformedForm ?? overrideForm ?? initialForm,
      ...(transformations && {
        transformedForm: transformations.transformedForm,
        transformations,
      }),
      isSandhi,
      isMidSyllableSandhi,
      isStressless,
      rules,
    }
  }
}

function getOverrideData(
  uniqueLemma: string,
  initialForm: string,
  phoneticProps: PhoneticProps,
): OverrideData | undefined {
  const lemmaProps = lemmasRules[uniqueLemma]
  if (lemmaProps?.overrideForms) {
    const { overrideForms } = lemmaProps
    for (const form of Object.keys(overrideForms)) {
      const overrideFormProps = overrideForms[form]
      if (isOverrideApplicable(overrideFormProps, phoneticProps)) {
        const isSandhi = getOverrideFormBooleanProp(
          lemmaProps,
          overrideFormProps,
          'isSandhi',
        )
        return {
          overrideForm: form,
          rules: overrideFormProps.rules,
          isStressless: getOverrideFormBooleanProp(
            lemmaProps,
            overrideFormProps,
            'isStressless',
          ),
          isSandhi,
          isMidSyllableSandhi: isMidSyllableSandhi(isSandhi, form),
        }
      }
    }
    return getOverrideDataNoForm(initialForm, lemmaProps)
  }
}

function getOverrideDataNoForm(
  initialForm: string,
  lemmaProps: LemmaProps,
): OverrideData {
  const isSandhi = getOverrideFormBooleanProp(lemmaProps, {}, 'isSandhi')
  return {
    isStressless: getOverrideFormBooleanProp(lemmaProps, {}, 'isStressless'),
    isSandhi,
    isMidSyllableSandhi: isMidSyllableSandhi(isSandhi, initialForm),
  }
}
