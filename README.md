# NSIS for Visual Studio Code

[![The MIT License](https://flat.badgen.net/badge/license/MIT/orange)](http://opensource.org/licenses/MIT)
[![GNU General Public License](https://flat.badgen.net/badge/license/GPL%20v2/orange)](http://www.gnu.org/licenses/gpl-2.0.html)
[![GitHub](https://flat.badgen.net/github/release/idleberg/vscode-nsis)](https://github.com/idleberg/vscode-nsis/releases)
[![Visual Studio Marketplace](https://vsmarketplacebadge.apphb.com/installs-short/idleberg.nsis.svg?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=idleberg.nsis)
[![CircleCI](https://flat.badgen.net/circleci/github/idleberg/vscode-nsis)](https://circleci.com/gh/idleberg/vscode-nsis)
[![David](https://flat.badgen.net/david/dep/idleberg/vscode-nsis)](https://david-dm.org/idleberg/vscode-nsis)
[![Gitter](https://flat.badgen.net/badge/chat/on%20gitter/ff69b4)](https://gitter.im/NSIS-Dev/vscode)

Language syntax, IntelliSense and build system for Nullsoft Scriptable Install System (NSIS).

![Screenshot](https://raw.githubusercontent.com/idleberg/vscode-nsis/master/images/screenshot.png)

*Screenshot of NSIS in Visual Studio Code with [Hopscotch](https://marketplace.visualstudio.com/items?itemName=idleberg.hopscotch) theme*

## Features

* Language syntax for NSIS, NSIS Language Files, [nsL Assembler](https://github.com/NSIS-Dev/nsl-assembler), and [BridleNSIS](https://github.com/henrikor2/bridlensis)
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
* IntelliSense for [nsL Assembler](https://github.com/NSIS-Dev/nsl-assembler)
* IntelliSense for [BridleNSIS](https://github.com/henrikor2/bridlensis)
* IntelliSense for [Haskell NSIS](https://hackage.haskell.org/package/nsis)
* [Drunken NSIS](https://github.com/idleberg/vscode-nsis#drunken-nsis)
* [Build Tools](https://github.com/idleberg/vscode-nsis#building)

You can further extend NSIS support with snippets for [third-party plug-ins](https://github.com/idleberg/vscode-nsis-plugins).

## Installation

### Extension Marketplace

Launch Quick Open, paste the following command, and press <kbd>Enter</kbd>

`ext install nsis`

### Packaged Extension

Download the package extension from the the [release page](https://github.com/idleberg/vscode-nsis/releases) and install it from the command-line:

```bash
$ code --install-extension nsis-*.vsix
```

### Clone Repository

Change to your Visual Studio Code extensions directory:

```bash
# Windows
$ cd %USERPROFILE%\.vscode\extensions

# Linux & macOS
$ cd ~/.vscode/extensions/
```

Clone repository as `nsis`:

```bash
$ git clone https://github.com/idleberg/vscode-nsis nsis
```

Install dependencies:

```bash
cd nsis && npm install
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

Fuzzy syntax completions are available through “Drunken NSIS”, which tries to iron out some of the inconsistencies of the NSIS language, for instance word order.

**Example:**

Interchangable word order of NSIS language and library functions

* `FileRead` equals `ReadFile`
* `ReadINIStr` equals `INIStrRead`
* `SectionSetText` equals `SetSectionText`
* `LogSet` equals `SetLog`
* `FindFirst` equals `FirstFind`
* `${FindLine}` equals `${LineFind}`

### Building

Before you can build, make sure `makensis` is in your PATH [environmental variable](http://superuser.com/a/284351/195953). Alternatively, you can specify the path to `makensis` in your [user settings](https://code.visualstudio.com/docs/customization/userandworkspace).

#### makensis

**Example:**

```json
"nsis.compilerArguments": "/WX /V3",
"nsis.pathToMakensis": "C:\\Program Files (x86)\\NSIS\\makensis.exe
```

To trigger a build, select *NSIS: Save & Compile”* from the [command-palette](https://code.visualstudio.com/docs/editor/codebasics#_command-palette) or use the default keyboard shortcut <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>B</kbd>. The strict option treats warnings as errors and can be triggered using <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>B</kbd>.

#### nsL Transpiler

As of version 2.0 of this package, you can transpile [nsL Assembler](https://github.com/NSIS-Dev/nsl-assembler) using the *NSIS: Transpile nsL code* command from the [command-palette](https://code.visualstudio.com/docs/editor/codebasics#_command-palette). The path to `nsL.jar` is specified in your [user settings](https://code.visualstudio.com/docs/customization/userandworkspace).

**Example:**

```json
"nsis.nsl.pathToJar": "/full/path/to/nsL.jar",
"nsis.nsl.customArguments": "/nomake /nopause",
```
#### BridleNSIS Transpiler

As of version 2.6 of this package, you can transpile [BridleNSIS](https://github.com/henrikor2/bridlensis) using the *NSIS: Transpile BridleNSIS code* command from the [command-palette](https://code.visualstudio.com/docs/editor/codebasics#_command-palette). The path to `BridleNSIS.jar` is specified in your [user settings](https://code.visualstudio.com/docs/customization/userandworkspace).

**Example:**

```json
"nsis.bridlensis.pathToJar": "/full/path/to/BridleNSIS.jar",
"nsis.bridlensis.customArguments": "-n /usr/local/bin/",
```

#### Options

You can tweak your default settings by editing your [user settings](https://code.visualstudio.com/Docs/customization/userandworkspace).

Setting                      | Description
-----------------------------|-----------------------------------------------------------
`pathToMakensis`             | Specify the full path to `makensis`
`compilerArguments`          | Specify the default arguments for `makensis`
`showNotifications`          | Show build notifications indicating success or failure
`alwaysShowOutput`           | If `false` the output channel will only be shown on errors
`alwaysOpenBuildTask`        | Specify whether to open the newly created build task
`showVersionAsInfoMessage`   | Specify whether to show version as message
`showFlagsAsObject`          | Specify whether to format compiler flags as JSON
`useWineToRun`               | Run compiled installers using [Wine](https://winehq.org)
`nsl.pathToJar`              | Specify the full path to `nsL.jar`
`nsl.customArguments`        | Specify the default arguments for nsL Assembler
`bridlensis.pathToJar`       | Specify the full path to `BridleNSIS.jar`
`bridlensis.customArguments` | Specify the default arguments for BridleNSIS
`bridlensis.nsisHome`        | Specify the NSIS home directory

#### Commands

Action                   |  Syntax             | Shortcut
-------------------------|---------------------|----------
Compile NSIS             | `source.nsis`       | <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>B</kbd>
Compile NSIS (strict)    | `source.nsis`       | <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>B</kbd>
Create Build Task        |`source.nsis`        | –
Command Reference        |`source.nsis`        | –
Show Version             |`source.nsis`        | –
Show Compiler Flags      |`source.nsis`        | –
Transpile nsL Assembler  |`source.nsl`         | <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>B</kbd>
Transpile BridleNSIS     |`source.nsis.bridle` | <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>B</kbd>
Convert Language File    |`source.nlf`         | -

### Task Runner

If you prefer Visual Studio Code's built-in Task Runner to build scripts, you can create `tasks.json` in the project root using the *NSIS: Create Build Task* command from the [command-palette](https://code.visualstudio.com/docs/editor/codebasics#_command-palette).

**Note:** The created Task Runner will adapt to the [user settings](https://code.visualstudio.com/Docs/customization/userandworkspace) specified in `settings.json`.

## Related

- [atom-language-nsis](https://atom.io/packages/language-nsis) - NSIS package for Atom
- [node-makensis](https://www.npmjs.com/package/makensis) - Node wrapper for `makensis`

## License

If not otherwise specified (see below), files in this repository fall under [The MIT License](https://opensource.org/licenses/MIT) and the [GNU General Public License, version 2.0](https://opensource.org/licenses/GPL-2.0).

An exception is made for files in readable text which contain their own license information, or files where an accompanying file exists (in the same directory) with a “-license” suffix added to the base-name name of the original file, and an extension of txt, html, or similar. For example “tidy” is accompanied by “tidy-license.txt”.

## Donate

You are welcome to support this project using [Flattr](https://flattr.com/submit/auto?user_id=idleberg&url=https://github.com/idleberg/vscode-nsis) or Bitcoin `17CXJuPsmhuTzFV2k4RKYwpEHVjskJktRd`
