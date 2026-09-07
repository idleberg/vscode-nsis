# NSIS LSP

> Language intelligence for [Nullsoft Scriptable Install System](https://nsis.sourceforge.io/) scripts, powered by [nsis-lsp](https://github.com/idleberg/nsis-lsp).

This extension is a thin client for `nsis-lsp`, an opinionated language server for NSIS written in Rust. The server is maintained once and shared with the Nova, Sublime Text and Zed editor integrations.

## Features

Language intelligence, provided by the server:

- code actions
- code formatting
- compiler diagnostics
- completions
- document symbols
- find references
- go-to-definition
- on-hover information
- rename symbol
- signature help
- syntax highlighting for NSIS scripts, NSIS language files and MakeNSIS logs, including NSIS code blocks in Markdown
- snippets for the NSIS core, its standard headers and the bundled plugins

Build system, provided by the extension:

- save & compile the current script, with the compiler's output in its own panel and **Run** and **Reveal** actions for the installer it produced
- scaffold a `tasks.json` with plain and strict build tasks
- ctrl-click `!include` and `LoadLanguageFile` paths to open them, including `${NSISDIR}` and the compiler's own search directories
- report the compiler's version and the flags it was built with
- optionally run the compiler through [Wine](https://www.winehq.org/) on macOS and Linux

Converting NSIS language files is the one feature still exclusive to the older [NSIS](https://marketplace.visualstudio.com/items?itemName=idleberg.nsis) extension. The two overlap everywhere else, so installing both registers the same languages, grammars, snippets and compile keybinding twice — pick one.

## Installation

Install from the [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=idleberg.nsis) or [Open VSX](https://open-vsx.org/extension/idleberg/nsis).

Released packages bundle the language server for your platform, so there is nothing else to install. On platforms without a prebuilt binary, install the server yourself and the extension will find it on your `PATH`:

```sh
cargo install nsis-lsp
# or
brew install idleberg/asahi/nsis-lsp
# or
scoop bucket add nsis https://github.com/NSIS-Dev/scoop-nsis && scoop install nsis/lsp
```

Compiling scripts and compiler diagnostics additionally require [`makensis`](https://nsis.sourceforge.io/Download) on your `PATH`, or a path set in `nsis.makensis.path`.

## Settings

| Setting | Default | Description |
| --- | --- | --- |
| `nsis.serverPath` | `""` | Path to the `nsis-lsp` binary. Empty uses the bundled binary, then your `PATH`. |
| `nsis.makensis.path` | `""` | Path to `makensis`. Empty searches your `PATH`. |
| `nsis.compiler.verbosity` | `3` | How much the compiler reports, from `0` (none) to `4` (all). |
| `nsis.compiler.strictMode` | `false` | Treat compiler warnings as errors on every build. |
| `nsis.compiler.customArguments` | `[]` | Additional arguments passed to `makensis`. |
| `nsis.compiler.processHeaders` | `Disallow` | Whether `.nsh` files can be compiled directly. |
| `nsis.compiler.showNotifications` | `true` | Notify whether a build succeeded or failed. |
| `nsis.compiler.showOutputView` | `On Errors` | When to reveal the **NSIS Compiler** panel. |
| `nsis.compiler.showFlagsAsObject` | `true` | Format the compiler flags as JSON. |
| `nsis.compiler.showVersionAsInfoMessage` | `false` | Report the compiler version as a notification. |
| `nsis.buildTask.openAfterCreation` | `true` | Open `tasks.json` once it has been written. |
| `nsis.wine.runWithWine` | `false` | Run `makensis` through Wine. Ignored on Windows. |
| `nsis.wine.pathToWine` | `wine` | Path to the `wine` binary. |
| `nsis.diagnostics.enabledOnSave` | `true` | Run compiler diagnostics on save. |
| `nsis.diagnostics.preprocessMode` | `ppo` | `ppo`, `safe_ppo`, or `none` for a full compilation. |
| `nsis.formatter.commentStyle` | `(preserve)` | Normalise line comments to `#` (`hash`) or `;` (`semi`). |
| `nsis.formatter.endOfLine` | `(auto)` | End of line sequence for formatted output. |
| `nsis.formatter.printWidth` | `0` | Line width before breaking with `\` continuations. `0` disables wrapping. |
| `nsis.formatter.singleQuote` | `false` | Prefer single quotes over double quotes. |
| `nsis.formatter.trimEmptyLines` | `true` | Collapse runs of blank lines. |
| `nsis.trace.server` | `off` | Trace the communication with the language server. |

Indentation is not configurable here — the formatter uses the editor's `tabSize` and `insertSpaces`.

Wine only applies to compiling. The server runs `makensis` directly, so diagnostics are unavailable on a Wine-only setup.

## Commands

| Command | Keybinding |
| --- | --- |
| **NSIS: Save & Compile Script** | <kbd>ctrl+shift+b</kbd> / <kbd>cmd+alt+b</kbd> |
| **NSIS: Save & Compile Script (strict)** | <kbd>ctrl+alt+shift+b</kbd> / <kbd>cmd+alt+shift+b</kbd> |
| **NSIS: Create Build Task** | |
| **NSIS: Show Compiler Version** | |
| **NSIS: Show Compiler Flags** | |
| **NSIS: Open Settings** | |
| **NSIS: Restart Language Server** | |
| **NSIS: Show Language Server Output** | |
| **NSIS: Show Language Server Version** | |

## Development

```sh
pnpm install
pnpm run build
pnpm run fetch:server   # downloads the server for your platform into server/
```

Press <kbd>F5</kbd> to launch an Extension Development Host. Set `NSIS_LSP_BINARY` to point at a locally built server, for example `target/release/nsis-lsp`, to test server changes without repackaging.

Releases are built per platform. The pinned server version lives in the `nsisLspVersion` field of `package.json`, and `scripts/fetch-server.mts` pulls the matching binary out of the `@nsis/lsp-*` npm packages before `vsce package --target <target>`.

## License

This work is licensed under [The MIT License](LICENSE). The bundled language server is licensed under the Apache License, Version 2.0, or The MIT License.
