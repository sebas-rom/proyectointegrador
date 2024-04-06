import { cpSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { JSX, RendererEvent, ParameterType } from "typedoc";
import { getThemeCSSProperties } from "./theme.js";
const __dirname = dirname(fileURLToPath(import.meta.url));
/**
 * Called by TypeDoc when loaded as a plugin.
 */
export function load(app) {
  app.options.addDeclaration({
    name: "themeColor",
    help: "Material Theme: Material 3 source color to derive the theme from.",
    type: ParameterType.String,
    defaultValue: "#cb9820",
  });
  app.renderer.hooks.on("head.end", (event) =>
    JSX.createElement(
      JSX.Fragment,
      null,
      JSX.createElement(
        "style",
        null,
        JSX.createElement(JSX.Raw, {
          html: getThemeCSSProperties(app.options.getValue("themeColor")),
        })
      ),
      JSX.createElement("link", {
        rel: "stylesheet",
        href: event.relativeURL("assets/material-style.css"),
      })
    )
  );
  app.renderer.hooks.on("body.end", (event) =>
    JSX.createElement("script", null, JSX.createElement(JSX.Raw, { html: `` }))
  );
  app.listenTo(app.renderer, RendererEvent.END, () => {
    const from = resolve(__dirname, "../assets/style.css");
    const to = resolve(
      app.options.getValue("out"),
      "assets/material-style.css"
    );
    cpSync(from, to);
  });
}
