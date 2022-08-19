# vscode-nsis

[![The MIT License](https://flat.badgen.net/badge/license/MIT/orange)](http://opensource.org/licenses/MIT)
[![GNU General Public License](https://flat.badgen.net/badge/license/GPL%20v2/orange)](http://www.gnu.org/licenses/gpl-2.0.html)
[![GitHub](https://flat.badgen.net/github/release/idleberg/vscode-nsis)](https://github.com/idleberg/vscode-nsis/releases)
[![Visual Studio Marketplace](https://flat.badgen.net/vs-marketplace/i/idleberg.nsis)](https://marketplace.visualstudio.com/items?itemName=idleberg.nsis)
[![CI](https://img.shields.io/github/workflow/status/idleberg/vscode-nsis/CI?style=flat-square)](https://github.com/idleberg/vscode-nsis/actions)

Language syntax, IntelliSense and build system for Nullsoft Scriptable Install System (NSIS).

![Screenshot](https://raw.githubusercontent.com/idleberg/vscode-nsis/main/images/screenshot.png)

*Screenshot of NSIS in Visual Studio Code with [Hopscotch](https://marketplace.visualstudio.com/items?itemName=idleberg.hopscotch) theme*

## Features

* Language syntax for NSIS and NSIS Language Files
* IntelliSense for core NSIS commands, variables and predefines
* IntelliSense for core plug-ins:
    * AdvSplash
    * Banner
    * BgImage
    * Dialer
    * InstallOptions
    * LangDLL
    * Math
    * nsDialogs
    * nsExec
    * NSISdl
    * Splash
    * StartMenu
    * System
    * UserInfo
    * VPatch
* IntelliSense for core libraries (“Useful Headers”):
    * FileFunc
    * LogicLib
    * Memento
    * Modern UI
    * MultiUser
    * Sections
    * StrFunc
    * WinMessages
    * WinVer
    * WordFunc
    * x64
* NSIS Diagnostics
* [Drunken NSIS](https://github.com/idleberg/vscode-nsis#drunken-nsis)
* [Build Tools](https://github.com/idleberg/vscode-nsis#building)
* [Environment Variables](https://github.com/idleberg/vscode-nsis#environment-variables)

You can further extend NSIS support with IntelliSense for [third-party plug-ins](https://github.com/idleberg/vscode-nsis-plugins).

## Installation

### Extension Marketplace

Launch Quick Open, paste the following command, and press <kbd>Enter</kbd>

`ext install idleberg.nsis`

### CLI

With [shell commands](https://code.visualstudio.com/docs/editor/command-line) installed, you can use the following command to install the extension:

`$ code --install-extension idleberg.nsis`

### Packaged Extension

Download the packaged extension from the the [release page](https://github.com/idleberg/vscode-nsis/releases) and install it from the command-line:

```bash
$ code --install-extension path/to/nsis-*.vsix
```

Alternatively, you can download the packaged extension from the [Open VSX Registry](https://open-vsx.org/) or install it using the [`ovsx`](https://www.npmjs.com/package/ovsx) command-line tool:

```bash
$ ovsx get idleberg.nsis
```

### Clone Repository

Change to your Visual Studio Code extensions directory:

**Windows**

```powershell
# Powershell
cd $Env:USERPROFILE\.vscode\extensions
```

```cmd
:: Command Prompt
$ cd %USERPROFILE%\.vscode\extensions
```

**Linux & macOS**

```bash
$ cd ~/.vscode/extensions/
```

Clone repository as `idleberg.nsis`:

```bash
$ git clone https://github.com/idleberg/vscode-nsis idleberg.nsis
```

Inside the cloned directory, install dependencies using your preferred Node package manager:

```bash
$ yarn || npm install
```

Build the source:

```bash
yarn build || npm run build
```

## Usage

### IntelliSense

With most commands, you can specify available options before completion. For instance, rather than completing `RequestExecutionLevel` and then specifying an option, you can directly choose `RequestExecutionLevel user` from the completion menu.

To complete [compile time commands](http://nsis.sourceforge.net/Docs/Chapter5.html#), [variables](http://nsis.sourceforge.net/Docs/Chapter4.html#varother) or [predefines](http://nsis.sourceforge.net/Docs/Chapter5.html#comppredefines), make sure to *omit special characters* like `!`, `$` and brackets:

* `include` completes to `!include`
* `INSTDIR` completes to `$INSTDIR`
* `NSIS_VERSION` completes to `${NSIS_VERSION}`

However, you have to type `__LINE__` to complete to `${__LINE__}`.

There are several special cases for your convenience:

* `MB_OK` completes to `MessageBox MB_OK "messagebox_text"`
* `onInit` completes to a `Function .onInit` block
* `LogicLib` completes to `!include "LogicLib.nsh"`

#### Drunken NSIS

Fuzzy syntax completions are available through “Drunken NSIS”, which tries to iron out some of the inconsistencies in the NSIS language, for instance word order.

**Examples:**

Interchangable word order of NSIS language and library functions

* `ReadFile` completes to `FileRead`
* `INIStrRead` completes to `ReadINIStr`
* `SetSectionText` completes to `SectionSetText`
* `SetLog` completes to `LogSet`
* `FirstFind` completes to `FindFirst`
* `${LineFind}` completes to `${FindLine}`

### Building

Before you can build, make sure `makensis` is in your PATH [environment variable](http://superuser.com/a/284351/195953). Alternatively, you can specify the path to `makensis` in your [user settings](https://code.visualstudio.com/docs/customization/userandworkspace).

#### makensis

**Example:**

```json
{
  "nsis.compiler.pathToMakensis": "C:\\Program Files (x86)\\NSIS\\makensis.exe"
}
```

To trigger a build, select *NSIS: Save & Compile”* from the [command-palette](https://code.visualstudio.com/docs/editor/codebasics#_command-palette) or use the default keyboard shortcut <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>B</kbd>. The strict option treats warnings as errors and can be triggered using <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>B</kbd>.

#### Options

You can tweak your default settings by editing your [user settings](https://code.visualstudio.com/Docs/customization/userandworkspace).

### Task Runner

If you prefer Visual Studio Code's built-in Task Runner to build scripts, you can create `tasks.json` in the project root using the *NSIS: Create Build Task* command from the [command-palette](https://code.visualstudio.com/docs/editor/codebasics#_command-palette).

**Note:** The created Task Runner will adapt to the [user settings](https://code.visualstudio.com/Docs/customization/userandworkspace) specified in `settings.json`.

### Environment Variables

This extension supports a variety of ways to provide environment variables such as `NSISDIR` or `NSISCONFDIR`. The following precedence applies:

1. `terminal.integrated.shell.*` setting
2. `.env` files
3. system-wide environment variables

**Note:** Some operating systems require Visual Studio Code to be launched from terminal in order to access system-wide environment variables.

Additionally, you can pass special environment variables prefixed with `NSIS_APP_` as definitions to your installer script.

<details>
<summary><strong>Example</strong></summary>

```env
# .env
NSIS_APP_ENVIRONMENT=development
```

```nsis
# installer.nsi
!if ${NSIS_APP_ENVIRONMENT} == "development"
  DetailPrint "Valuable Debug Information"
!endif
```
</details>

## Related

- [node-makensis](https://www.npmjs.com/package/makensis)
- [vscode-electron-builder](https://marketplace.visualstudio.com/items?itemName=idleberg.electron-builder)
- [atom-language-nsis](https://atom.io/packages/language-nsis)

## License

If not otherwise specified (see below), files in this repository fall under [The MIT License](https://opensource.org/licenses/MIT) and the [GNU General Public License, version 2.0](https://opensource.org/licenses/GPL-2.0).

An exception is made for files in readable text which contain their own license information, or files where an accompanying file exists (in the same directory) with a “-license” suffix added to the base-name name of the original file, and an extension of txt, html, or similar. For example “tidy” is accompanied by “tidy-license.txt”.

[wine]: https://winehq.org
[makensis]: http://nsis.sourceforge.net/Docs/Chapter3.html#usage
[ppo]: https://nsis.sourceforge.io/Docs/Chapter3.html#usagereference
