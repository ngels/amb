const stripUnsupportedColorFunctions = () => ({
  postcssPlugin: "strip-lab-color-functions",
  AtRule(atRule) {
    if (atRule.name === "supports" && /color:\s*lab/i.test(atRule.params)) {
      atRule.remove();
    }
  },
  Declaration(decl) {
    if (typeof decl.value === "string" && decl.value.includes("color-mix(in oklab")) {
      decl.value = decl.value.replace(/color-mix\(in oklab/gi, "color-mix(in srgb");
    }
  },
});

stripUnsupportedColorFunctions.postcss = true;

module.exports = stripUnsupportedColorFunctions;
