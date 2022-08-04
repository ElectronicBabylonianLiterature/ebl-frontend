import React from 'react'
import { render, screen } from '@testing-library/react'
import {
  lineDisplayFactory,
  oldLineNumberFactory,
} from 'test-support/chapter-fixtures'
import lineNumberToString from 'transliteration/domain/lineNumberToString'
import LineNumber from './LineNumber'

const LINE_NUMBER = '76a'

const lineDisplay = lineDisplayFactory.build(
  {},
  {
    associations: {
      oldLineNumbers: [
        oldLineNumberFactory.build(
          {},
          { associations: { number: LINE_NUMBER } }
        ),
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
  expect(screen.getByText(LINE_NUMBER)).toBeVisible()
})
