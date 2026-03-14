import type {
  PictModelRunOptions,
  PictOptions,
  PictParameter,
  PictOutput,
  PictRunOptions,
} from "./types.js";
import {
  createPictError,
  PictBadOptionError,
  PictErrorCode,
} from "./errors.js";
import createModule, { type MainModule } from "../dist/pict.js";

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
   *   and a separator-delimited value list.
   * @param runOptions - Optional configuration object containing:
   *   - `subModels`: Sub-model definitions for higher-order combinations on specific parameters.
   *   - `constraintsText`: PICT constraint expressions to filter invalid combinations.
   *   - `options`: Generation options such as order, randomization, case sensitivity,
   *     seed rows, custom separators, and model statistics mode (`/s`).
   * @returns The output containing generated test cases or model statistics (`/s`),
   *   the model file content, and any messages.
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
   * // With options for 3-wise combinations, randomization, and custom separators
   * const output = runner.run(
   *   parameters,
   *   {
   *     options: {
   *       seedRowsText: "A\tB\n0\tx",
   *       orderOfCombinations: 3,
   *       randomizeGeneration: true,
   *       randomizeSeed: 42,
   *       caseSensitive: true,
   *       valueSeparator: ";",
   *       aliasSeparator: "$",
   *       negativeValuePrefix: "!",
   *     },
   *   }
   * );
   * // `orderOfCombinations` also supports "max" for exhaustive coverage.
   *
   * // With seed rows (TSV format: header + rows)
   * const output = runner.run(
   *   [
   *     { name: "A", values: "0, 1" },
   *     { name: "B", values: "x, y" },
   *   ],
   *   {
   *     options: {
   *       seedRowsText: "A\tB\n0\tx",
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
    runOptions: PictRunOptions = {},
  ): PictOutput {
    const model = this.buildStructuredModel(parameters, runOptions);
    return this.executeModel(model, runOptions);
  }

  /**
   * Executes PICT with a raw model file string and options to generate test cases.
   *
   * The provided model text is passed to the WASM module exactly as-is. Syntax and
   * semantic validation are delegated to the underlying PICT engine.
   *
   * @param modelFileText - A complete PICT model file string.
   * @param runOptions - Optional configuration object containing:
   *   - `options`: Generation options such as order, randomization, case sensitivity,
   *     seed rows, custom separators, and model statistics mode (`/s`).
   * @returns The output containing generated test cases or model statistics (`/s`),
   *   the exact model file text passed in, and any messages.
   * @throws {PictBadOptionError} When invalid options are provided.
   * @throws {PictBadModelError} When the model definition is invalid.
   * @throws {PictBadConstraintsError} When constraint definitions are invalid.
   * @throws {PictBadRowSeedFileError} When the row seed file is invalid.
   * @throws {PictGenerationError} When test case generation fails.
   */
  public runModel(
    modelFileText: string,
    runOptions: PictModelRunOptions = {},
  ): PictOutput {
    this.assertNoStructuredModelOptions(modelFileText, runOptions);
    return this.executeModel(modelFileText, runOptions);
  }

  private buildStructuredModel(
    parameters: PictParameter[],
    runOptions: PictRunOptions,
  ): string {
    const { subModels, constraintsText } = runOptions;

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
    return model;
  }

  private executeModel(
    model: string,
    runOptions: { options?: PictOptions },
  ): PictOutput {
    const { options } = runOptions;
    const modelFileName = "model.txt";
    const seedRowsFileName = "seedrows.txt";

    this.pict.FS.writeFile(modelFileName, model);

    let hasSeedRowsFile = false;
    try {
      // Set the options
      const switches: string[] = [];
      if (options?.seedRowsText !== undefined) {
        this.pict.FS.writeFile(seedRowsFileName, options.seedRowsText);
        switches.push(`/e:${seedRowsFileName}`);
        hasSeedRowsFile = true;
      }
      if (options) {
        if (options.orderOfCombinations !== undefined) {
          switches.push(`/o:${options.orderOfCombinations.toString()}`);
        }
        if (options.valueSeparator !== undefined) {
          switches.push(`/d:${options.valueSeparator}`);
        }
        if (options.aliasSeparator !== undefined) {
          switches.push(`/a:${options.aliasSeparator}`);
        }
        if (options.negativeValuePrefix !== undefined) {
          switches.push(`/n:${options.negativeValuePrefix}`);
        }
        if (options.caseSensitive) {
          switches.push("/c");
        }
        if (options.showModelStatistics) {
          switches.push("/s");
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
      const returnCode = this.pict.callMain([
        modelFileName,
        ...switches,
      ]) as number;

      const err = this.stderrCapture.getOuts();
      const out = this.stdoutCapture.getOuts();

      // Check for errors
      if (returnCode !== PictErrorCode.Success) {
        throw createPictError(returnCode, model, err);
      }

      if (options?.showModelStatistics) {
        return {
          result: {
            header: [],
            body: [],
          },
          modelStatistics: out,
          modelFile: model,
          message: err,
        };
      }

      // Parse the output as TSV test cases
      const lines = out.split("\n").map((m) => m.split("\t"));
      return {
        result: {
          header: lines[0],
          body: lines.slice(1),
        },
        modelFile: model,
        message: err,
      };
    } finally {
      this.pict.FS.unlink(modelFileName);
      if (hasSeedRowsFile) {
        this.pict.FS.unlink(seedRowsFileName);
      }
    }
  }

  private assertNoStructuredModelOptions(
    modelFileText: string,
    runOptions: PictModelRunOptions,
  ): void {
    const structuredRunOptions = runOptions as Partial<PictRunOptions>;
    if (
      structuredRunOptions.subModels !== undefined ||
      structuredRunOptions.constraintsText !== undefined
    ) {
      throw new PictBadOptionError(
        modelFileText,
        "runModel does not accept runOptions.subModels or runOptions.constraintsText.",
      );
    }
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
