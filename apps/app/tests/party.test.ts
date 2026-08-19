import { describe, expect, it } from "vitest";
import { CHILD_FARE_AGE, childrenAgesFromCount, partyFromAnswers } from "../shared/party";

describe("structured passenger counts", () => {
  it("reads adults and children as separate numeric answers", () => {
    expect(partyFromAnswers({ adults: "2", children: "1" })).toEqual({
      adults: 2,
      children: 1,
      childrenAges: [CHILD_FARE_AGE],
    });
    expect(childrenAgesFromCount(3)).toEqual([CHILD_FARE_AGE, CHILD_FARE_AGE, CHILD_FARE_AGE]);
  });

  it("does not parse a free-text party sentence", () => {
    expect(partyFromAnswers({ party: "2 взрослых и ребёнок 8 лет" })).toEqual({
      children: 0,
      childrenAges: [],
    });
  });
});
