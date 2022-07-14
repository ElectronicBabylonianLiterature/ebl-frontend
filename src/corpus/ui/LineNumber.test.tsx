import React from 'react'
import { render, screen } from '@testing-library/react'
import {
  lineDisplayFactory,
  oldLineNumberFactory,
} from 'test-support/chapter-fixtures'
import lineNumberToString from 'transliteration/domain/lineNumberToString'
import LineNumber from './LineNumber'

const lineDisplay = lineDisplayFactory.build(
  {},
  {
    associations: {
      oldLineNumbers: [
        oldLineNumberFactory.build({}, { associations: { number: '76a' } }),
      ],
    },
  }
)

test('LineNumber', () => {
  render(
    <LineNumber line={lineDisplay} activeLine={''} showOldLineNumbers={true} />
  )
  expect(
    screen.getByText(`${lineNumberToString(lineDisplay.number)}`)
  ).toBeVisible()
  expect(screen.getByText('76a')).toBeVisible()
})
