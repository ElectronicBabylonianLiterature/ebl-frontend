import { fromDto } from 'corpus/application/dtos'
import { text, textDto } from 'test-support/test-corpus-text'

test('fromDto creates a text with its research projects', () => {
  expect(fromDto(textDto)).toEqual(text)
})

test('fromDto defaults missing research projects to an empty list', () => {
  const { projects: _projects, ...textDtoWithoutProjects } = textDto

  expect(fromDto(textDtoWithoutProjects).projects).toEqual([])
})
