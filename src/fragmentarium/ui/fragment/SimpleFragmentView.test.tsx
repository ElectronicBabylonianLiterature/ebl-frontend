import { render, act } from '@testing-library/react'
import MemorySession from 'auth/Session'
import FragmentService from 'fragmentarium/application/FragmentService'
import SimpleFragmentView from 'fragmentarium/ui/fragment/SimpleFragmentView'
import React from 'react'
import { fragment } from 'test-support/test-fragment'

jest.mock('fragmentarium/application/FragmentService')
jest.mock('auth/Session')

const MockFragmentService = FragmentService as jest.Mock<
  jest.Mocked<FragmentService>
>
const fragmentServiceMock = new MockFragmentService()
const session = new (MemorySession as jest.Mock<jest.Mocked<MemorySession>>)()
let container: HTMLElement

beforeEach(async () => {
  session.isAllowedToReadFragments.mockReturnValue(true)
  fragmentServiceMock.find.mockResolvedValue(fragment)

  await act(async () => {
    container = render(
      <SimpleFragmentView
        fragmentService={fragmentServiceMock}
        number={fragment.number}
        session={session}
      />
    ).container
  })
})

it('correctly display the simple fragment view', async () => {
  expect(container).toMatchSnapshot()
})
