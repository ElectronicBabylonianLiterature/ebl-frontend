const fs = require('fs')
const path = require('path')
const vm = require('vm')
const { EventEmitter } = require('events')
const { PassThrough } = require('stream')

const startScriptPath = require.resolve('react-scripts/scripts/start')
const startScript = fs.readFileSync(startScriptPath, 'utf8')

async function startApplication(environment = {}) {
  const processEvents = new EventEmitter()
  const stdin = new PassThrough()
  const exit = jest.fn()
  const errors = []
  const closeCompiler = jest.fn()
  const stopServer = jest.fn()
  let serverOptions
  const compiler = { close: closeCompiler }
  const paths = {
    appPath: path.resolve(__dirname, '..'),
    appPackageJson: require.resolve('../package.json'),
    publicUrlOrPath: '/',
  }
  class DevServer {
    constructor(options, createdCompiler) {
      serverOptions = options
      expect(createdCompiler).toBe(compiler)
    }

    startCallback(callback) {
      callback()
    }

    stopCallback(callback) {
      stopServer(callback)
    }
  }
  const dependencies = {
    '../config/env': () => ({ raw: {} }),
    fs: { existsSync: () => true },
    'react-dev-utils/chalk': { cyan: (value) => value },
    webpack: {},
    'webpack-dev-server': DevServer,
    'react-dev-utils/clearConsole': () => undefined,
    'react-dev-utils/checkRequiredFiles': () => true,
    'react-dev-utils/WebpackDevServerUtils': {
      choosePort: () => Promise.resolve(3000),
      createCompiler: () => compiler,
      prepareProxy: () => undefined,
      prepareUrls: () => ({ localUrlForBrowser: 'http://localhost:3000' }),
    },
    'react-dev-utils/openBrowser': () => undefined,
    semver: {},
    '../config/paths': paths,
    '../config/webpack.config': () => ({}),
    '../config/webpackDevServer.config': () => ({}),
    'react-dev-utils/browsersHelper': {
      checkBrowsers: () => Promise.resolve(),
    },
    [paths.appPackageJson]: { name: 'shutdown-test' },
    react: { version: '18.2.0' },
  }
  const loadDependency = (name) => {
    if (!(name in dependencies)) {
      throw new Error(`Unexpected start-script dependency: ${name}`)
    }
    return dependencies[name]
  }
  loadDependency.resolve = (name) => name
  vm.runInNewContext(startScript, {
    require: loadDependency,
    console: { log: () => undefined, error: (error) => errors.push(error) },
    process: {
      env: { ...environment },
      stdout: { isTTY: false },
      stdin,
      on: processEvents.on.bind(processEvents),
      exit,
    },
  })
  await new Promise((resolve) => setTimeout(resolve, 0))
  return {
    processEvents,
    stdin,
    exit,
    errors,
    closeCompiler,
    stopServer,
    serverOptions,
  }
}

const triggerShutdown = (application, event) =>
  event === 'stdin'
    ? application.stdin.emit('end')
    : application.processEvents.emit(event)

test.each(['SIGINT', 'SIGTERM', 'stdin'])(
  '%s waits for server and compiler cleanup before exiting',
  async (event) => {
    const application = await startApplication()
    expect(application.serverOptions.setupExitSignals).toBe(false)
    expect(application.stopServer).not.toHaveBeenCalled()
    triggerShutdown(application, event)
    expect(application.stopServer).toHaveBeenCalledTimes(1)
    expect(application.closeCompiler).not.toHaveBeenCalled()
    expect(application.exit).not.toHaveBeenCalled()

    application.stopServer.mock.calls[0][0]()
    expect(application.closeCompiler).toHaveBeenCalledTimes(1)
    expect(application.exit).not.toHaveBeenCalled()

    application.closeCompiler.mock.calls[0][0]()
    expect(application.exit).toHaveBeenCalledTimes(1)
    expect(application.exit).toHaveBeenCalledWith(0)
    expect(application.errors).toEqual([])
  },
)

