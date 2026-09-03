const fs = require('fs')
const puppeteer = require('puppeteer')

const EXISTING_SITEMAPS = ['sitemap.xml.gz', 'sitemap1.xml.gz', 'sitemap2.xml.gz']

function mockDirectoryContents(contentsByDirectory) {
  jest
    .spyOn(fs, 'existsSync')
    .mockImplementation((directory) => directory in contentsByDirectory)
  jest
    .spyOn(fs, 'readdirSync')
    .mockImplementation((directory) => contentsByDirectory[directory] || [])
}

function mockBrowser() {
  const cdpSession = { send: jest.fn().mockResolvedValue(undefined) }
  const page = {
    target: jest.fn().mockReturnValue({
      createCDPSession: jest.fn().mockResolvedValue(cdpSession),
    }),
    goto: jest.fn().mockResolvedValue(undefined),
  }
  const browser = {
    newPage: jest.fn().mockResolvedValue(page),
    close: jest.fn().mockResolvedValue(undefined),
  }
  puppeteer.launch.mockResolvedValue(browser)
  return { browser, page, cdpSession }
}

function resolveTimersImmediately() {
  jest.spyOn(global, 'setTimeout').mockImplementation((callback) => {
    callback()
    return 0
  })
}

function createLoggerSpy() {
  return { log: jest.fn(), error: jest.fn() }
}

module.exports = {
  EXISTING_SITEMAPS,
  mockDirectoryContents,
  mockBrowser,
  resolveTimersImmediately,
  createLoggerSpy,
}
