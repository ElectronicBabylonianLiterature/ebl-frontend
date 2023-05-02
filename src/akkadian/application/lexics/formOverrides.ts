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

interface OverrideFormProps {
  readonly rules?: FormOverrideRules
  readonly isSandhi?: boolean
  readonly isStressless?: boolean
}
interface OverrideForms {
  readonly [form: string]: OverrideFormProps
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
  readonly isMidSyllableSandhi?: boolean
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

function isOverrideApplicable(
  overrideFormProps: OverrideFormProps,
  phoneticProps: PhoneticProps
): boolean {
  const { rules } = overrideFormProps
  return (
    !!overrideFormProps || (!!rules && isRuleApplicable(rules, phoneticProps))
  )
}

function getOverrideFormBooleanParam(
  lemmaRules: LemmaRules,
  overrideFormProps: OverrideFormProps,
  param: 'isStressless' | 'isSandhi'
): boolean {
  return !!(lemmaRules[param] || overrideFormProps[param])
}

function isMidSyllableSandhi(isSandhi: boolean, form: string): boolean {
  return isSandhi && /`(^${consonantRegex}$)|(${consonantRegex}+$)`/.test(form)
}

export function getFormOverrideAndTransform(
  initialForm: string,
  uniqueLemma: string,
  phoneticProps: PhoneticProps = {}
): FormOverride | null {
  const { overrideForm, rules, isStressless, isSandhi, isMidSyllableSandhi } = {
    ...getOverrideData(uniqueLemma, phoneticProps),
  }
  if (overrideForm) {
    const transformations = getSandhiTransformations(
      overrideForm,
      phoneticProps
    )
    return {
      initialForm,
      overrideForm,
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
  return null
}

function getOverrideData(
  uniqueLemma: string,
  phoneticProps: PhoneticProps
):
  | {
      overrideForm: string
      rules?: FormOverrideRules
      isStressless?: boolean
      isSandhi?: boolean
      isMidSyllableSandhi?: boolean
    }
  | undefined {
  const lemmaRules = lemmasRules[uniqueLemma]
  if (lemmaRules?.overrideForms) {
    const { overrideForms } = lemmaRules
    for (const form of Object.keys(overrideForms)) {
      const overrideFormProps = overrideForms[form]
      if (isOverrideApplicable(overrideFormProps, phoneticProps)) {
        const _isSandhi = getOverrideFormBooleanParam(
          lemmaRules,
          overrideFormProps,
          'isSandhi'
        )
        return {
          overrideForm: form,
          rules: overrideFormProps.rules,
          isStressless: getOverrideFormBooleanParam(
            lemmaRules,
            overrideFormProps,
            'isStressless'
          ),
          isSandhi: _isSandhi,
          isMidSyllableSandhi: isMidSyllableSandhi(_isSandhi, form),
        }
      }
    }
  }
}
