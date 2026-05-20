import { describe, expect, it } from "vitest";
import {
  certificateLabelFromId,
  certificateSearchKey,
} from "./certificateLabels";

describe("certificateLabelFromId", () => {
  it.each([
    ["diploma-c-plus-plus", "Diploma C++"],
    ["diploma-csharp-introduccion", "Diploma C# Introduccion"],
    ["node-js-and-express-for-beginners", "Node.js And Express For Beginners"],
    ["Create-REST-APIs-with-Express-and-MongoDB", "Create REST APIs With Express And MongoDB"],
    ["introduction-to-html", "Introduction To HTML"],
    ["mlops-concepts", "MLOps Concepts"],
  ])("turns %s into %s", (id, expected) => {
    expect(certificateLabelFromId(id)).toBe(expected);
  });
});

describe("certificateSearchKey", () => {
  it("adds aliases for C++ certificates", () => {
    const label = certificateLabelFromId("diploma-c-plus-plus");
    const searchKey = certificateSearchKey("diploma-c-plus-plus", label);

    expect(searchKey).toContain("c++");
    expect(searchKey).toContain("cplusplus");
    expect(searchKey).toContain("cpp");
    expect(searchKey).toContain("c plus plus");
  });

  it("adds aliases for C# certificates", () => {
    const label = certificateLabelFromId("diploma-csharp");
    const searchKey = certificateSearchKey("diploma-csharp", label);

    expect(searchKey).toContain("c#");
    expect(searchKey).toContain("csharp");
    expect(searchKey).toContain("c sharp");
  });

  it("adds aliases for Node.js certificates", () => {
    const label = certificateLabelFromId("node-js-and-express-for-beginners");
    const searchKey = certificateSearchKey(
      "node-js-and-express-for-beginners",
      label,
    );

    expect(searchKey).toContain("node.js");
    expect(searchKey).toContain("nodejs");
    expect(searchKey).toContain("node js");
  });
});
