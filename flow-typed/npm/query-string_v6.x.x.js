// flow-typed signature: 690f14375609c2c7d09465eff4faa58b
// flow-typed version: c6154227d1/query-string_v6.x.x/flow_>=v0.104.x

declare module 'query-string' {
  declare type ArrayFormat = 'none' | 'bracket' | 'index'
  declare type ParseOptions = {|
    arrayFormat?: ArrayFormat,
  |}

  declare type StringifyOptions = {|
    arrayFormat?: ArrayFormat,
    encode?: boolean,
    strict?: boolean,
    sort?: false | <A, B>(A, B) => number,
  |}

  declare type ObjectParameter = string | number | boolean | null | void;

  declare type ObjectParameters = $ReadOnly<{ [string]: ObjectParameter | $ReadOnlyArray<ObjectParameter>, ... }>

  declare type QueryParameters = { [string]: string | Array<string> | null, ... }

  declare module.exports: {
    extract(str: string): string,
    parse(str: string, opts?: ParseOptions): QueryParameters,
    parseUrl(str: string, opts?: ParseOptions): {
      url: string,
      query: QueryParameters,
      ...
    },
    stringify(obj: ObjectParameters, opts?: StringifyOptions): string,
    ...
  }
}
