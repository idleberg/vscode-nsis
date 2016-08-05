# NSIS for Visual Studio Code

[![The MIT License](https://img.shields.io/badge/license-MIT-orange.svg?style=flat-square)](http://opensource.org/licenses/MIT)
[![Apache License](https://img.shields.io/badge/license-Apache%202.0-orange.svg?style=flat-square)](http://www.apache.org/licenses/LICENSE-2.0)
[![Packagist](https://img.shields.io/packagist/v/idleberg/vscode-nsis.svg?style=flat-square)](https://packagist.org/packages/idleberg/vscode-nsis)
[![Travis](https://img.shields.io/travis/idleberg/vscode-nsis.svg?style=flat-square)](https://travis-ci.org/idleberg/vscode-nsis)
[![David](https://img.shields.io/david/dev/idleberg/vscode-nsis.svg?style=flat-square)](https://david-dm.org/idleberg/vscode-nsis#info=devDependencies)

Language syntax and snippets for Nullsoft Scriptable Install System (NSIS).

## Features

* all core NSIS commands, variables and predefines
* all core Plugins:
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
* all core libraries (“Useful Headers”):
    * FileFunc
    * LogicLib
    * Memento
    * MultiUser
    * Sections
    * WinMessages
    * WinVer
    * WordFunc
    * x64
* [Drunken NSIS](#drunken-nsis) (fuzzy completions)

## Installation

### Extension Marketplace

Install `nsis` from Visual Studio Code's [Extension Marketplace](https://code.visualstudio.com/docs/editor/extension-gallery)

### GitHub

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

## Usage

### Completion

With most commands, you can specify available options before completion. For instance, rather than completing `RequestExecutionLevel` and then specifying an option, you can directly choose `RequestExecutionLevel user` from the completion menu.

To complete [compile time commands](http://nsis.sourceforge.net/Docs/Chapter5.html#), [variables](http://nsis.sourceforge.net/Docs/Chapter4.html#varother) or [predefines](http://nsis.sourceforge.net/Docs/Chapter5.html#comppredefines), make sure to *leave out* special characters like `!`, `$` and brackets:

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

* `FileRead` == `ReadFile`
* `ReadINIStr` == `INIStrRead`
* `SectionSetText` == `SetSectionText`
* `LogSet` == `SetLog`
* `FindFirst` == `FirstFind`
* `${FindLine}` == `${LineFind}`

## License

This work is dual-licensed under [The MIT License](https://opensource.org/licenses/MIT) and the [Apache License 2.0](http://www.apache.org/licenses/LICENSE-2.0)

## Donate

You are welcome support this project using [Flattr](https://flattr.com/submit/auto?user_id=idleberg&url=https://github.com/idleberg/vscode-nsis) or Bitcoin `17CXJuPsmhuTzFV2k4RKYwpEHVjskJktRd`