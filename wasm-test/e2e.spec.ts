import { describe, it, expect, beforeEach } from "vitest";
import { PictRunner } from "../dist/index.mjs";

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
      expect(output.header).toEqual([
        "Type",
        "Size",
        "Format method",
        "File system",
        "Cluster size",
        "Compression",
      ]);
      expect(output.body.length).toEqual(56);
      expect(output.body[0]).toEqual([
        "Span",
        "5000",
        "Slow",
        "NTFS",
        "16384",
        "OFF",
      ]);
      expect(output.body[27]).toEqual([
        "Single",
        "100",
        "Quick",
        "NTFS",
        "512",
        "OFF",
      ]);
      expect(output.body[55]).toEqual([
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
      expect(output.header).toEqual([
        "null",
        "⅛⅜⅝⅞",
        "社會科學院語學研究所",
        "╯°□°）╯︵ ┻━┻",
        "script alert0 /script",
      ]);
      expect(output.body.length).toEqual(18);
      expect(output.body[0]).toEqual([
        "false",
        "¡™£¢∞§¶•ªº–≠",
        "캄사함니다",
        "🇺🇸🇷🇺🇸🇦",
        "مرحبًا",
      ]);
      expect(output.body[8]).toEqual([
        "NaN",
        "٠١٢٣٤٥٦٧٨٩",
        "表ポあA鷗ŒéＢ逍Üßªąñ丂㐀𠀀",
        "🇺🇸🇷🇺🇸🇦",
        "مرحبًا",
      ]);
      expect(output.body[17]).toEqual([
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
      expect(output.header).toEqual([
        "Type",
        "Size",
        "Format method",
        "File system",
        "Cluster size",
        "Compression",
      ]);
      expect(output.body.length).toEqual(56);
      expect(output.body[0]).toEqual([
        "Stripe",
        "5000",
        "Quick",
        "NTFS",
        "16384",
        "OFF",
      ]);
      expect(output.body[27]).toEqual([
        "Mirror",
        "10000",
        "Slow",
        "NTFS",
        "16384",
        "ON",
      ]);
      expect(output.body[55]).toEqual([
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
      expect(output.header).toEqual([
        "Type",
        "Size",
        "Format method",
        "File system",
        "Cluster size",
        "Compression",
      ]);
      expect(output.body.length).toEqual(281);
      expect(output.body[0]).toEqual([
        "RAID-5",
        "10",
        "Slow",
        "NTFS",
        "1024",
        "OFF",
      ]);
      expect(output.body[140]).toEqual([
        "RAID-5",
        "1000",
        "Quick",
        "FAT32",
        "1024",
        "OFF",
      ]);
      expect(output.body[280]).toEqual([
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
      expect(output.header).toEqual([
        "Type",
        "Size",
        "Format method",
        "File system",
        "Cluster size",
        "Compression",
      ]);
      expect(output.body.length).toBeOneOf([55, 56, 57]); // slight variation due to randomness
      expect(output.modelFile).toBe(`Type: Single, Span, Stripe, Mirror, RAID-5
Size: 10, 100, 500, 1000, 5000, 10000, 40000
Format method: Quick, Slow
File system: FAT, FAT32, NTFS
Cluster size: 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536
Compression: ON, OFF`);
      expect(output.message).toMatch(/Used seed: [0-9]+/);
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
      expect(output.header).toEqual([
        "Type",
        "Size",
        "Format method",
        "File system",
        "Cluster size",
        "Compression",
      ]);
      expect(output.body.length).toEqual(56);
      expect(output.body[0]).toEqual([
        "Span",
        "5000",
        "Slow",
        "NTFS",
        "16384",
        "OFF",
      ]);
      expect(output.body[27]).toEqual([
        "Single",
        "100",
        "Quick",
        "NTFS",
        "512",
        "OFF",
      ]);
      expect(output.body[55]).toEqual([
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
  });
});
