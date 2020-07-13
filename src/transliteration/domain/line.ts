import { AbstractLine, LineBaseDto } from './abstract-line'

export class ControlLine extends AbstractLine {
  readonly type = 'ControlLine'

  constructor(data: LineBaseDto) {
    super(data.prefix, data.content)
  }
}

export class EmptyLine extends AbstractLine {
  readonly type = 'EmptyLine'

  constructor() {
    super('', [])
  }
}
