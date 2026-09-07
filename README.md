# vscode-nsis

[![Version](https://img.shields.io/github/v/release/idleberg/vscode-nsis?style=for-the-badge)](https://github.com/idleberg/vscode-nsis/releases)
[![Build](https://img.shields.io/github/actions/workflow/status/idleberg/vscode-nsis/ci.yml?style=for-the-badge)](https://github.com/idleberg/vscode-nsis/actions)

Language syntax, snippets, formatter and build system for Nullsoft Scriptable Install
System (NSIS), with language intelligence provided by
[nsis-lsp](https://github.com/idleberg/nsis-lsp).

![Screenshot](https://raw.githubusercontent.com/idleberg/vscode-nsis/main/resources/screenshot.png)

_Screenshot of NSIS in Visual Studio Code with
[Hopscotch](https://marketplace.visualstudio.com/items?itemName=idleberg.hopscotch)
theme_

## Features

- Language intelligence, provided by the server:
  - code actions
  - completions
  - document symbols
  - find references
  - go-to-definition
  - on-hover information
  - rename symbol
  - signature help
- Language syntax for NSIS and NSIS Language Files
- Snippets for core NSIS commands, variables and predefines
- Snippets for core plug-ins
- Snippets for core libraries (“Useful Headers”)
- NSIS Diagnostics
- [Drunken NSIS](https://github.com/idleberg/vscode-nsis#drunken-nsis)
- [Formatting](https://github.com/idleberg/vscode-nsis#formatting)
- [Build Tools](https://github.com/idleberg/vscode-nsis#building)
- [Environment Variables](https://github.com/idleberg/vscode-nsis#environment-variables)
- Converting between NSIS language files and JSON, using _NSIS: Convert Language File_

You can further extend NSIS support with snippets for
[third-party plug-ins](https://github.com/idleberg/vscode-nsis-plugins).

## Installation

### Extension Marketplace

Launch Quick Open, paste the following command, and press <kbd>Enter</kbd>

`ext install idleberg.nsis`

### CLI

With [shell commands](https://code.visualstudio.com/docs/editor/command-line)
installed, you can use the following command to install the extension:

`$ code --install-extension idleberg.nsis`

Alternatively, you can download the packaged extension from the
[Open VSX Registry](https://open-vsx.org/) or install it using the
[`ovsx`](https://www.npmjs.com/package/ovsx) command-line tool:

```bash
$ ovsx get idleberg.nsis
```

Released packages bundle the language server for your platform, so there is
nothing else to install. On platforms without a prebuilt binary, install the
server yourself and the extension will find it on your `PATH`:

```bash
$ cargo install nsis-lsp
```

## Usage

### Snippets

With most commands, you can specify available options before completion. For
instance, rather than completing `RequestExecutionLevel` and then specifying an
option, you can directly choose `RequestExecutionLevel user` from the completion
menu.

To complete
[compile time commands](http://nsis.sourceforge.net/Docs/Chapter5.html#),
[variables](http://nsis.sourceforge.net/Docs/Chapter4.html#varother) or
[predefines](http://nsis.sourceforge.net/Docs/Chapter5.html#comppredefines),
make sure to _omit special characters_ like `!`, `$` and brackets:

- `include` completes to `!include`
- `INSTDIR` completes to `$INSTDIR`
- `NSIS_VERSION` completes to `${NSIS_VERSION}`

However, you have to type `__LINE__` to complete to `${__LINE__}`.

There are several special cases for your convenience:

- `MB_OK` completes to `MessageBox MB_OK "messagebox_text"`
- `onInit` completes to a `Function .onInit` block
- `LogicLib` completes to `!include "LogicLib.nsh"`

#### Drunken NSIS

Fuzzy syntax completions are available through “Drunken NSIS”, which tries to
iron out some of the inconsistencies in the NSIS language, for instance word
order.

**Examples:**

Interchangable word order of NSIS language and library functions

- `ReadFile` completes to `FileRead`
- `INIStrRead` completes to `ReadINIStr`
- `SetSectionText` completes to `SectionSetText`
- `SetLog` completes to `LogSet`
- `FirstFind` completes to `FindFirst`
- `${LineFind}` completes to `${FindLine}`

### Formatting

Scripts are formatted by the language server. To do so, run *Format Document* or
adjust your settings for auto-formatting.

**Example**

```json
{
	"editor.formatOnSave": true,
	"[nsis]": {
			"editor.defaultFormatter": "idleberg.nsis"
	},
}
```

The formatter is tweaked through the `nsis.formatter.*` settings —
`commentStyle`, `endOfLine`, `printWidth`, `singleQuote` and `trimEmptyLines`.
Indentation is not among them, since the formatter uses the editor's `tabSize`
and `insertSpaces`.

### Building

Before you can build, make sure `makensis` is in your PATH
[environment variable](http://superuser.com/a/284351/195953). Alternatively, you
can specify the path to `makensis` in your
[user settings](https://code.visualstudio.com/docs/customization/userandworkspace).

#### makensis

**Example:**

```json
{
	"nsis.makensis.path": "C:\\Program Files (x86)\\NSIS\\makensis.exe"
}
```

To trigger a build, select _NSIS: Save & Compile”_ from the
[command-palette](https://code.visualstudio.com/docs/editor/codebasics#_command-palette)
or use the default keyboard shortcut
<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>B</kbd>. The strict option treats warnings
as errors and can be triggered using
<kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>B</kbd>.

#### Wine

On macOS and Linux, `makensis` can be run through [Wine][wine] by enabling
`nsis.wine.runWithWine`. The setting is ignored on Windows.

> [!NOTE]
>
> Wine only applies to compiling. The language server runs `makensis` directly,
> so diagnostics are unavailable on a Wine-only setup.

#### Options

You can tweak your default settings by editing your
[user settings](https://code.visualstudio.com/Docs/customization/userandworkspace).

### Task Runner

If you prefer Visual Studio Code's built-in Task Runner to build scripts, you
can create `tasks.json` in the project root using the _NSIS: Create Build Task_
command from the
[command-palette](https://code.visualstudio.com/docs/editor/codebasics#_command-palette).

> [!NOTE]
>
> The created Task Runner will adapt to the
> [user settings](https://code.visualstudio.com/Docs/customization/userandworkspace)
> specified in `settings.json`.

### Environment Variables

`makensis` reads `NSISDIR` and `NSISCONFDIR` from the environment. Both are
picked up from your system-wide environment variables, and either can be
overridden per platform through the `terminal.integrated.env.*` setting, so a
workspace that already sets them for its terminal does not have to set them a
second time.

<details>
<summary><strong>Example</strong></summary>

```json
{
	"terminal.integrated.env.windows": {
		"NSISDIR": "C:\\Program Files (x86)\\NSIS"
	}
}
```

</details>

> [!NOTE]
>
> Some operating systems require Visual Studio Code to be launched from terminal
> in order to access system-wide environment variables.

Additionally, you can pass special environment variables prefixed with
`NSIS_APP_` to your installer script. They will be treated like normal
definitions and will be stringified at compile-time.

<details>
<summary><strong>Example</strong></summary>

```bash
$ export NSIS_APP_ENVIRONMENT=development
```

```nsis
# installer.nsi
!if ${NSIS_APP_ENVIRONMENT} == "development"
  DetailPrint "Valuable Debug Information"
!endif
```

</details>

> [!NOTE]
>
> Unlike `NSISDIR` and `NSISCONFDIR`, these are read from the environment Visual
> Studio Code itself was launched with. Setting them in
> `terminal.integrated.env.*` has no effect.

### File Encoding

This extension defaults to UTF-8 with BOM (`utf8bom`) for NSIS files. If you are working with older scripts, you can override the encoding in your workspace settings:


**Example**

```jsonc
{
	"[nsis]": {
		"files.encoding": "windows1252"
	}
}
```

Per workspace: Add "files.encoding": "windows1252" to the [nsis] section in your .vscode/settings.json
Per file: Click the encoding label in the status bar and choose Save with Encoding

## Related

- [node-makensis](https://www.npmjs.com/package/makensis)
- [vscode-electron-builder](https://marketplace.visualstudio.com/items?itemName=idleberg.electron-builder)
- [atom-language-nsis](https://atom.io/packages/language-nsis)

## License

If not otherwise specified (see below), files in this repository fall under
[The MIT License](https://opensource.org/licenses/MIT).

An exception is made for files in readable text which contain their own license
information, or files where an accompanying file exists (in the same directory)
with a “-license” suffix added to the base-name name of the original file, and
an extension of txt, html, or similar. For example “tidy” is accompanied by
“tidy-license.txt”.

The bundled language server is licensed under the Apache License, Version 2.0,
or The MIT License.

[wine]: https://winehq.org
[makensis]: http://nsis.sourceforge.net/Docs/Chapter3.html#usage
[ppo]: https://nsis.sourceforge.io/Docs/Chapter3.html#usagereference
