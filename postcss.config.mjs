import path from "node:path";

const stripLabPluginPath = path.join(process.cwd(), "postcss.strip-lab-plugin.cjs");

const config = {
  plugins: {
    "@tailwindcss/postcss": {},
    [stripLabPluginPath]: {},
  },
};

export default config;
