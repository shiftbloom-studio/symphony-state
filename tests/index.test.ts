import { TEMPLATE_PACKAGE_NAME } from "../src/index";

describe("template package", () => {
  it("exports something", () => {
    expect(TEMPLATE_PACKAGE_NAME).toBe("@your-scope/your-package");
  });
});

