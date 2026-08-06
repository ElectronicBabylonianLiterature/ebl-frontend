import { Expectation, leadingArguments } from 'test-support/FakeApiExpectation'

export default class FakeApiBase {
  private readonly expectations: Expectation[] = []

  readonly client = {
    fetchJson: jest
      .fn()
      .mockImplementation((path, authenticate) =>
        this.respond('GET', path, false, () =>
          this.unexpected('fetchJson', path, authenticate),
        ),
      ),

    postJson: jest
      .fn()
      .mockImplementation((path) =>
        this.respond('POST', path, false, () =>
          Promise.reject(new Error(`Unexpected postJson: ${path}`)),
        ),
      ),

    fetchBlob: jest
      .fn()
      .mockImplementation((path, authenticate) =>
        this.respond('GET', path, true, () =>
          this.unexpected('fetchBlob', path, authenticate),
        ),
      ),
  }

  private respond(
    method: 'GET' | 'POST',
    path: string,
    isBlob: boolean,
    onMissing: () => Promise<never>,
  ): Promise<unknown> {
    const expectation = this.expectations.find(
      (entry) =>
        entry.method === method &&
        entry.path === path &&
        entry.isBlob === isBlob,
    )
    return expectation ? Promise.resolve(expectation.response) : onMissing()
  }

  private unexpected(
    operation: string,
    path: string,
    authenticate: boolean,
  ): Promise<never> {
    return Promise.reject(
      new Error(
        `Unexpected ${
          authenticate ? 'authenticated' : 'not-authenticated'
        } ${operation}: ${path}`,
      ),
    )
  }

  private addExpectation(data: Partial<Expectation>): this {
    this.expectations.push(new Expectation(data))
    return this
  }

  protected expectGet(path: string, response: unknown, isBlob = false): this {
    return this.addExpectation({
      method: 'GET',
      path: path,
      authenticate: false,
      response: response,
      verify: true,
      isBlob: isBlob,
    })
  }

  protected allowGet(
    path: string,
    response: unknown = {},
    isBlob = false,
  ): this {
    return this.addExpectation({
      method: 'GET',
      path: path,
      authenticate: false,
      response: response,
      isBlob: isBlob,
    })
  }

  protected expectPost(
    path: string,
    body: unknown,
    response: unknown,
    authenticate = true,
  ): this {
    return this.addExpectation({
      method: 'POST',
      path: path,
      authenticate: authenticate,
      response: response,
      verify: true,
      body: body,
    })
  }

  verifyExpectations(): void {
    const methods = {
      GET: (expectation: Expectation): void => {
        const mock = expectation.isBlob
          ? this.client.fetchBlob
          : this.client.fetchJson
        expect(leadingArguments(mock, 2)).toContainEqual([
          expectation.path,
          expect.anything(),
        ])
      },
      POST: (expectation: Expectation): void => {
        expect(leadingArguments(this.client.postJson, 2)).toContainEqual([
          expectation.path,
          expectation.body || expect.anything(),
        ])
      },
    }
    this.expectations
      .filter((expectation) => expectation.verify)
      .forEach((expectation) => methods[expectation.method](expectation))
  }
}