test('coalesces repeated stdin end during cleanup', async () => {
  const application = await startApplication()
  for (const event of ['stdin', 'stdin']) {
    triggerShutdown(application, event)
  }
  expect(application.stopServer).toHaveBeenCalledTimes(1)
  application.stopServer.mock.calls[0][0]()
  triggerShutdown(application, 'stdin')
  expect(application.closeCompiler).toHaveBeenCalledTimes(1)
  expect(application.exit).not.toHaveBeenCalled()
  application.closeCompiler.mock.calls[0][0]()
  expect(application.exit).toHaveBeenCalledWith(0)
})

test.each(['before server stop', 'during compiler close'])(
  'a second signal forces exit %s',
  async (phase) => {
    const application = await startApplication()
    triggerShutdown(application, 'SIGINT')
    triggerShutdown(application, 'stdin')
    expect(application.stopServer).toHaveBeenCalledTimes(1)
    if (phase === 'during compiler close') {
      application.stopServer.mock.calls[0][0]()
      expect(application.closeCompiler).toHaveBeenCalledTimes(1)
    }

    triggerShutdown(application, 'SIGTERM')
    expect(application.exit).toHaveBeenCalledTimes(1)
    expect(application.exit).toHaveBeenCalledWith(1)
    expect(application.stopServer).toHaveBeenCalledTimes(1)
  },
)

test('does not consume stdin just to detect pipe EOF', async () => {
  const application = await startApplication()
  application.stdin.end()
  await new Promise((resolve) => setTimeout(resolve, 0))

  expect(application.stopServer).not.toHaveBeenCalled()
  expect(application.exit).not.toHaveBeenCalled()
  triggerShutdown(application, 'SIGINT')
  application.stopServer.mock.calls[0][0]()
  application.closeCompiler.mock.calls[0][0]()
  expect(application.exit).toHaveBeenCalledWith(0)
})

test('ignores a duplicate server stop callback', async () => {
  const application = await startApplication()
  triggerShutdown(application, 'SIGINT')
  application.stopServer.mock.calls[0][0]()
  application.stopServer.mock.calls[0][0](new Error('late stop error'))
  expect(application.closeCompiler).toHaveBeenCalledTimes(1)
  application.closeCompiler.mock.calls[0][0]()
  expect(application.exit).toHaveBeenCalledTimes(1)
  expect(application.errors).toEqual([])
})

test('reports a synchronous compiler close error once', async () => {
  const application = await startApplication()
  const closeError = new Error('compiler close threw')
  application.closeCompiler.mockImplementation(() => {
    throw closeError
  })
  triggerShutdown(application, 'SIGINT')
  application.stopServer.mock.calls[0][0]()
  application.stopServer.mock.calls[0][0](closeError)
  expect(application.closeCompiler).toHaveBeenCalledTimes(1)
  expect(application.errors).toEqual([closeError])
  expect(application.exit).toHaveBeenCalledTimes(1)
  expect(application.exit).toHaveBeenCalledWith(1)
})

test.each([
  [new Error('server cleanup failed'), undefined],
  [undefined, new Error('compiler cleanup failed')],
  [new Error('server cleanup failed'), new Error('compiler cleanup failed')],
])(
  'reports cleanup errors and exits unsuccessfully',
  async (stopError, closeError) => {
    const application = await startApplication()
    triggerShutdown(application, 'SIGTERM')
    application.stopServer.mock.calls[0][0](stopError)
    expect(application.closeCompiler).toHaveBeenCalledTimes(1)
    expect(application.exit).not.toHaveBeenCalled()
    application.closeCompiler.mock.calls[0][0](closeError)

    expect(application.errors).toEqual([stopError, closeError].filter(Boolean))
    expect(application.exit).toHaveBeenCalledWith(1)
  },
)

test('keeps signal cleanup but ignores stdin end in CI', async () => {
  const application = await startApplication({ CI: 'true' })
  triggerShutdown(application, 'stdin')
  expect(application.stopServer).not.toHaveBeenCalled()
  triggerShutdown(application, 'SIGTERM')
  expect(application.stopServer).toHaveBeenCalledTimes(1)
  application.stopServer.mock.calls[0][0]()
  application.closeCompiler.mock.calls[0][0]()
  expect(application.exit).toHaveBeenCalledWith(0)
})
