/**
 * Error codes returned by the PICT engine.
 * These correspond to the C++ ErrorCode enum in cli/gcdmodel.h.
 */
export const PictErrorCode = {
  Success: 0x00,
  OutOfMemory: 0x01,
  GenerationError: 0x02,
  BadOption: 0x03,
  BadModel: 0x04,
  BadConstraints: 0x05,
  BadRowSeedFile: 0x06,
} as const;

export type PictErrorCode = (typeof PictErrorCode)[keyof typeof PictErrorCode];

/**
 * Base error class for all PICT-related errors.
 *
 * This class serves as the parent for all specific PICT error types,
 * allowing you to catch all PICT errors with a single catch block if desired.
 *
 * @example
 * ```typescript
 * try {
 *   const output = runner.run(parameters);
 * } catch (error) {
 *   if (error instanceof PictError) {
 *     console.error(`PICT error (code ${error.code}): ${error.message}`);
 *   }
 * }
 * ```
 */
export class PictError extends Error {
  /**
   * The error code returned by the PICT engine.
   */
  public readonly code: PictErrorCode;

  /**
   * The model file content that was passed to PICT when the error occurred.
   */
  public readonly modelFile: string;

  constructor(code: PictErrorCode, modelFile: string, message: string) {
    super(message);
    this.name = "PictError";
    this.code = code;
    this.modelFile = modelFile;
  }
}

/**
 * Error thrown when an invalid command-line option is provided.
 *
 * This error corresponds to `ErrorCode_BadOption` (0x03) in the C++ code.
 * It occurs when:
 * - An unknown option is specified
 * - An option is provided more than once
 * - An option has an invalid value
 *
 * @example
 * ```typescript
 * try {
 *   const output = runner.run(parameters, {
 *     options: { orderOfCombinations: -1 } // Invalid value
 *   });
 * } catch (error) {
 *   if (error instanceof PictBadOptionError) {
 *     console.error("Invalid option:", error.message);
 *   }
 * }
 * ```
 */
export class PictBadOptionError extends PictError {
  constructor(modelFile: string, message: string) {
    super(PictErrorCode.BadOption, modelFile, message);
    this.name = "PictBadOptionError";
  }
}

/**
 * Error thrown when the model definition is invalid.
 *
 * This error corresponds to `ErrorCode_BadModel` (0x04) in the C++ code.
 * It occurs when:
 * - The model file cannot be read or parsed
 * - Parameter names are not unique
 * - All values of a parameter are negative
 * - The order is larger than the number of parameters
 * - Submodel order is invalid
 *
 * @example
 * ```typescript
 * try {
 *   // Order (10) is larger than the number of parameters (2)
 *   const output = runner.run(
 *     [
 *       { name: "A", values: "1, 2" },
 *       { name: "B", values: "x, y" },
 *     ],
 *     { options: { orderOfCombinations: 10 } },
 *   );
 * } catch (error) {
 *   if (error instanceof PictBadModelError) {
 *     console.error("Invalid model:", error.message);
 *   }
 * }
 * ```
 */
export class PictBadModelError extends PictError {
  constructor(modelFile: string, message: string) {
    super(PictErrorCode.BadModel, modelFile, message);
    this.name = "PictBadModelError";
  }
}

/**
 * Error thrown when constraint definitions are invalid.
 *
 * This error corresponds to `ErrorCode_BadConstraints` (0x05) in the C++ code.
 * It occurs when:
 * - Constraint syntax is incorrect (missing brackets, keywords, etc.)
 * - Parameter/value type mismatch in constraints
 * - Parameters of different types are compared
 * - A parameter is compared to itself
 * - LIKE operator is used with numeric parameters/values
 * - Constraints are too restrictive (all values of a parameter are excluded)
 *
 * @example
 * ```typescript
 * try {
 *   const output = runner.run(
 *     [{ name: "OS", values: "Windows, Linux" }],
 *     { constraintsText: 'IF [OS] = "Windows" THEN' } // Incomplete constraint
 *   );
 * } catch (error) {
 *   if (error instanceof PictBadConstraintsError) {
 *     console.error("Invalid constraint:", error.message);
 *   }
 * }
 * ```
 */
export class PictBadConstraintsError extends PictError {
  constructor(modelFile: string, message: string) {
    super(PictErrorCode.BadConstraints, modelFile, message);
    this.name = "PictBadConstraintsError";
  }
}

/**
 * Error thrown when the row seed file is invalid.
 *
 * This error corresponds to `ErrorCode_BadRowSeedFile` (0x06) in the C++ code.
 * It occurs when:
 * - The seed file cannot be opened
 * - The seed file encoding is not supported (only ANSI and UTF-8 are supported)
 *
 * Note: This error is less common in the WebAssembly context since seed files
 * are typically not used directly.
 *
 * @example
 * ```typescript
 * try {
 *   const output = runner.run(parameters);
 * } catch (error) {
 *   if (error instanceof PictBadRowSeedFileError) {
 *     console.error("Invalid seed file:", error.message);
 *   }
 * }
 * ```
 */
export class PictBadRowSeedFileError extends PictError {
  constructor(modelFile: string, message: string) {
    super(PictErrorCode.BadRowSeedFile, modelFile, message);
    this.name = "PictBadRowSeedFileError";
  }
}

/**
 * Error thrown when test case generation fails.
 *
 * This error corresponds to `ErrorCode_GenerationError` (0x02) in the C++ code.
 * It occurs when:
 * - Out of memory during generation
 * - Internal generation failure
 * - Other runtime errors during the generation process
 *
 * @example
 * ```typescript
 * try {
 *   const output = runner.run(parameters);
 * } catch (error) {
 *   if (error instanceof PictGenerationError) {
 *     console.error("Generation failed:", error.message);
 *   }
 * }
 * ```
 */
export class PictGenerationError extends PictError {
  constructor(modelFile: string, message: string) {
    super(PictErrorCode.GenerationError, modelFile, message);
    this.name = "PictGenerationError";
  }
}

/**
 * Creates the appropriate PictError subclass based on the error code.
 *
 * @param code - The error code returned by the PICT engine
 * @param modelFile - The model file content
 * @param message - The error message from stderr
 * @returns The appropriate PictError subclass instance
 * @internal
 */
export function createPictError(
  code: number,
  modelFile: string,
  message: string,
): PictError {
  switch (code) {
    case PictErrorCode.BadOption:
      return new PictBadOptionError(modelFile, message);
    case PictErrorCode.BadModel:
      return new PictBadModelError(modelFile, message);
    case PictErrorCode.BadConstraints:
      return new PictBadConstraintsError(modelFile, message);
    case PictErrorCode.BadRowSeedFile:
      return new PictBadRowSeedFileError(modelFile, message);
    case PictErrorCode.GenerationError:
    case PictErrorCode.OutOfMemory:
      return new PictGenerationError(modelFile, message);
    default:
      return new PictError(code as PictErrorCode, modelFile, message);
  }
}
