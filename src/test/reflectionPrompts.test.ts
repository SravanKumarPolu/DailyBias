import { describe, it, expect } from "vitest";
import { getAllBiases } from "@/data/biases";
import { getReflectionPrompt, reflectionPrompts } from "@/data/reflectionPrompts";

describe("reflectionPrompts", () => {
  it("has a unique prompt for every bias", () => {
    const all = getAllBiases();
    expect(Object.keys(reflectionPrompts).length).toBe(all.length);
    for (const bias of all) {
      expect(reflectionPrompts[bias.id]).toBeTruthy();
      expect(getReflectionPrompt(bias.id).length).toBeGreaterThan(10);
    }
  });
});
