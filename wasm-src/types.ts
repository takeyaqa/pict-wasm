export interface PictParameter {
  name: string
  values: string
}

export interface PictSubModel {
  parameterNames: string[]
  order: number
}

export interface PictOutput {
  header: string[]
  body: string[][]
  modelFile: string
  message?: string
}

export interface PictOptions {
  orderOfCombinations?: number
  randomizeGeneration?: boolean
  randomizeSeed?: number
}
