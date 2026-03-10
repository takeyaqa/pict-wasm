# @takeyaqa/pict-wasm

Unofficial WebAssembly build of [Microsoft PICT](https://github.com/microsoft/pict).
This package works in both **Node.js** and **browsers**.

> [!IMPORTANT]
> This is an independent project and is not affiliated with Microsoft.
> The original PICT is licensed under the MIT License.

## Installation

```bash
npm install @takeyaqa/pict-wasm
```

## Requirements

- Node.js 22 or later
- Modern browsers with WebAssembly support (Chromium, Firefox, WebKit)

## Usage

### Basic Example

```typescript
import { PictRunner } from "@takeyaqa/pict-wasm";

const runner = await PictRunner.create();
const output = runner.run([
  { name: "Type", values: "Single, Span, Stripe, Mirror, RAID-5" },
  { name: "Size", values: "10, 100, 500, 1000, 5000, 10000, 40000" },
  { name: "Format method", values: "Quick, Slow" },
  { name: "File system", values: "FAT, FAT32, NTFS" },
  { name: "Cluster size", values: "512, 1024, 2048, 4096, 8192, 16384, 32768" },
  { name: "Compression", values: "ON, OFF" },
]);

console.log(output.result.header); // ["Type", "Size", "Format method", ...]
console.log(output.result.body); // [["Single", "10", "Quick", ...], ...]
```

### With Constraints

```typescript
const output = runner.run(
  [
    { name: "Type", values: "Single, Span, Stripe, Mirror, RAID-5" },
    { name: "File system", values: "FAT, FAT32, NTFS" },
    { name: "Size", values: "10, 100, 500, 1000" },
  ],
  {
    constraintsText: `IF [File system] = "FAT" THEN [Size] <= 4096;
IF [File system] = "FAT32" THEN [Size] <= 32000;`,
  },
);
```

### With Seed Rows

```typescript
const output = runner.run(
  [
    { name: "A", values: "0, 1" },
    { name: "B", values: "0, 1" },
    { name: "C", values: "0, 1" },
    { name: "D", values: "0, 1" },
  ],
  {
    // TSV format: header + rows (maps to PICT /e:file)
    seedRowsText: `A\tB\tC\tD
0\t0\t0\t0`,
  },
);
```

### With Options

```typescript
const output = runner.run(parameters, {
  options: {
    orderOfCombinations: 3, // or "max"; default: 2 (pairwise)
    valueSeparator: ";", // Maps to /d:C (default: ",")
    aliasSeparator: "$", // Maps to /a:C (default: "|")
    negativeValuePrefix: "!", // Maps to /n:C (default: "~")
    caseSensitive: true, // Maps to /c (default: false)
    randomizeGeneration: true, // Randomize output order
    randomizeSeed: 42, // For reproducible results
  },
});
```

## API Reference

### `PictRunner.create(): Promise<PictRunner>`

Creates a new `PictRunner` instance. This async factory method must be used instead of a constructor.

### `runner.run(parameters, runOptions?): PictOutput`

Generates test cases from the given parameters.

#### Parameters

| Name                      | Type              | Description                                      |
| ------------------------- | ----------------- | ------------------------------------------------ |
| `parameters`              | `PictParameter[]` | Array of `{ name: string, values: string }`      |
| `options.constraintsText` | `string`          | PICT constraint expressions                      |
| `options.seedRowsText`    | `string`          | Seed rows in TSV format (header + rows, maps to `/e:file`) |
| `options.subModels`       | `PictSubModel[]`  | Sub-model definitions for mixed-strength testing |
| `options.options`         | `PictOptions`     | Generation options (see below)                   |

#### PictOptions

| Option                | Type              | Default | Description                                                                 |
| --------------------- | ----------------- | ------- | --------------------------------------------------------------------------- |
| `orderOfCombinations` | `number \| "max"` | `2`     | Combination order (`2` = pairwise, `3` = 3-wise, etc., `"max"` = exhaustive) |
| `valueSeparator`      | `string`          | `","`   | Value separator (`/d:C`)                                                    |
| `aliasSeparator`      | `string`          | `"|"`   | Alias separator (`/a:C`)                                                    |
| `negativeValuePrefix` | `string`          | `"~"`   | Negative value prefix (`/n:C`)                                              |
| `caseSensitive`       | `boolean`         | `false` | Case-sensitive model evaluation (`/c`)                                      |
| `randomizeGeneration` | `boolean`         | `false` | Randomize test case order                                                   |
| `randomizeSeed`       | `number`          | -       | Seed for reproducible randomization                                         |

#### Return Value

```typescript
interface PictOutput {
  result: {
    header: string[]; // Parameter names
    body: string[][]; // Generated test cases
  };
  modelFile: string; // Generated model file content
  message?: string; // Additional output (e.g., random seed used)
}
```

## Error Handling

```typescript
import {
  PictRunner,
  PictBadModelError,
  PictBadConstraintsError,
} from "@takeyaqa/pict-wasm";

try {
  const output = runner.run(parameters, options);
} catch (error) {
  if (error instanceof PictBadConstraintsError) {
    console.error("Invalid constraints:", error.message);
  } else if (error instanceof PictBadModelError) {
    console.error("Invalid model:", error.message);
  }
}
```

### Error Classes

| Class                     | Description                    |
| ------------------------- | ------------------------------ |
| `PictError`               | Base class for all PICT errors |
| `PictBadModelError`       | Invalid model definition       |
| `PictBadConstraintsError` | Invalid constraint syntax      |
| `PictBadOptionError`      | Invalid option value           |
| `PictGenerationError`     | Test generation failure        |

## TypeScript Support

This package includes TypeScript type definitions. All types are exported:

```typescript
import type {
  PictParameter,
  PictSubModel,
  PictOptions,
  PictRunOptions,
  PictResult,
  PictOutput,
} from "@takeyaqa/pict-wasm";
```

## Build and Test

```bash
# Set up Emscripten SDK (required for first-time setup)
./install_emsdk.sh
source .emsdk/emsdk_env.sh

# Install dependencies and Playwright browsers
pnpm install
pnpm exec playwright install --with-deps

# Build WASM and TypeScript
pnpm run build

# Run all tests
pnpm run test:run
```

Pairwise Independent Combinatorial Testing
==========================================

PICT generates test cases and test configurations. With PICT, you can generate tests that are more effective than manually generated tests and in a fraction of the time required by hands-on test case design.

PICT runs as a command line tool. Prepare a model file detailing the parameters of the interface (or set of configurations, or data) you want to test. PICT generates a compact set of parameter value choices that represent the test cases you should use to get comprehensive combinatorial coverage of your parameters.

For instance, if you wish to create a test suite for partition and volume creation, the domain can be described by the following parameters: **Type**, **Size**, **File system**, **Format method**, **Cluster size**, and **Compression**. Each parameter has a limited number of possible values, each of which is determined by its nature (for example, **Compression** can only be **On** or **Off**) or by the equivalence partitioning (such as **Size**).

    Type:          Single, Span, Stripe, Mirror, RAID-5
    Size:          10, 100, 500, 1000, 5000, 10000, 40000
    Format method: Quick, Slow
    File system:   FAT, FAT32, NTFS
    Cluster size:  512, 1024, 2048, 4096, 8192, 16384, 32768, 65536
    Compression:   On, Off

There are thousands of possible combinations of these values. It would be  difficult to test all of them in a reasonable amount of time. Instead, we settle on testing all possible pairs of values. For example, **{Single, FAT}** is one pair, **{10, Slow}** is another; one test case can cover many pairs. Research shows that testing all pairs is an effective alternative to exhaustive testing and much less costly. It will provide very good coverage and the number of test cases will remain manageable.

# More information

See **[doc/pict.md](https://github.com/Microsoft/pict/blob/main/doc/pict.md)** for detailed documentation on PICT and http://pairwise.org has details on this testing methododology. 

The most recent **pict.exe** is available at https://github.com/microsoft/pict/releases/.

# Contributing

PICT consists of the following projects:
 * **api**: The core combinatorial engine,
 * **cli**: PICT.EXE command-line tool,
 * **clidll**: PICT.EXE client repackaged as a Windows DLL to be used in-proc,
 * **api-usage**: A sample of how the engine API can be used,
 * **clidll-usage**: A sample of how the PICT DLL is to be used.

## Building and testing on Windows with MsBuild
Use **pict.sln** to open the solution in Visual Studio 2022. You will need VC++ build tools installed. See https://www.visualstudio.com/downloads/ for details.

PICT uses MsBuild for building. **_build.cmd** script in the root directory will build both Debug and Release from the command-line.

The **test** folder contains all that is necessary to test PICT. You need Perl to run the tests. **_test.cmd** is the script that does it all.

The test script produces a log: **dbg.log** or **rel.log** for the Debug and Release bits respectively. Compare them with their committed baselines and make sure all the differences can be explained.

>There are tests which randomize output which typically make it different on each run. These results should be masked in the baseline but currently aren't.

## Building on Linux, OS/X, *BSD, etc.
PICT uses CMake to build on Linux.
Assuming installation of CMake and C++ toolchain, following set of commands will build and run tests in the directory `build`
```
> cmake -DCMAKE_BUILD_TYPE=Release -S . -B build
> cmake --build build
> pushd build && ctest -V && popd
```

## Debugging

Most commonly, you will want to debug the command-line tool. Start in the **pictcli** project, **cli/pict.cpp** file. You'll find **wmain** routine there which would be a convenient place to put the very first breakpoint.

## PICT as a container

To build a container image with PICT, just execute

    make image-build

Once built, you can run it with a sample model as follows

    make image-run

To use your own models, please execute

    podman run -it --rm -v ./<local-dir>:/var/pict:Z pict:latest <your-model-file> [<pict-options>]
