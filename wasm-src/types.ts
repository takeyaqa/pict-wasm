/**
 * Represents a parameter definition for PICT test case generation.
 *
 * @example
 * ```typescript
 * const parameter: PictParameter = {
 *   name: "Type",
 *   values: "Single, Span, Stripe, Mirror, RAID-5"
 * };
 * ```
 */
export interface PictParameter {
  /**
   * The name of the parameter.
   */
  name: string;
  /**
   * A comma-separated string of possible values for this parameter.
   */
  values: string;
}

/**
 * Represents a sub-model definition for specifying higher-order combinations
 * on a subset of parameters.
 *
 * Sub-models allow you to define different orders of combinations for specific
 * groups of parameters, enabling more thorough testing of related parameters.
 *
 * @example
 * ```typescript
 * const subModel: PictSubModel = {
 *   parameterNames: ["Type", "Size", "Format method"],
 *   order: 3
 * };
 * ```
 */
export interface PictSubModel {
  /**
   * An array of parameter names to include in this sub-model.
   */
  parameterNames: string[];
  /**
   * The order of combinations for this sub-model (e.g., 2 for pairwise, 3 for 3-wise).
   */
  order: number;
}

/**
 * Represents the parsed result of PICT test case generation.
 */
export interface PictResult {
  /**
   * An array of parameter names representing the column headers.
   */
  header: string[];
  /**
   * A two-dimensional array where each inner array represents a test case,
   * with values corresponding to the header columns.
   */
  body: string[][];
}

/**
 * Represents the complete output from a PICT execution.
 */
export interface PictOutput {
  /**
   * The parsed test case results containing header and body.
   *
   * When `options.showModelStatistics` is enabled, PICT prints model statistics
   * instead of test cases, and this field is returned as:
   * `{ header: [], body: [] }`.
   */
  result: PictResult;
  /**
   * Raw model statistics text produced by PICT when
   * `options.showModelStatistics` is enabled (`/s`).
   *
   * This value is undefined for normal test case generation.
   */
  modelStatistics?: string;
  /**
   * The complete model file content that was passed to PICT,
   * including parameters, sub-models, and constraints.
   */
  modelFile: string;
  /**
   * Optional message output from PICT, typically containing
   * information such as the random seed used when randomization is enabled.
   */
  message?: string;
}

/**
 * Configuration options for PICT test case generation.
 */
export interface PictOptions {
  /**
   * The order of combinations to generate (default is 2 for pairwise).
   * Higher values generate more comprehensive test suites but with more test cases.
   * For example, 3 generates all 3-wise combinations.
   * Set to `"max"` to use exhaustive order (equivalent to the number of parameters).
   */
  orderOfCombinations?: number | "max";
  /**
   * When set to true, randomizes the order of test case generation.
   * This can produce different (but equally valid) test suites on each run.
   */
  randomizeGeneration?: boolean;
  /**
   * The seed value for random generation. Only used when `randomizeGeneration` is true.
   * Providing a seed ensures reproducible results across runs.
   * If not specified while `randomizeGeneration` is true, a random seed will be used.
   */
  randomizeSeed?: number;
  /**
   * Enables case-sensitive model evaluation.
   * Maps to PICT CLI option `/c` (default: `false`).
   */
  caseSensitive?: boolean;
  /**
   * Shows model statistics instead of generated test cases.
   * Maps to PICT CLI option `/s` (default: `false`).
   */
  showModelStatistics?: boolean;
  /**
   * Character used to separate values in parameter definitions.
   * Maps to PICT CLI option `/d:C` (default: `,`).
   */
  valueSeparator?: string;
  /**
   * Character used to separate aliases in value definitions.
   * Maps to PICT CLI option `/a:C` (default: `|`).
   */
  aliasSeparator?: string;
  /**
   * Prefix used to mark negative (out-of-range) values.
   * Maps to PICT CLI option `/n:C` (default: `~`).
   */
  negativeValuePrefix?: string;
}

/**
 * Run-level options for {@link PictRunner.run}.
 */
export interface PictRunOptions {
  /**
   * Sub-model definitions for mixed-strength combinations.
   */
  subModels?: PictSubModel[];
  /**
   * PICT constraint expressions.
   */
  constraintsText?: string;
  /**
   * Seed rows in TSV format (header + rows), mapped to PICT CLI option `/e:file`.
   *
   * This string is written to an internal virtual file and passed to PICT.
   */
  seedRowsText?: string;
  /**
   * Generation options mapped to PICT CLI switches.
   */
  options?: PictOptions;
}
