# 2.8.0

- allow case-insensitive syntax

# 2.7.3

- organize syntax configuration into folder
- add `.vscodeignore`
- improve licensing description

# 2.7.2

- stricter checks (hopefully fixing #5)

# 2.7.1

- integrate `yarn.lock` into Travis CI tests

# 2.7.0

- BridleNSIS: add `nsisHome` option
- BridleNSIS: additional error check
- fix typo in build notifications

# 2.6.2

- BridleNSIS: improve error detection
- BridleNSIS: fix syntax pattern
- add `.jshintrc`

# 2.6.1

- BridleNSIS: add and update syntax patterns

# 2.6.0

- add syntax highlighting for BridleNSIS
- add IntelliSense for BridleNSIS
- add build command for BridleNSIS

# 2.5.11

- extend highlighting support to transpiled [BridleNSIS](https://github.com/henrikor2/bridlensis) scripts

# 2.5.10

- use local settings in build tasks

# 2.5.9

- fix: wait for document to be saved before compiling

# 2.5.8

- `nsl.tmLanguage`: update patterns in quotes

# 2.5.7

- improve escape character pattern

# 2.5.6

- modify build notifications
- fix unescaped `$` in scaffolding snippet

# 2.5.5

- `core.Haskell.json`: fix unescaped `$` in scaffolding snippet

# 2.5.4

- `core.Haskell.json`: fix Section snippets

# 2.5.3

- fix badly escaped curly braces

# 2.5.2

- add error notification for illegible build task creation
- create `.vscode` folder if necessary
- remove `getDefaultPrefix()`

# 2.5.1

- add option whether to open generated build task
- update Haskell snippets

# 2.5.0

- add command to create build task
- modify config handling

# 2.4.1

- fix typo

# 2.4.0

- add [Haskell](https://hackage.haskell.org/package/nsis) snippets
- makensis: log error to console
- nsL Assembler
  - log error to console
  - add build shortcut
- Linter bumped to Gulp v4
- update `README.md`
- update `devDependencies`

# 2.3.1

- remove unused dependency

# 2.3.0

- add [Output Channel](https://code.visualstudio.com/Docs/extensionAPI/vscode-api#OutputChannel) support for build commands (closes #4)
- add new options `showNotifications` and `alwaysShowOutput`
- remove task-runner snippets (replacements soon?)
- use `spawn` over `exec`

# 2.2.8

- use `\t` in snippets

# 2.2.7

- nsL Assembler: split up `entity.name.section.nsl` pattern

# 2.2.6

- nsL Assembler: fix `entity.name.section.nsl` pattern

# 2.2.5

- nsL Assembler
  - update syntax patterns
  - fix comment delimiter inside `#nsis` snippet

# 2.2.4

- revert default transpiler flags
- improve build notifications
- update screenshot

# 2.2.2

- improve build notifications
- update screenshot

# 2.2.1

- modify default transpiler flags

# 2.2.0

- nsL Assembler: add support for custom arguments

# 2.1.0

- `nsl.tmLanguage`: add support for NSIS syntax inside #nsis blocks

# 2.0.2

- simplified nsL build command
- rename build command
- update `devDependencies`

# 2.0.1

- fix build system for nsL Assember

# 2.0.0

- add language syntax for nsL Assembler
- add build system for nsL Assembler
- add IntelliSense for nsL Assembler
- improve `nlf.configuration.json`
- improve `nsis.configuration.json`

# 1.3.4

- improve handling of `compilerArguments`

# 1.3.3

- add `%PackEXEHeader` and `%UninstallExeName` to Drunken NSIS snippets

# 1.3.2

- add more deprecated commands

# 1.3.1

- update scope for `Function`, `PageEx`, `Section` and `SectionGroup` blocks

# 1.3.0

(this really should have been `v1.2.1`, sorry!)
- add `$PROGRAMFILES32` and `$PROGRAMFILES64`
- fix scope for language variables

# 1.2.0

- `nsis.tmLanguage`: split up core library patterns for better maintainability 
- `nlf.tmLanguage`: update patterns and scopes (merge from Sublime Text package)

# 1.1.1

- remove deprecated commands
- add `SetPluginUnload` alias to Drunken NSIS

# 1.1.0

- update `nsis.tmLanguage`
  - add support for variables/constants in quotes
  - add language variables
  - add core libraries
  - add highlighting of deprecated commands
  - modify scopes
- update `.travis.yml`
- fix unescaped `$` in snippets

# 1.0.2

- escape ampersand in NLF syntax file

# 1.0.1

- fix scaffolding snippet name

# 1.0.0

- `nsis.tmLanguage`: improve RegEx patterns
- replace JSON linter
- remove Node 4 test
- update description

# 0.8.2

- update `gulpfile.js`

# 0.8.1

- `use babel` everywhere
- add `.eslintrc`

# 0.8.0

- add strict build option

# 0.7.6

- add description URL for Modern UI v1.x snippets

# 0.7.5

- add missing description for `CreateShortcut`

# 0.7.4

- improve documentation
- update dependencies

# 0.7.3

- add description to install packaged extension (`.vsix`)

# 0.7.2

- fix Modern UI scaffolding snippet
- modify scaffolding prefixes

# 0.7.1

- modify default build keybinding (as suggested by guidelines)

# 0.7.0

- add scaffolding-snippet for `task.json`

# 0.6.1

- some house-keeping

# 0.6.0

- add settings for build system

# 0.6.2

- rename settings
- improve success message

# 0.5.1

- modify build shortcut

# 0.5.0

- add rudimentary build system
- fix `lineComment`

# 0.4.2

- rename misnamed snippets

# 0.4.1

- register missing snippets

# 0.4.0

- add support for `MultiUser.nsh`
- add support for `StrStr.nsh`
- add support for `MUI2.nsh` (and `MUI.nsh`)
- improve descriptions for some of the snippets

# 0.3.0

- merge descriptions from `atom-language-nsis@v5.0.0`

# 0.2.1

- update description

# 0.2.0

- add support for NSIS Language Files (.nlf)

# 0.1.1

- add screenshot
- fix scaffolding snippets

# 0.1.0

- first release
