export interface PictParameter {
  name: string;
  values: string;
}

export interface PictSubModel {
  parameterNames: string[];
  order: number;
}

export interface PictResult {
  header: string[];
  body: string[][];
}

export interface PictOutput {
  result: PictResult;
  modelFile: string;
  message?: string;
}

export interface PictOptions {
  orderOfCombinations?: number;
  randomizeGeneration?: boolean;
  randomizeSeed?: number;
}
