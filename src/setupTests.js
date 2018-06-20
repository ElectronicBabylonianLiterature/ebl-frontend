import 'jest-date-mock'
import 'jest-dom/extend-expect'

global.fetch = require('jest-fetch-mock')

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
}
global.localStorage = localStorageMock
