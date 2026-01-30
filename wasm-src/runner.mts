import type {
  PictParameter,
  PictOutput,
  PictOptions,
  PictSubModel,
} from "./types.mjs";
import { createPictError, PictErrorCode } from "./errors.mjs";
import createModule, { type MainModule } from "../dist/pict.mjs";

/**
 * A runner class for executing PICT (Pairwise Independent Combinatorial Testing)
 * via WebAssembly.
 *
 * This class provides a JavaScript/TypeScript interface to the PICT combinatorial
 * test case generation tool. It works in both Node.js and browser environments.
 *
 * @example
 * ```typescript
 * // Create a PictRunner instance
 * const runner = await PictRunner.create();
 *
 * // Define parameters and run PICT
 * const output = runner.run([
 *   { name: "Type", values: "Single, Span, Stripe, Mirror, RAID-5" },
 *   { name: "Size", values: "10, 100, 500, 1000" },
 *   { name: "Format method", values: "Quick, Slow" },
 * ]);
 *
 * console.log(output.result.header); // ["Type", "Size", "Format method"]
 * console.log(output.result.body);   // Array of test cases
 * ```
 */
export class PictRunner {
  private pict: MainModule;
  private stdoutCapture: OutputCapture;
  private stderrCapture: OutputCapture;

  private constructor(
    pict: MainModule,
    stdoutCapture: OutputCapture,
    stderrCapture: OutputCapture,
  ) {
    this.pict = pict;
    this.stdoutCapture = stdoutCapture;
    this.stderrCapture = stderrCapture;
  }

  /**
   * Creates a new PictRunner instance by initializing the WebAssembly module.
   *
   * This is an async factory method that must be used instead of a constructor
   * because WebAssembly module initialization is asynchronous.
   *
   * @returns A promise that resolves to a new PictRunner instance ready for use.
   *
   * @example
   * ```typescript
   * const runner = await PictRunner.create();
   * ```
   */
  public static async create(): Promise<PictRunner> {
    const stdoutCapture = new OutputCapture();
    const stderrCapture = new OutputCapture();
    const pict = await createModule({
      print: stdoutCapture.capture,
      printErr: stderrCapture.capture,
    });
    return new PictRunner(pict, stdoutCapture, stderrCapture);
  }

  /**
   * Executes PICT with the given parameters and options to generate test cases.
   *
   * @param parameters - An array of parameter definitions, each containing a name
   *   and comma-separated values.
   * @param options - Optional configuration object containing:
   *   - `subModels`: Sub-model definitions for higher-order combinations on specific parameters.
   *   - `constraintsText`: PICT constraint expressions to filter invalid combinations.
   *   - `options`: Generation options such as order of combinations and randomization settings.
   * @returns The output containing generated test cases, the model file content, and any messages.
   * @throws {PictBadOptionError} When an invalid option is provided.
   * @throws {PictBadModelError} When the model definition is invalid.
   * @throws {PictBadConstraintsError} When constraint definitions are invalid.
   * @throws {PictBadRowSeedFileError} When the row seed file is invalid.
   * @throws {PictGenerationError} When test case generation fails.
   *
   * @example
   * ```typescript
   * // Basic usage
   * const output = runner.run([
   *   { name: "OS", values: "Windows, Linux, macOS" },
   *   { name: "Browser", values: "Chrome, Firefox, Safari" },
   * ]);
   *
   * // With constraints
   * const output = runner.run(
   *   [
   *     { name: "OS", values: "Windows, Linux, macOS" },
   *     { name: "Browser", values: "Chrome, Firefox, Safari, Edge" },
   *   ],
   *   {
   *     constraintsText: 'IF [OS] = "macOS" THEN [Browser] <> "Edge";',
   *   }
   * );
   *
   * // With options for 3-wise combinations and randomization
   * const output = runner.run(
   *   parameters,
   *   {
   *     options: {
   *       orderOfCombinations: 3,
   *       randomizeGeneration: true,
   *       randomizeSeed: 42,
   *     },
   *   }
   * );
   *
   * // Error handling
   * try {
   *   const output = runner.run(parameters, { constraintsText: 'invalid constraint' });
   * } catch (error) {
   *   if (error instanceof PictBadConstraintsError) {
   *     console.error("Constraint error:", error.message);
   *   }
   * }
   * ```
   */
  public run(
    parameters: PictParameter[],
    {
      subModels,
      constraintsText,
      options,
    }: {
      subModels?: PictSubModel[];
      constraintsText?: string;
      options?: PictOptions;
    } = {},
  ): PictOutput {
    // Build the model
    const parametersText = parameters
      .map((m) => `${m.name}: ${m.values}`)
      .join("\n");
    const subModelsText = subModels
      ? subModels
          .map(
            (m) => `{ ${m.parameterNames.join(", ")} } @ ${m.order.toString()}`,
          )
          .join("\n")
      : "";
    let model = parametersText;
    if (subModelsText) {
      model = `${model}\n\n${subModelsText}`;
    }
    if (constraintsText) {
      model = `${model}\n\n${constraintsText}`;
    }
    this.pict.FS.writeFile("model.txt", model);

    // Set the options
    const switches: string[] = [];
    if (options) {
      if (options.orderOfCombinations) {
        switches.push(`/o:${options.orderOfCombinations.toString()}`);
      }
      if (options.randomizeGeneration) {
        if (options.randomizeSeed === 0 || options.randomizeSeed) {
          switches.push(`/r:${options.randomizeSeed.toString()}`);
        } else {
          switches.push("/r");
        }
      }
    }

    // Execute PICT and capture the return code
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call -- callMain is an Emscripten runtime method without proper TypeScript definitions
    const returnCode = this.pict.callMain(["model.txt", ...switches]) as number;
    this.pict.FS.unlink("model.txt");

    const err = this.stderrCapture.getOuts();
    const out = this.stdoutCapture.getOuts();

    // Check for errors
    if (returnCode !== PictErrorCode.Success) {
      throw createPictError(returnCode, model, err);
    }

    // Parse the output
    const lines = out.split("\n").map((m) => m.split("\t"));
    return {
      result: {
        header: lines[0],
        body: lines.slice(1),
      },
      modelFile: model,
      message: err,
    };
  }
}

class OutputCapture {
  private outs: string[] = [];
  public capture = (line: string) => {
    this.outs.push(line);
  };

  public getOuts(): string {
    const out = this.outs.join("\n");
    this.clear();
    return out;
  }

  public clear(): void {
    this.outs = [];
  }
}
