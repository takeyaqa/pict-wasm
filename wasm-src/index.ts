import { PictParameter, PictOutput, PictOptions, PictSubModel } from './types.js'
// @ts-ignore
import  createModule, { MainModule } from '../dist/pict.mjs'

export class PictRunner {
  private pict: MainModule | null = null
  private stdoutCapture: OutputCapture
  private stderrCapture: OutputCapture

  constructor() {
    this.stdoutCapture = new OutputCapture()
    this.stderrCapture = new OutputCapture()
  }

  public async init(): Promise<void> {
    this.pict = await createModule({
      print: this.stdoutCapture.capture,
      printErr: this.stderrCapture.capture,
    })
  }

  public run(
    parameters: PictParameter[],
    {
      subModels,
      constraintsText,
      options,
    }: {
      subModels?: PictSubModel[]
      constraintsText?: string
      options?: PictOptions
    },
  ): PictOutput {
    if (!this.pict) {
      throw new Error('PictRunner not initialized')
    }
    // Build the model
    const parametersText = parameters
      .map((m) => `${m.name}: ${m.values}`)
      .join('\n')
    const subModelsText = subModels
      ? subModels
          .map(
            (m) => `{ ${m.parameterNames.join(', ')} } @ ${m.order.toString()}`,
          )
          .join('\n')
      : ''
    let model = parametersText
    if (subModelsText) {
      model = `${model}\n\n${subModelsText}`
    }
    if (constraintsText) {
      model = `${model}\n\n${constraintsText}`
    }
    this.pict.FS.writeFile('model.txt', model)

    // Set the options
    const switches: string[] = []
    if (options) {
      if (options.orderOfCombinations) {
        switches.push(`/o:${options.orderOfCombinations.toString()}`)
      }
      if (options.randomizeGeneration) {
        if (options.randomizeSeed === 0 || options.randomizeSeed) {
          switches.push(`/r:${options.randomizeSeed.toString()}`)
        } else {
          switches.push('/r')
        }
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    this.pict.callMain(['model.txt', ...switches])
    this.pict.FS.unlink('model.txt')
    const err = this.stderrCapture.getOuts()
    const out = this.stdoutCapture
      .getOuts()
      .split('\n')
      .map((m) => m.split('\t'))
    return {
      header: out[0],
      body: out.slice(1),
      modelFile: model,
      message: err,
    }
  }
}

class OutputCapture {
  private outs: string[] = []
  public capture = (line: string) => {
    this.outs.push(line)
  }

  public getOuts(): string {
    const out = this.outs.join('\n')
    this.clear()
    return out
  }

  public clear(): void {
    this.outs = []
  }
}
