import SpryJs from "./spryjs";

export default function spryjs(port?: number | string): SpryJs {

  const app = new SpryJs(port);

  return app as any as SpryJs;
}

if (typeof module !== 'undefined') {
  module.exports = Object.assign(spryjs, module.exports);
}