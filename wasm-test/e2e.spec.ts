import { describe, it, expect, beforeEach } from "vitest";
import {
  PictRunner,
  PictError,
  PictBadOptionError,
  PictBadModelError,
  PictBadConstraintsError,
} from "../dist/index.js";

describe("PictRunner", () => {
  describe("create", () => {
    it("should create instance without errors", async () => {
      const pictRunner = await PictRunner.create();
      expect(pictRunner).toBeInstanceOf(PictRunner);
    });
  });

  describe("run without options", () => {
    let pictRunner: PictRunner;

    beforeEach(async () => {
      pictRunner = await PictRunner.create();
    });

    it("should run without errors when parameters are ascii", () => {
      const output = pictRunner.run([
        { name: "Type", values: "Single, Span, Stripe, Mirror, RAID-5" },
        { name: "Size", values: "10, 100, 500, 1000, 5000, 10000, 40000" },
        { name: "Format method", values: "Quick, Slow" },
        { name: "File system", values: "FAT, FAT32, NTFS" },
        {
          name: "Cluster size",
          values: "512, 1024, 2048, 4096, 8192, 16384, 32768, 65536",
        },
        { name: "Compression", values: "ON, OFF" },
      ]);
      expect(output.result.header).toEqual([
        "Type",
        "Size",
        "Format method",
        "File system",
        "Cluster size",
        "Compression",
      ]);
      expect(output.result.body.length).toEqual(56);
      expect(output.result.body[0]).toEqual([
        "Span",
        "5000",
        "Slow",
        "NTFS",
        "16384",
        "OFF",
      ]);
      expect(output.result.body[27]).toEqual([
        "Single",
        "100",
        "Quick",
        "NTFS",
        "512",
        "OFF",
      ]);
      expect(output.result.body[55]).toEqual([
        "Mirror",
        "5000",
        "Slow",
        "NTFS",
        "2048",
        "OFF",
      ]);
      expect(output.modelFile).toBe(`Type: Single, Span, Stripe, Mirror, RAID-5
Size: 10, 100, 500, 1000, 5000, 10000, 40000
Format method: Quick, Slow
File system: FAT, FAT32, NTFS
Cluster size: 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536
Compression: ON, OFF`);
      expect(output.message).toBe("");
      expect(output.modelStatistics).toBeUndefined();
    });

    it("should run without errors when parameters are unicode and special characters", () => {
      const output = pictRunner.run([
        {
          name: "null",
          values: "undefined, true, false, NaN, Infinity, eval",
        },
        { name: "⅛⅜⅝⅞", values: "Ω≈ç√∫˜µ≤≥÷, ٠١٢٣٤٥٦٧٨٩, ¡™£¢∞§¶•ªº–≠" },
        {
          name: "社會科學院語學研究所",
          values: "表ポあA鷗ŒéＢ逍Üßªąñ丂㐀𠀀, 캄사함니다",
        },
        {
          name: "╯°□°）╯︵ ┻━┻",
          values: "👾 🙇 💁 🙅 🙆 🙋 🙎 🙍, ✋🏿 💪🏿 👐🏿 🙌🏿 👏🏿 🙏🏿, 🇺🇸🇷🇺🇸🇦",
        },
        {
          name: "script alert0 /script",
          values: "مرحبًا, בְּרֵאשִׁית",
        },
      ]);
      expect(output.result.header).toEqual([
        "null",
        "⅛⅜⅝⅞",
        "社會科學院語學研究所",
        "╯°□°）╯︵ ┻━┻",
        "script alert0 /script",
      ]);
      expect(output.result.body.length).toEqual(18);
      expect(output.result.body[0]).toEqual([
        "false",
        "¡™£¢∞§¶•ªº–≠",
        "캄사함니다",
        "🇺🇸🇷🇺🇸🇦",
        "مرحبًا",
      ]);
      expect(output.result.body[8]).toEqual([
        "NaN",
        "٠١٢٣٤٥٦٧٨٩",
        "表ポあA鷗ŒéＢ逍Üßªąñ丂㐀𠀀",
        "🇺🇸🇷🇺🇸🇦",
        "مرحبًا",
      ]);
      expect(output.result.body[17]).toEqual([
        "false",
        "٠١٢٣٤٥٦٧٨٩",
        "캄사함니다",
        "👾 🙇 💁 🙅 🙆 🙋 🙎 🙍",
        "مرحبًا",
      ]);
      expect(output.modelFile)
        .toBe(`null: undefined, true, false, NaN, Infinity, eval
⅛⅜⅝⅞: Ω≈ç√∫˜µ≤≥÷, ٠١٢٣٤٥٦٧٨٩, ¡™£¢∞§¶•ªº–≠
社會科學院語學研究所: 表ポあA鷗ŒéＢ逍Üßªąñ丂㐀𠀀, 캄사함니다
╯°□°）╯︵ ┻━┻: 👾 🙇 💁 🙅 🙆 🙋 🙎 🙍, ✋🏿 💪🏿 👐🏿 🙌🏿 👏🏿 🙏🏿, 🇺🇸🇷🇺🇸🇦
script alert0 /script: مرحبًا, בְּרֵאשִׁית`);
      expect(output.message).toBe("");
    });
  });

  describe("run with constraints", () => {
    let pictRunner: PictRunner;

    beforeEach(async () => {
      pictRunner = await PictRunner.create();
    });

    it("should run without errors when parameters are ascii", () => {
      const output = pictRunner.run(
        [
          { name: "Type", values: "Single, Span, Stripe, Mirror, RAID-5" },
          { name: "Size", values: "10, 100, 500, 1000, 5000, 10000, 40000" },
          { name: "Format method", values: "Quick, Slow" },
          { name: "File system", values: "FAT, FAT32, NTFS" },
          {
            name: "Cluster size",
            values: "512, 1024, 2048, 4096, 8192, 16384, 32768, 65536",
          },
          { name: "Compression", values: "ON, OFF" },
        ],
        {
          constraintsText: `IF [File system] = "FAT" THEN [Size] <= 4096;
IF [File system] = "FAT32" THEN [Size] <= 32000;`,
        },
      );
      expect(output.result.header).toEqual([
        "Type",
        "Size",
        "Format method",
        "File system",
        "Cluster size",
        "Compression",
      ]);
      expect(output.result.body.length).toEqual(56);
      expect(output.result.body[0]).toEqual([
        "Stripe",
        "5000",
        "Quick",
        "NTFS",
        "16384",
        "OFF",
      ]);
      expect(output.result.body[27]).toEqual([
        "Mirror",
        "10000",
        "Slow",
        "NTFS",
        "16384",
        "ON",
      ]);
      expect(output.result.body[55]).toEqual([
        "Mirror",
        "100",
        "Quick",
        "FAT",
        "65536",
        "OFF",
      ]);
      expect(output.modelFile).toBe(`Type: Single, Span, Stripe, Mirror, RAID-5
Size: 10, 100, 500, 1000, 5000, 10000, 40000
Format method: Quick, Slow
File system: FAT, FAT32, NTFS
Cluster size: 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536
Compression: ON, OFF

IF [File system] = "FAT" THEN [Size] <= 4096;
IF [File system] = "FAT32" THEN [Size] <= 32000;`);
      expect(output.message).toBe("");
    });
  });

  describe("run with options", () => {
    let pictRunner: PictRunner;

    beforeEach(async () => {
      pictRunner = await PictRunner.create();
    });

    it("should run with order when combinations are 3", () => {
      const output = pictRunner.run(
        [
          { name: "Type", values: "Single, Span, Stripe, Mirror, RAID-5" },
          { name: "Size", values: "10, 100, 500, 1000, 5000, 10000, 40000" },
          { name: "Format method", values: "Quick, Slow" },
          { name: "File system", values: "FAT, FAT32, NTFS" },
          {
            name: "Cluster size",
            values: "512, 1024, 2048, 4096, 8192, 16384, 32768, 65536",
          },
          { name: "Compression", values: "ON, OFF" },
        ],
        { options: { orderOfCombinations: 3 } },
      );
      expect(output.result.header).toEqual([
        "Type",
        "Size",
        "Format method",
        "File system",
        "Cluster size",
        "Compression",
      ]);
      expect(output.result.body.length).toEqual(281);
      expect(output.result.body[0]).toEqual([
        "RAID-5",
        "10",
        "Slow",
        "NTFS",
        "1024",
        "OFF",
      ]);
      expect(output.result.body[140]).toEqual([
        "RAID-5",
        "1000",
        "Quick",
        "FAT32",
        "1024",
        "OFF",
      ]);
      expect(output.result.body[280]).toEqual([
        "RAID-5",
        "10000",
        "Slow",
        "FAT32",
        "2048",
        "OFF",
      ]);
      expect(output.modelFile).toBe(`Type: Single, Span, Stripe, Mirror, RAID-5
Size: 10, 100, 500, 1000, 5000, 10000, 40000
Format method: Quick, Slow
File system: FAT, FAT32, NTFS
Cluster size: 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536
Compression: ON, OFF`);
      expect(output.message).toBe("");
    });

    it("should run with exhaustive order when combinations are max", () => {
      const output = pictRunner.run(
        [
          { name: "A", values: "0, 1" },
          { name: "B", values: "0, 1" },
          { name: "C", values: "0, 1" },
        ],
        { options: { orderOfCombinations: "max" } },
      );
      expect(output.result.header).toEqual(["A", "B", "C"]);
      expect(output.result.body.length).toEqual(8);
      expect(output.result.body.map((m) => m.join(",")).toSorted()).toEqual([
        "0,0,0",
        "0,0,1",
        "0,1,0",
        "0,1,1",
        "1,0,0",
        "1,0,1",
        "1,1,0",
        "1,1,1",
      ]);
      expect(output.modelFile).toBe(`A: 0, 1
B: 0, 1
C: 0, 1`);
      expect(output.message).toBe("");
    });

    it("should run with randomized generation", () => {
      const output = pictRunner.run(
        [
          { name: "Type", values: "Single, Span, Stripe, Mirror, RAID-5" },
          { name: "Size", values: "10, 100, 500, 1000, 5000, 10000, 40000" },
          { name: "Format method", values: "Quick, Slow" },
          { name: "File system", values: "FAT, FAT32, NTFS" },
          {
            name: "Cluster size",
            values: "512, 1024, 2048, 4096, 8192, 16384, 32768, 65536",
          },
          { name: "Compression", values: "ON, OFF" },
        ],
        { options: { randomizeGeneration: true } },
      );
      expect(output.result.header).toEqual([
        "Type",
        "Size",
        "Format method",
        "File system",
        "Cluster size",
        "Compression",
      ]);
      expect(output.result.body.length).toBeOneOf([55, 56, 57]); // slight variation due to randomness
      expect(output.modelFile).toBe(`Type: Single, Span, Stripe, Mirror, RAID-5
Size: 10, 100, 500, 1000, 5000, 10000, 40000
Format method: Quick, Slow
File system: FAT, FAT32, NTFS
Cluster size: 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536
Compression: ON, OFF`);
      expect(output.message).toMatch(/Used seed: [0-9]+/);
    });

    it("should return model statistics when showModelStatistics is enabled", () => {
      const output = pictRunner.run(
        [
          { name: "A", values: "0, 1" },
          { name: "B", values: "x, y" },
        ],
        { options: { showModelStatistics: true } },
      );
      expect(output.result.header).toEqual([]);
      expect(output.result.body).toEqual([]);
      expect(output.modelStatistics).toBeDefined();
      expect(output.modelStatistics).toMatch(/Combinations:\s+4/);
      expect(output.modelStatistics).toMatch(/Generated tests:\s*4/);
      expect(output.modelStatistics).toMatch(/Generation time:\d+:\d{2}:\d{2}/);
      expect(output.modelFile).toBe(`A: 0, 1
B: x, y`);
      expect(output.message).toBe("");
    });

    it("should return model statistics and seed message when randomization is enabled", () => {
      const output = pictRunner.run(
        [
          { name: "A", values: "0, 1" },
          { name: "B", values: "x, y" },
        ],
        {
          options: {
            showModelStatistics: true,
            randomizeGeneration: true,
            randomizeSeed: 0,
          },
        },
      );
      expect(output.result.header).toEqual([]);
      expect(output.result.body).toEqual([]);
      expect(output.modelStatistics).toBeDefined();
      expect(output.modelStatistics).toMatch(/Combinations:\s+4/);
      expect(output.modelStatistics).toMatch(/Generated tests:\s*4/);
      expect(output.modelStatistics).toMatch(/Generation time:\d+:\d{2}:\d{2}/);
      expect(output.modelFile).toBe(`A: 0, 1
B: x, y`);
      expect(output.message).toBe("Used seed: 0");
    });

    it("should produce deterministic results when seed is provided", () => {
      const output = pictRunner.run(
        [
          { name: "Type", values: "Single, Span, Stripe, Mirror, RAID-5" },
          { name: "Size", values: "10, 100, 500, 1000, 5000, 10000, 40000" },
          { name: "Format method", values: "Quick, Slow" },
          { name: "File system", values: "FAT, FAT32, NTFS" },
          {
            name: "Cluster size",
            values: "512, 1024, 2048, 4096, 8192, 16384, 32768, 65536",
          },
          { name: "Compression", values: "ON, OFF" },
        ],
        {
          options: {
            randomizeGeneration: true,
            randomizeSeed: 0,
          },
        },
      );
      expect(output.result.header).toEqual([
        "Type",
        "Size",
        "Format method",
        "File system",
        "Cluster size",
        "Compression",
      ]);
      expect(output.result.body.length).toEqual(56);
      expect(output.result.body[0]).toEqual([
        "Span",
        "5000",
        "Slow",
        "NTFS",
        "16384",
        "OFF",
      ]);
      expect(output.result.body[27]).toEqual([
        "Single",
        "100",
        "Quick",
        "NTFS",
        "512",
        "OFF",
      ]);
      expect(output.result.body[55]).toEqual([
        "Mirror",
        "5000",
        "Slow",
        "NTFS",
        "2048",
        "OFF",
      ]);
      expect(output.modelFile).toBe(`Type: Single, Span, Stripe, Mirror, RAID-5
Size: 10, 100, 500, 1000, 5000, 10000, 40000
Format method: Quick, Slow
File system: FAT, FAT32, NTFS
Cluster size: 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536
Compression: ON, OFF`);
      expect(output.message).toBe("Used seed: 0");
    });

    it("should run with case-sensitive model evaluation", () => {
      const output = pictRunner.run(
        [
          { name: "OS", values: "Windows, Linux" },
          { name: "os", values: "windows, linux" },
        ],
        { options: { caseSensitive: true } },
      );

      expect(output.result.header).toEqual(["OS", "os"]);
      expect(output.result.body.length).toEqual(4);
      expect(output.result.body.map((m) => m.join(",")).toSorted()).toEqual([
        "Linux,linux",
        "Linux,windows",
        "Windows,linux",
        "Windows,windows",
      ]);
      expect(output.modelFile).toBe(`OS: Windows, Linux
os: windows, linux`);
      expect(output.message).toBe("");
    });

    it("should evaluate constraints case-sensitively when enabled", () => {
      const parameters = [
        { name: "OS", values: "Win10, win10" },
        { name: "B", values: "X, Y" },
      ];
      const constraintsText = 'IF [OS] = "win10" THEN [B] = "X";';

      const outputCaseInsensitive = pictRunner.run(parameters, {
        constraintsText,
      });
      const outputCaseSensitive = pictRunner.run(parameters, {
        constraintsText,
        options: { caseSensitive: true },
      });

      expect(outputCaseInsensitive.result.header).toEqual(["OS", "B"]);
      expect(
        outputCaseInsensitive.result.body.every(([, b]) => b === "X"),
      ).toBe(true);
      expect(outputCaseSensitive.result.header).toEqual(["OS", "B"]);
      expect(outputCaseSensitive.result.body).toContainEqual(["Win10", "Y"]);
      expect(outputCaseSensitive.result.body).not.toContainEqual([
        "win10",
        "Y",
      ]);
    });

    it("should run with custom value separator", () => {
      const output = pictRunner.run(
        [
          { name: "A", values: "0;1" },
          { name: "B", values: "x;y" },
        ],
        { options: { valueSeparator: ";" } },
      );

      expect(output.result.header).toEqual(["A", "B"]);
      expect(output.result.body.length).toEqual(4);
      expect(output.result.body.map((m) => m.join(",")).toSorted()).toEqual([
        "0,x",
        "0,y",
        "1,x",
        "1,y",
      ]);
      expect(output.modelFile).toBe(`A: 0;1
B: x;y`);
      expect(output.message).toBe("");
    });

    it("should run with custom alias separator", () => {
      const output = pictRunner.run(
        [
          { name: "OS", values: "Windows$Win, Linux$Lin" },
          { name: "Browser", values: "Chrome, Firefox" },
        ],
        { options: { aliasSeparator: "$" } },
      );
      const osAliases = new Set(["Windows", "Win", "Linux", "Lin"]);

      expect(output.result.header).toEqual(["OS", "Browser"]);
      expect(output.result.body.length).toEqual(4);
      expect(output.result.body.every(([os]) => osAliases.has(os))).toBe(true);
      expect(output.result.body.some(([os]) => os.includes("$"))).toBe(false);
      expect(output.modelFile).toBe(`OS: Windows$Win, Linux$Lin
Browser: Chrome, Firefox`);
      expect(output.message).toBe("");
    });

    it("should run with custom negative value prefix", () => {
      const output = pictRunner.run(
        [
          { name: "A", values: "!1, 0, 1" },
          { name: "B", values: "!1, 0, 1" },
        ],
        { options: { negativeValuePrefix: "!" } },
      );

      expect(output.result.header).toEqual(["A", "B"]);
      expect(
        output.result.body.some(
          ([a, b]) => a.startsWith("!") && b.startsWith("!"),
        ),
      ).toBe(false);
      expect(
        output.result.body.some(
          ([a, b]) => a.startsWith("!") && !b.startsWith("!"),
        ),
      ).toBe(true);
      expect(
        output.result.body.some(
          ([a, b]) => !a.startsWith("!") && b.startsWith("!"),
        ),
      ).toBe(true);
      expect(output.modelFile).toBe(`A: !1, 0, 1
B: !1, 0, 1`);
      expect(output.message).toBe("");
    });
  });

  describe("run with seed rows", () => {
    let pictRunner: PictRunner;

    beforeEach(async () => {
      pictRunner = await PictRunner.create();
    });

    it("should include seeded rows when seedRowsText is provided", () => {
      const output = pictRunner.run(
        [
          { name: "A", values: "0, 1" },
          { name: "B", values: "0, 1" },
          { name: "C", values: "0, 1" },
          { name: "D", values: "0, 1" },
        ],
        {
          options: {
            seedRowsText: "A\tB\tC\tD\n0\t0\t0\t0",
          },
        },
      );

      expect(output.result.header).toEqual(["A", "B", "C", "D"]);
      expect(output.result.body).toContainEqual(["0", "0", "0", "0"]);
      expect(output.modelFile).toBe(`A: 0, 1
B: 0, 1
C: 0, 1
D: 0, 1`);
      expect(output.message).toBe("");
    });
  });

  describe("runModel", () => {
    let pictRunner: PictRunner;

    beforeEach(async () => {
      pictRunner = await PictRunner.create();
    });

    it("should run without errors when a raw model file includes submodels and constraints", () => {
      const modelFile = `A: Enabled, Disabled
B: x, y
C: p, q
D: Local, Remote

{ A, B, C } @ 3

IF [A] = "Enabled" THEN [D] = "Local";`;

      const output = pictRunner.runModel(modelFile);

      expect(output.result.header).toEqual(["A", "B", "C", "D"]);
      expect(output.result.body.length).toBeGreaterThan(0);
      expect(
        output.result.body.every(
          ([a, , , d]) => a !== "Enabled" || d === "Local",
        ),
      ).toBe(true);
      expect(output.modelFile).toBe(modelFile);
      expect(output.message).toBe("");
    });

    it("should include seeded rows when using a raw model file", () => {
      const modelFile = `A: 0, 1
B: 0, 1
C: 0, 1
D: 0, 1`;

      const output = pictRunner.runModel(modelFile, {
        options: {
          seedRowsText: "A\tB\tC\tD\n0\t0\t0\t0",
        },
      });

      expect(output.result.header).toEqual(["A", "B", "C", "D"]);
      expect(output.result.body).toContainEqual(["0", "0", "0", "0"]);
      expect(output.modelFile).toBe(modelFile);
      expect(output.message).toBe("");
    });
  });

  describe("error handling", () => {
    let pictRunner: PictRunner;

    beforeEach(async () => {
      pictRunner = await PictRunner.create();
    });

    describe("PictBadModelError", () => {
      it("should throw PictBadModelError when order is larger than number of parameters", () => {
        expect(() => {
          pictRunner.run(
            [
              { name: "A", values: "1, 2" },
              { name: "B", values: "x, y" },
            ],
            { options: { orderOfCombinations: 10 } },
          );
        }).toThrow(PictBadModelError);
      });

      it("should evaluate model case-insensitively by default", () => {
        expect(() => {
          pictRunner.run([
            { name: "OS", values: "Windows, Linux" },
            { name: "os", values: "windows, linux" },
          ]);
        }).toThrow(PictBadModelError);
      });

      it("should surface raw model file errors from WASM and preserve the exact model file text", () => {
        const modelFile = `A: 0, 1
A: x, y`;

        let thrownError: PictError | undefined;
        try {
          pictRunner.runModel(modelFile);
        } catch (error) {
          thrownError = error as PictError;
        }

        expect(thrownError).toBeDefined();
        expect(thrownError).toBeInstanceOf(PictBadModelError);
        expect(thrownError?.modelFile).toBe(modelFile);
      });
    });

    describe("PictBadOptionError", () => {
      it("should throw PictBadOptionError when order is 0", () => {
        expect(() => {
          pictRunner.run(
            [
              { name: "A", values: "1, 2" },
              { name: "B", values: "x, y" },
            ],
            { options: { orderOfCombinations: 0 } },
          );
        }).toThrow(PictBadOptionError);
      });

      it("should throw PictBadOptionError when runModel input is combined with constraintsText", () => {
        expect(() => {
          pictRunner.runModel("A: 0, 1", {
            constraintsText: 'IF [A] = "0" THEN [A] = "1";',
          } as never);
        }).toThrow(PictBadOptionError);
      });

      it("should throw PictBadOptionError when runModel input is combined with subModels", () => {
        expect(() => {
          pictRunner.runModel("A: 0, 1\nB: x, y", {
            subModels: [{ parameterNames: ["A", "B"], order: 2 }],
          } as never);
        }).toThrow(PictBadOptionError);
      });
    });

    describe("PictBadConstraintsError", () => {
      it("should throw PictBadConstraintsError when constraint syntax is invalid", () => {
        expect(() => {
          pictRunner.run(
            [
              { name: "OS", values: "Windows, Linux" },
              { name: "Browser", values: "Chrome, Firefox" },
            ],
            {
              constraintsText: 'IF [OS] = "Windows" THEN;', // Missing term after THEN
            },
          );
        }).toThrow(PictBadConstraintsError);
      });

      it("should throw PictBadConstraintsError when constraint has missing closing bracket", () => {
        expect(() => {
          pictRunner.run(
            [
              { name: "OS", values: "Windows, Linux" },
              { name: "Browser", values: "Chrome, Firefox" },
            ],
            {
              constraintsText: 'IF [OS = "Windows" THEN [Browser] = "Chrome";',
            },
          );
        }).toThrow(PictBadConstraintsError);
      });

      it("should throw PictBadConstraintsError when constraint has type mismatch", () => {
        expect(() => {
          pictRunner.run(
            [
              { name: "Size", values: "10, 20, 30" },
              { name: "Name", values: "A, B, C" },
            ],
            {
              constraintsText: 'IF [Size] = "text" THEN [Name] = "A";', // Size is numeric, comparing with string
            },
          );
        }).toThrow(PictBadConstraintsError);
      });
    });

    describe("error inheritance", () => {
      it("should allow catching all PICT errors with base PictError class", () => {
        let caughtError: PictError | undefined;
        try {
          pictRunner.run(
            [
              { name: "A", values: "1, 2" },
              { name: "B", values: "x, y" },
            ],
            { options: { orderOfCombinations: 10 } },
          );
        } catch (error) {
          caughtError = error as PictError;
        }
        expect(caughtError).toBeDefined();
        expect(caughtError).toBeInstanceOf(PictError);
      });

      it("should include modelFile in error for debugging", () => {
        let thrownError: PictError | undefined;
        try {
          pictRunner.run(
            [
              { name: "A", values: "1, 2" },
              { name: "B", values: "x, y" },
            ],
            {
              constraintsText: "invalid constraint syntax",
            },
          );
        } catch (error) {
          thrownError = error as PictError;
        }
        expect(thrownError).toBeDefined();
        expect(thrownError).toBeInstanceOf(PictError);
        expect(thrownError?.modelFile).toContain("A: 1, 2");
        expect(thrownError?.modelFile).toContain("B: x, y");
        expect(thrownError?.modelFile).toContain("invalid constraint syntax");
      });
    });
  });
});
