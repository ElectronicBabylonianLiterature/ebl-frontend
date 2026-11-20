import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { guestSession } from 'auth/Session'
import { renderTools, rerenderTools } from 'router/Tools.testSupport'

const mockPush = jest.fn()

beforeEach(() => {
  jest.spyOn(jest.requireMock('router/compat'), 'useHistory').mockReturnValue({
    push: mockPush,
    replace: jest.fn(),
    location: {
      pathname: '/tools/map',
      search: '',
      hash: '',
      state: null,
      key: 'map-test',
    },
  })
})

it('provides a compact map navigation with the same permitted tools', async () => {
  renderTools('map', guestSession)
  await screen.findByText('Map Mock')
  const navigation = screen.getByRole('combobox', { name: 'Choose a tool' })
  expect(navigation).toHaveValue('map')
  expect(screen.getByRole('option', { name: 'Findspot Map' })).toHaveValue(
    'map',
  )
  expect(
    screen.queryByRole('option', { name: 'Realia' }),
  ).not.toBeInTheDocument()
})

it('navigates to the selected tool', async () => {
  renderTools('map')
  await screen.findByText('Map Mock')
  await userEvent.selectOptions(
    screen.getByRole('combobox', { name: 'Choose a tool' }),
    'dictionary',
  )
  expect(mockPush).toHaveBeenCalledWith('/tools/dictionary')
  expect(await screen.findByText('Dictionary Mock')).toBeInTheDocument()
  expect(
    screen.queryByRole('combobox', { name: 'Choose a tool' }),
  ).not.toBeInTheDocument()
})

it('keeps the map selected when choosing the current tool', async () => {
  renderTools('map')
  await screen.findByText('Map Mock')
  await userEvent.selectOptions(
    screen.getByRole('combobox', { name: 'Choose a tool' }),
    'map',
  )
  expect(screen.getByText('Map Mock')).toBeInTheDocument()
})

it('removes map-specific navigation when the route changes', async () => {
  const { rerender } = renderTools('map')
  await screen.findByText('Map Mock')
  expect(
    screen.getByRole('combobox', { name: 'Choose a tool' }),
  ).toBeInTheDocument()
  rerenderTools(rerender, 'signs')
  await screen.findByText('Signs Mock')
  expect(
    screen.queryByRole('combobox', { name: 'Choose a tool' }),
  ).not.toBeInTheDocument()
})
