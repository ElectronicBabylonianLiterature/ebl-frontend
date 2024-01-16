import { DateOptionsProps } from 'chronology/ui/DateSelectionInput'

interface Config {
  id: string
  label: string
  checked: boolean
  onChange: () => void
}

export default function getDateConfigs(props: DateOptionsProps): Config[] {
  return [
    getRegularDateConfigs(props),
    getSeleucidDateConfigs(props),
    getAssyrianDateConfigs(props),
  ]
}

function getRegularDateConfigs(props: DateOptionsProps): Config {
  return {
    id: 'date-regular',
    label: 'Regular',
    checked: !props.isSeleucidEra && !props.isAssyrianDate,
    onChange: () => {
      props.setIsSeleucidEra(false)
      props.setIsAssyrianDate(false)
    },
  }
}

function getSeleucidDateConfigs(props: DateOptionsProps): Config {
  return {
    id: 'date-seleucid',
    label: 'Seleucid',
    checked: props.isSeleucidEra,
    onChange: () => {
      props.setIsSeleucidEra(true)
      props.setIsAssyrianDate(false)
      props.setIsCalenderFieldDisplayed(false)
    },
  }
}

function getAssyrianDateConfigs(props: DateOptionsProps): Config {
  return {
    id: 'date-assyrian',
    label: 'Assyrian',
    checked: props.isAssyrianDate,
    onChange: () => {
      props.setIsAssyrianDate(true)
      props.setIsSeleucidEra(false)
      props.setIsCalenderFieldDisplayed(false)
    },
  }
}
