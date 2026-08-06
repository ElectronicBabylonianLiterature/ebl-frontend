export type StalenessCheck = () => boolean

export default class SupersedableOperation {
  private currentToken = 0

  start(): StalenessCheck {
    this.currentToken += 1
    const startedToken = this.currentToken
    return () => this.currentToken !== startedToken
  }
}
