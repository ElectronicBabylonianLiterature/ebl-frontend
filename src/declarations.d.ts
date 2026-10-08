declare module '*.md' {
  const content: string
  export default content
}

declare module 'maplibre-gl/dist/maplibre-gl-worker.mjs' {
  const url: string
  export default url
}

declare module '*.css'
declare module '*.sass'
