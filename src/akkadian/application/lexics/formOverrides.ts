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
  applySandhiTransformations,
} from '../phonetics/transformations'

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
  readonly form?: string
  readonly isSandhi?: boolean
  readonly isStressless?: boolean
  readonly rules?: FormOverrideRules
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

function getFormOverride({
  form,
  isStressless,
  isSandhi,
  rules,
  transformations,
}: {
  form: string
  transformations: Transformations | null
  isStressless?: boolean
  isSandhi?: boolean
  rules?: FormOverrideRules
}): FormOverride {
  return {
    form: form = transformations?.transformedForm ?? form,
    ...(transformations?.transformedForm
      ? { transformedForm: transformations.transformedForm }
      : {}),
    ...(transformations?.record
      ? { transformationsRecord: transformations.record }
      : {}),
    ...(isSandhi ? { isSandhi } : {}),
    ...(isStressless ? { isStressless } : {}),
    ...(rules ? { rules } : {}),
  }
}

export function getLemmaOverrideAndTransform(
  initialForm: string,
  uniqueLemma: string,
  phoneticProps: PhoneticProps
): FormOverride | null {
  const lemmaRules = lemmasRules[uniqueLemma]
  let form = initialForm
  let isStressless = lemmaRules?.isStressless
  let isSandhi = lemmaRules?.isSandhi
  let rules: FormOverrideRules | undefined
  if (lemmaRules.overrideForms) {
    const { overrideForms } = lemmaRules
    Object.keys(overrideForms).forEach((_form) => {
      const formProps = overrideForms[_form]
      if (formProps.rules && isRuleApplicable(formProps.rules, phoneticProps)) {
        form = _form
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
    return getFormOverride({
      form,
      transformations: applySandhiTransformations(form, phoneticProps),
      isStressless,
      isSandhi,
      rules,
    })
  }
  return null
}
