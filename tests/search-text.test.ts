import { describe, expect, it } from "vitest";
import {
  escapeLikePattern,
  findFoldedRange,
  foldDiacritics,
} from "@/lib/search-text";

describe("foldDiacritics", () => {
  it("strips Albanian diacritics and lowercases", () => {
    expect(foldDiacritics("Gjakovë")).toBe("gjakove");
    expect(foldDiacritics("Çarshia e Vjetër")).toBe("carshia e vjeter");
  });

  it("is idempotent on already-folded input", () => {
    expect(foldDiacritics("gjakove")).toBe("gjakove");
  });

  it("returns empty string for diacritic-only input", () => {
    expect(foldDiacritics("̈")).toBe("");
  });
});

describe("findFoldedRange", () => {
  it("finds an ASCII substring inside a diacritic-bearing title", () => {
    expect(findFoldedRange("Filigree Bracelet", "filigree")).toEqual([0, 8]);
  });

  it("finds a diacritic-folded query inside the original text", () => {
    // "gjakove" (no diacritic) inside "Byzylyk Filigrani Gjakovë"
    const text = "Byzylyk Filigrani Gjakovë";
    const range = findFoldedRange(text, "gjakove");
    expect(range).not.toBeNull();
    const [from, to] = range!;
    expect(text.slice(from, to)).toBe("Gjakovë");
  });

  it("finds a substring in the middle of the text", () => {
    expect(findFoldedRange("Authentic Filigrani Ring", "filigrani")).toEqual([
      10,
      19,
    ]);
  });

  it("returns null when no match", () => {
    expect(findFoldedRange("Filigree", "xnotfoundx")).toBeNull();
  });

  it("returns null for empty/diacritic-only query", () => {
    expect(findFoldedRange("Filigree", "")).toBeNull();
    expect(findFoldedRange("Filigree", "̈")).toBeNull();
  });

  it("indices map back to the original (unfolded) text", () => {
    const text = "Çarshia e Vjetër";
    const range = findFoldedRange(text, "vjeter");
    expect(range).not.toBeNull();
    const [from, to] = range!;
    expect(text.slice(from, to)).toBe("Vjetër");
  });
});

describe("escapeLikePattern", () => {
  it("escapes % and _", () => {
    expect(escapeLikePattern("50%")).toBe("50!%");
    expect(escapeLikePattern("a_b")).toBe("a!_b");
  });

  it("escapes the escape char itself", () => {
    expect(escapeLikePattern("hi!there")).toBe("hi!!there");
  });

  it("leaves ordinary text alone", () => {
    expect(escapeLikePattern("gjakove")).toBe("gjakove");
    expect(escapeLikePattern("Gjakovë")).toBe("Gjakovë");
  });

  it("escapes every wildcard in a mixed string", () => {
    expect(escapeLikePattern("a%b_c!d")).toBe("a!%b!_c!!d");
  });
});
