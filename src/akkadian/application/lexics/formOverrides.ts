import lemmaRulesMap from 'akkadian/domain/transcription/lemmataRules.json'
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

interface OverrideForms {
  readonly [form: string]: {
    readonly rules?: FormOverrideRules
    readonly isSandhi?: boolean
    readonly isStressless?: boolean
  }
}

interface LemmaRules {
  readonly overrideForms?: OverrideForms
  readonly isSandhi?: boolean
  readonly isStressless?: boolean
}

export interface LemmasRules {
  readonly [uniqueLemma: string]: LemmaRules
}

export interface FormOverride {
  readonly initialForm: string
  readonly overrideForm: string
  readonly transformedForm?: string
  readonly isSandhi?: boolean
  readonly isStressless?: boolean
  readonly rules?: FormOverrideRules
  readonly transformations?: Transformations
}

const lemmasRules: LemmasRules = lemmaRulesMap ?? {}

function ruleToRegex(rule: string): string {
  return rule
    .replaceAll('C', consonantRegex)
    .replaceAll('A', allARegex)
    .replaceAll('E', allERegex)
    .replaceAll('I', allIRegex)
    .replaceAll('U', allURegex)
}

function isRuleApplicable(
  rules: FormOverrideRules,
  phoneticProps?: PhoneticProps
): boolean {
  if (rules.nextWordBeginsWith && phoneticProps?.wordContext?.nextWord) {
    const regexp = new RegExp(
      `^(${ruleToRegex(rules.nextWordBeginsWith)}).*`,
      'g'
    )
    return regexp.test(phoneticProps.wordContext.nextWord.cleanValue)
  }
  return false
}

export function getFormOverrideAndTransform(
  initialForm: string,
  uniqueLemma: string,
  phoneticProps: PhoneticProps
): FormOverride | null {
  const lemmaRules = lemmasRules[uniqueLemma]
  let overrideForm = initialForm
  let isStressless = lemmaRules?.isStressless
  let isSandhi = lemmaRules?.isSandhi
  let rules: FormOverrideRules | undefined
  if (lemmaRules.overrideForms) {
    const { overrideForms } = lemmaRules
    Object.keys(overrideForms).forEach((_form) => {
      const formProps = overrideForms[_form]
      if (formProps.rules && isRuleApplicable(formProps.rules, phoneticProps)) {
        overrideForm = _form
        rules = formProps.rules
        isStressless =
          formProps.isSandhi ||
          (isStressless && formProps.isStressless !== false)
        isSandhi =
          formProps.isSandhi || (isSandhi && formProps.isSandhi !== false)
      }
    })
  }

  if (isStressless || isSandhi || rules) {
    const transformations = getSandhiTransformations(
      overrideForm,
      phoneticProps
    )
    return {
      initialForm: initialForm,
      overrideForm: overrideForm,
      ...(transformations
        ? {
            transformedForm: transformations.transformedForm,
            transformations: transformations,
          }
        : {}),
      ...(isSandhi ? { isSandhi } : {}),
      ...(isStressless ? { isStressless } : {}),
      ...(rules ? { rules } : {}),
    }
  }
  return null
}
