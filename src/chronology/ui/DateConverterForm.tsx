import React, { useState } from 'react'

const fields = [
  { name: 'year', type: 'number', placeholder: 'Year', required: true },
  { name: 'bcYear', type: 'number', placeholder: 'BC Year' },
  { name: 'month', type: 'number', placeholder: 'Month', required: true },
  { name: 'day', type: 'number', placeholder: 'Day', required: true },
  { name: 'weekDay', type: 'number', placeholder: 'Week Day', required: true },
  { name: 'cjdn', type: 'number', placeholder: 'CJDN', required: true },
  {
    name: 'lunationNabonassar',
    type: 'number',
    placeholder: 'Lunation Nabonassar',
    required: true,
  },
  {
    name: 'seBabylonianYear',
    type: 'number',
    placeholder: 'SE Babylonian Year',
    required: true,
  },
  {
    name: 'seMacedonianYear',
    type: 'number',
    placeholder: 'SE Macedonian Year',
  },
  { name: 'seArsacidYear', type: 'number', placeholder: 'SE Arsacid Year' },
  {
    name: 'mesopotamianMonth',
    type: 'number',
    placeholder: 'Mesopotamian Month',
    required: true,
  },
  { name: 'mesopotamianDay', type: 'number', placeholder: 'Mesopotamian Day' },
  {
    name: 'mesopotamianMonthLength',
    type: 'number',
    placeholder: 'Mesopotamian Month Length',
  },
  { name: 'ruler', type: 'text', placeholder: 'Ruler' },
  { name: 'regnalYear', type: 'number', placeholder: 'Regnal Year' },
]

function DateForm(): JSX.Element {
  const initialFormData = fields.reduce((acc, field) => {
    acc[field.name] = ''
    return acc
  }, {})

  /* ToDo:
  Implement.
    1. Switch between scenarios.
    2. When a scenario is selected, only the inputs that are relevant should remain active.

  Scenarios:
  
  * setToModernDate(year: number, month: number, day: number)
  
  * setSeBabylonianDate(
    seBabylonianYear: number,
    mesopotamianMonth: number,
    mesopotamianDay: number
  )
  
  *   setMesopotamianDate(
    ruler: string,
    regnalYear: number,
    mesopotamianMonth: number,
    mesopotamianDay: number
  )

  */

  const [formData, setFormData] = useState(initialFormData)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({ ...prevState, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      {fields.map((field) => (
        <input
          key={field.name}
          name={field.name}
          type={field.type}
          value={formData[field.name]}
          onChange={handleChange}
          placeholder={field.placeholder}
          required={field.required}
        />
      ))}
      <button type="submit">Submit</button>
    </form>
  )
}

export default DateForm
