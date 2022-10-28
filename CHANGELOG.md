# v3.52.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.52.0)

- add support for `${Case}` variants
- improve handling of missing `makensis`
- fix UTM parameters
- update links to online documentation
- update dependencies

# v3.51.3 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.51.3)

- fix regression in syntax highlighter
- fix bug in verbosity config
- update tooling
- update dependencies
  
# v3.51.2 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.51.2)

- update dependencies, fixes NLF conversion

# v3.51.1 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.51.1)

- remove unused `Target` attribute

# v3.51.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.51.0)

- add support for undocumented `Target` keyword

# v3.50.1 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.50.1)

- update `makensis` to fix compiler flags output
- update dependencies

# v3.50.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.50.0)

- add option to unset default verbosity
- remove dependency on `idleberg.haskell-nsis`
- update dependencies

# v3.49.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.49.0)

- outsource Haskell snippets to separate package
- update dependencies

# v3.48.1 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.48.1)

- remove unused dependencies
- change wording
- update dependencies

# v3.48.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.48.0)

- add `showOutputView` option
- add "Show Output" button when compilation fails
- remove `alwaysShowOutput` option
- remove quotes from `Function` snippet
- update dependencies

# v3.47.1 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.47.1)

- fix unescaped snippets
 
# v3.47.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.47.0)

- add option to disable `processHeaders` warning

# v3.46.1 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.46.1)

- improve `onEnterRules` patterns

# v3.46.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.46.0)

- add `onEnterRules`
- update dependencies

# v3.45.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.45.0)

- add option to specify `pathToWine`
- rename `useWineToRun`to `wine.runWithWine`

# v3.44.4 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.44.4)

- fix lint script

# v3.44.3 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.44.3)

- fix bad escaping in `LangString` and `LicenseLangString` snippets
- fix variables regex pattern to support single-character names
- fix language strings regex pattern
- replace `lefthook` with `husky`

# v3.44.2 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.44.2)

- fix variables regex pattern

# v3.44.1 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.44.1)

- update regex pattern for variables and defines
 
# v3.44.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.44.0)

- consume magic environmental feature from `makensis`
- update dependencies

# v3.43.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.43.0)

- add NSIS v3.08 support

# v3.42.6 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.42.6)

- update dependencies

# v3.42.5 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.42.5)

- update dependencies

# v3.42.4 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.42.4)

- fix Haskell NSIS snippets
- replace `husky` with `lefthook`
- switch CI provider

# v3.42.3 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.42.3)

- fix broken returns

# v3.42.2 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.42.2)

- fix environment variable name

# v3.42.1 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.42.1)

- implement workaround for missing locale settings
- update dependencies

# v3.42.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.42.0)

- add `diagnostics.enableDiagostics` option
- add `diagnostics.excludedFiles` option
- regroup existing diagnostics options
- add support for DotEnv variable expansion
- update build script
- update dependencies

# v3.41.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.41.0)

- add support to detect syntax from shebang
- update dependencies

# v3.40.2 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.40.2)

- fix `getSpawnEnv()` on Windows
- fix platform mapping
- fix watch mode
- fix order of arguments in build task
- update dependencies

# v3.40.1 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.40.1)

- update dependencies

# v3.40.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.40.0)

- fix breaking change with VSCode v1.54
- update `makensis` method to hide deprecation warning
- update dependencies

# v3.39.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.39.0)

- migrate to `esbuild` as bundler

# v3.38.1 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.38.1)

- differentiate between editor and global commands
- update dependencies

# v3.38.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.38.0)

- **Breaking change:** group compiler settings
  - `nsis.pathToMakensis` ➞ `nsis.compiler.pathToMakensis`
  - `nsis.compilerVerbosity` ➞ `nsis.compiler.verbosity`
  - `nsis.preprocessMode` ➞ `nsis.compiler.preprocessMode`
  - `nsis.overrideCompression` ➞ `nsis.compiler.overrideCompression`
- add `nsis.compiler.strictMode` setting
- add `nsis.compiler.customArguments` setting
- fix `overrideCompression` usage
- use `which` module
- update dependencies

# v3.37.2 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.37.2)

- revert changes to rollup config
- remove obsolete documentation

# v3.37.1 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.37.1)

- update rollup config

# v3.37.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.37.0)

- add *Open Settings* command
- add `overrideCompression` option
- remove `compilerArguments` option
- rename `allowHeaderCompilation` option to `processHeaders`
- refactor output channel handling
- catch error when creating `.vscode` folder
- fix warning detection in diagnostics mode
- modify linting scripts
- update dependencies

# v3.36.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.36.0)

- add `System::Int64Op` snippet
- fix: prevent diagnostics mode from creating installers

# v3.35.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.35.0)

- remove nsL Assembler dependency
- modify logo
- update dependencies

# v3.34.1 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.34.1)

- fix workspace detection

# v3.34.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.34.0)

- modify default behaviour for `NSIS_APP_*` environment variables

# v3.33.3 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.33.3)

- fix `getProjectPath()` for single files
- update dependencies

# v3.33.2 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.33.2)

- move environment detection to `rollup.config.js`

# v3.33.1 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.33.1)

- fix typo in variable name

# v3.33.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.33.0)

- add support for `NSIS_APP_*` environment variables
- initialize DotEnv early in package activation

# v3.32.1 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.32.1)

- update documentation
- update dependencies

# v3.32.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.32.0)

- add support for variable substitution when reading config
- add `processHeaders` option
- add filter to *Open Settings* buttons
- remove fallback blocks
- fix: use `pathToMakensis` in diagnostics mode
- refactor thenable code into async/await
- update dependencies

# v3.31.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.31.0)

- migrate to Rollup as bundler
- migrate to ESLint as linter
- replace development linter
- use ES6 in `gulpfile.js`
- refactor language file conversion
- update dependencies

# v3.30.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.30.0)

- add support for environment variables
- add support for DotEnv files
- update dependencies

# v3.29.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.29.0)

- remove BridleNSIS dependency
- prepare deprecation of nsL Assembler support
- update dependencies

# v3.28.1 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.28.1)

- fix NSIS 3.06 snippets

# v3.28.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.28.0)

- add NSIS v3.06 syntax
- update dependencies

# v3.27.1 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.27.1)

- update dependencies

# v3.27.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.27.0)

- remove highlighting for URLs
- remove dependency on `IBM.output-colorizer`
- update dependencies

# v3.26.1 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.26.1)

- minor refactoring
- remove `yarn.lock`
- update dependencies

# v3.26.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.26.0)

- prepare deprecation of BridleNSIS support

# v3.25.2 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.25.2)

- remove `node_modules` from tarball
- update dependencies

# v3.25.1 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.25.1)

- change default pre-processor mode
- update dependencies

# v3.25.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.25.0)

- add pre-processor mode in diagnostics
- modify settings description

# v3.24.1 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.24.1)

- fix misassigned Markdown description
- update dependencies

# v3.24.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.24.0)

- add ANSI deprecation warning
- add `muteANSIDeprecationWarning` option
- modify `Open Settings` button action

# v3.23.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.23.0)

- add diagnostics support
- fix URLs in snippets
- update dependencies

# v3.22.1 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.22.1)

- scaffolding snippets default to Unicode
- update dependencies

# v3.22.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.22.0)

- add missing NSIS v3.05 command
- remove `nsis-plugins` package dependency

# v3.21.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.21.0)

- add package dependencies
- update dependencies

# v3.20.5 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.20.5)

- update dependencies

# v3.20.4 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.20.4)

- fix running installers with UAC

# v3.20.3 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.20.3)

- fix class name and symbol for function snippets
- fix indentation character in snippets
- update dependencies

# v3.20.2 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.20.2)

- fix strict build task

# v3.20.1 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.20.1)

- improve argument validation
- improve path detection
- improve error messages

# v3.20.1 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.20.1)

- minor refactoring
- remove `yarn.lock`
- update dependencies

# v3.20.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.20.0)

- add error message for invalid arguments format
- fix argument handling in task
- update dependencies

# v3.19.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.19.0)

- add support for Tasks v2.0.0
- improve argument detection

# v3.18.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.18.0)

- **Breaking:** modify argument handling for `makensis`, nsL Assembler and BridleNSIS
- use Markdown descriptions in settings
- use production mode for Webpack
- refactor code
- update dependencies

# v3.17.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.17.0)

- compiled with Webpack
- update dependencies

# v3.16.5 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.16.5)

- fix `.vscodeignore`

# v3.16.4 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.16.4)

- update scripts
- update ignore-files

# v3.16.3 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.16.3)

- fix `postinstall` script

# v3.16.2 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.16.2)

- modify TypeScript config
- update dependencies
- fix prepublish script

# v3.16.1 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.16.1)

- fix command reference on NSIS v3.04

# v3.16.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.16.0)

- add support for NSIS v3.04
- update dependencies

# v3.15.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.15.0)

- add support to convert JSON to NLF

# v3.14.1 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.14.1)

- add support for `@nsis/nlf@0.5`

# v3.14.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/v3.14.0)

- add `IsNative*` macros (from NSIS v3.04)
- add *NSIS: Convert Language File* command
- update dependencies

# v3.13.2 [#](https://github.com/idleberg/vscode-nsis/releases/tag/3.13.2)

- fix check for outfile path
- use NSIS logo from npm

# v3.13.1 [#](https://github.com/idleberg/vscode-nsis/releases/tag/3.13.1)

- print `fs.access` error to `console.error`
- catch empty output file

# v3.13.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/3.13.0)

- add Reveal button
- minor bug-fixes

# v3.12.5 [#](https://github.com/idleberg/vscode-nsis/releases/tag/3.12.5)

- fix (even more) unescaped dollar-symbols

# v3.12.4 [#](https://github.com/idleberg/vscode-nsis/releases/tag/3.12.4)

- fix (more) unescaped dollar-symbols

# v3.12.3 [#](https://github.com/idleberg/vscode-nsis/releases/tag/3.12.3)

- fix unescaped dollar-symbols

# v3.12.2 [#](https://github.com/idleberg/vscode-nsis/releases/tag/3.12.2)

- adjust URL parameters

# v3.12.1 [#](https://github.com/idleberg/vscode-nsis/releases/tag/3.12.1)

- fix typo

# v3.12.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/3.12.0)

- overhaul snippets

# v3.11.1 [#](https://github.com/idleberg/vscode-nsis/releases/tag/3.11.1)

- modify command name & icon
- update dependencies

# v3.11.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/3.11.0)

- add `NSIS: Look up command online` command
- modify URL in snippet popover

# v3.10.1 [#](https://github.com/idleberg/vscode-nsis/releases/tag/3.10.1)

- update `Section` snippet

# v3.10.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/3.10.0)

- add `PEDllCharacteristics`
- add `PESubsysVer`

# v3.9.1 [#](https://github.com/idleberg/vscode-nsis/releases/tag/3.9.1)

- modify default comment delimiter
- update scaffolding snippets

# v3.9.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/3.9.0)

- add `showVersionAsInfoMessage` option
- add `showFlagsAsObject` option
- update `.vscodeignore`

# v3.8.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/3.8.0)

- make use of `makensis` module
- Drunken NSIS: add support for NSIS 3.03
- nsL Assembler: fix snippet
- add `.editorconfig`
- replace linter

# v3.7.1 [#](https://github.com/idleberg/vscode-nsis/releases/tag/3.7.1)

- fix typo in snippet

# v3.7.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/3.7.0)

- add support for NSIS 3.03

# v3.6.5 [#](https://github.com/idleberg/vscode-nsis/releases/tag/3.6.5)

- fix typo in scaffolding snippet
- update `devDependencies`

# v3.6.4 [#](https://github.com/idleberg/vscode-nsis/releases/tag/3.6.4)

- improve types

# v3.6.3 [#](https://github.com/idleberg/vscode-nsis/releases/tag/3.6.3)

- minor code improvements
- update `README.md`

# v3.6.2 [#](https://github.com/idleberg/vscode-nsis/releases/tag/3.6.2)

- update development toolchain
- update Travis CI configuration

# v3.6.1 [#](https://github.com/idleberg/vscode-nsis/releases/tag/3.6.1)

- fix strict build task

# v3.6.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/3.6.0)

- add highlighting support for URLs
- update `devDependencies`

# v3.5.2 [#](https://github.com/idleberg/vscode-nsis/releases/tag/3.5.2)

- specify menu order
- icon refinements

# v3.5.1 [#](https://github.com/idleberg/vscode-nsis/releases/tag/3.5.1)

- adjust icon colors & fills

# v3.5.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/3.5.0)

- add more menu icons
- replace existing menu icons

# v3.4.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/3.4.0)

- add menu icons
- modify macOS keybindings

# v3.3.3 [#](https://github.com/idleberg/vscode-nsis/releases/tag/3.3.3)

- fix tab-stop order in `WriteRegNone` snippets
- modify all trailing tab-stops

# v3.3.2 [#](https://github.com/idleberg/vscode-nsis/releases/tag/3.3.2)

- add snippet for new `WriteRegNone` command

# v3.3.1 [#](https://github.com/idleberg/vscode-nsis/releases/tag/3.3.1)

- fix unescaped characters in snippets

# v3.3.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/3.3.0)

- add support for NSIS 3.02
- add support for NSIS Dialog Designer files

# v3.2.6 [#](https://github.com/idleberg/vscode-nsis/releases/tag/3.2.6)

- improve `runInstaller()` function

# v3.2.5 [#](https://github.com/idleberg/vscode-nsis/releases/tag/3.2.5)

- improve BridleNSIS error detection

# v3.2.4 [#](https://github.com/idleberg/vscode-nsis/releases/tag/3.2.4)

- fix BridleNSIS output name

# v3.2.3 [#](https://github.com/idleberg/vscode-nsis/releases/tag/3.2.3)

- use `spawn` in `runInstaller()`
- update documentation

# v3.2.2 [#](https://github.com/idleberg/vscode-nsis/releases/tag/3.2.2)

- fix outfile detection
- update `devDependencies`

# v3.2.1 [#](https://github.com/idleberg/vscode-nsis/releases/tag/3.2.1)

- improve Regex pattern in `detectOutfile()`

# v3.2.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/3.2.0)

- add support for running compiled installer using [Wine](https://www.winehq.org/)
- fix: add missing button to open scripts transpiled by BridleNSIS
- fix: modify BrideNSIS file extensions

# v3.1.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/3.1.0)

- add `makensis` detection
- add buttons to PATH warning
- add button to compiler success message
- add buttons to transpiler success message
- add helper utilities
- declare all functions as constants
- use package version in build task
- fix: add missing output channel
- fix: modify BrideNSIS file extensions

# v3.0.3 [#](https://github.com/idleberg/vscode-nsis/releases/tag/3.0.3)

- use PNG logo (as required by upcoming versions of Code)

# v3.0.2 [#](https://github.com/idleberg/vscode-nsis/releases/tag/3.0.2)

- use “fat arrow” functions everywhere

# v3.0.1 [#](https://github.com/idleberg/vscode-nsis/releases/tag/3.0.1)

- fix unescaped characters in some snippets

# v3.0.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/3.0.0)

- convert to TypeScript
- add `NSIS: Show Version` command
- add `NSIS: Show Compiler Flags` command
- fix unescaped constants in some snippets

# v2.9.2 [#](https://github.com/idleberg/vscode-nsis/releases/tag/2.9.2)

- update devDependencies

# v2.9.1 [#](https://github.com/idleberg/vscode-nsis/releases/tag/2.9.1)

- update `CHANGELOG.md`

# v2.9.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/2.9.0)

- refactored code
- update `devDependencies`

# v2.8.1 [#](https://github.com/idleberg/vscode-nsis/releases/tag/2.8.1)

- include `CHANGELOG.md`

# v2.8.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/2.8.0)

- allow case-insensitive syntax

# v2.7.3 [#](https://github.com/idleberg/vscode-nsis/releases/tag/2.7.3)

- organize syntax configuration into folder
- add `.vscodeignore`
- improve licensing description

# v2.7.2 [#](https://github.com/idleberg/vscode-nsis/releases/tag/2.7.2)

- stricter checks (hopefully fixing #5)

# v2.7.1 [#](https://github.com/idleberg/vscode-nsis/releases/tag/2.7.1)

- integrate `yarn.lock` into Travis CI tests

# v2.7.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/2.7.0)

- BridleNSIS: add `nsisHome` option
- BridleNSIS: additional error check
- fix typo in build notifications

# v2.6.2 [#](https://github.com/idleberg/vscode-nsis/releases/tag/2.6.2)

- BridleNSIS: improve error detection
- BridleNSIS: fix syntax pattern
- add `.jshintrc`

# v2.6.1 [#](https://github.com/idleberg/vscode-nsis/releases/tag/2.6.1)

- BridleNSIS: add and update syntax patterns

# v2.6.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/2.6.0)

- add syntax highlighting for BridleNSIS
- add IntelliSense for BridleNSIS
- add build command for BridleNSIS

# v2.5.11 [#](https://github.com/idleberg/vscode-nsis/releases/tag/2.5.11)

- extend highlighting support to transpiled [BridleNSIS](https://github.com/henrikor2/bridlensis) scripts

# v2.5.10 [#](https://github.com/idleberg/vscode-nsis/releases/tag/2.5.10)

- use local settings in build tasks

# v2.5.9 [#](https://github.com/idleberg/vscode-nsis/releases/tag/2.5.9)

- fix: wait for document to be saved before compiling

# v2.5.8 [#](https://github.com/idleberg/vscode-nsis/releases/tag/2.5.8)

- `nsl.tmLanguage`: update patterns in quotes

# v2.5.7 [#](https://github.com/idleberg/vscode-nsis/releases/tag/2.5.7)

- improve escape character pattern

# v2.5.6 [#](https://github.com/idleberg/vscode-nsis/releases/tag/2.5.6)

- modify build notifications
- fix unescaped `$` in scaffolding snippet

# v2.5.5 [#](https://github.com/idleberg/vscode-nsis/releases/tag/2.5.5)

- `core.Haskell.json`: fix unescaped `$` in scaffolding snippet

# v2.5.4 [#](https://github.com/idleberg/vscode-nsis/releases/tag/2.5.4)

- `core.Haskell.json`: fix Section snippets

# v2.5.3 [#](https://github.com/idleberg/vscode-nsis/releases/tag/2.5.3)

- fix badly escaped curly braces

# v2.5.2 [#](https://github.com/idleberg/vscode-nsis/releases/tag/2.5.2)

- add error notification for illegible build task creation
- create `.vscode` folder if necessary
- remove `getDefaultPrefix()`

# v2.5.1 [#](https://github.com/idleberg/vscode-nsis/releases/tag/2.5.1)

- add option whether to open generated build task
- update Haskell snippets

# v2.5.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/2.5.0)

- add command to create build task
- modify config handling

# v2.4.1 [#](https://github.com/idleberg/vscode-nsis/releases/tag/2.4.1)

- fix typo

# v2.4.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/2.4.0)

- add [Haskell](https://hackage.haskell.org/package/nsis) snippets
- makensis: log error to console
- nsL Assembler
  - log error to console
  - add build shortcut
- Linter bumped to Gulp v4
- update `README.md`
- update `devDependencies`

# v2.3.1 [#](https://github.com/idleberg/vscode-nsis/releases/tag/2.3.1)

- remove unused dependency

# v2.3.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/2.3.0)

- add [Output Channel](https://code.visualstudio.com/Docs/extensionAPI/vscode-api#OutputChannel) support for build commands (closes #4)
- add new options `showNotifications` and `alwaysShowOutput`
- remove task-runner snippets (replacements soon?)
- use `spawn` over `exec`

# v2.2.8 [#](https://github.com/idleberg/vscode-nsis/releases/tag/2.2.8)

- use `\t` in snippets

# v2.2.7 [#](https://github.com/idleberg/vscode-nsis/releases/tag/2.2.7)

- nsL Assembler: split up `entity.name.section.nsl` pattern

# v2.2.6 [#](https://github.com/idleberg/vscode-nsis/releases/tag/2.2.6)

- nsL Assembler: fix `entity.name.section.nsl` pattern

# v2.2.5 [#](https://github.com/idleberg/vscode-nsis/releases/tag/2.2.5)

- nsL Assembler
  - update syntax patterns
  - fix comment delimiter inside `#nsis` snippet

# v2.2.4 [#](https://github.com/idleberg/vscode-nsis/releases/tag/2.2.4)

- revert default transpiler flags
- improve build notifications
- update screenshot

# v2.2.2 [#](https://github.com/idleberg/vscode-nsis/releases/tag/2.2.2)

- improve build notifications
- update screenshot

# v2.2.1 [#](https://github.com/idleberg/vscode-nsis/releases/tag/2.2.1)

- modify default transpiler flags

# v2.2.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/2.2.0)

- nsL Assembler: add support for custom arguments

# v2.1.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/2.1.0)

- `nsl.tmLanguage`: add support for NSIS syntax inside #nsis blocks

# v2.0.2 [#](https://github.com/idleberg/vscode-nsis/releases/tag/2.0.2)

- simplified nsL build command
- rename build command
- update `devDependencies`

# v2.0.1 [#](https://github.com/idleberg/vscode-nsis/releases/tag/2.0.1)

- fix build system for nsL Assember

# v2.0.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/2.0.0)

- add language syntax for nsL Assembler
- add build system for nsL Assembler
- add IntelliSense for nsL Assembler
- improve `nlf.configuration.json`
- improve `nsis.configuration.json`

# v1.3.4 [#](https://github.com/idleberg/vscode-nsis/releases/tag/1.3.4)

- improve handling of `compilerArguments`

# v1.3.3 [#](https://github.com/idleberg/vscode-nsis/releases/tag/1.3.3)

- add `%PackEXEHeader` and `%UninstallExeName` to Drunken NSIS snippets

# v1.3.2 [#](https://github.com/idleberg/vscode-nsis/releases/tag/1.3.2)

- add more deprecated commands

# v1.3.1 [#](https://github.com/idleberg/vscode-nsis/releases/tag/1.3.1)

- update scope for `Function`, `PageEx`, `Section` and `SectionGroup` blocks

# v1.3.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/1.3.0)

(this really should have been `v1.2.1`, sorry!)
- add `$PROGRAMFILES32` and `$PROGRAMFILES64`
- fix scope for language variables

# v1.2.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/1.2.0)

- `nsis.tmLanguage`: split up core library patterns for better maintainability
- `nlf.tmLanguage`: update patterns and scopes (merge from Sublime Text package)

# v1.1.1 [#](https://github.com/idleberg/vscode-nsis/releases/tag/1.1.1)

- remove deprecated commands
- add `SetPluginUnload` alias to Drunken NSIS

# v1.1.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/1.1.0)

- update `nsis.tmLanguage`
  - add support for variables/constants in quotes
  - add language variables
  - add core libraries
  - add highlighting of deprecated commands
  - modify scopes
- update `.travis.yml`
- fix unescaped `$` in snippets

# v1.0.2 [#](https://github.com/idleberg/vscode-nsis/releases/tag/1.0.2)

- escape ampersand in NLF syntax file

# v1.0.1 [#](https://github.com/idleberg/vscode-nsis/releases/tag/1.0.1)

- fix scaffolding snippet name

# v1.0.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/1.0.0)

- `nsis.tmLanguage`: improve RegEx patterns
- replace JSON linter
- remove Node 4 test
- update description

# v0.8.2 [#](https://github.com/idleberg/vscode-nsis/releases/tag/0.8.2)

- update `gulpfile.js`

# v0.8.1 [#](https://github.com/idleberg/vscode-nsis/releases/tag/0.8.1)

- `use babel` everywhere
- add `.eslintrc`

# v0.8.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/0.8.0)

- add strict build option

# v0.7.6 [#](https://github.com/idleberg/vscode-nsis/releases/tag/0.7.6)

- add description URL for Modern UI v1.x snippets

# v0.7.5 [#](https://github.com/idleberg/vscode-nsis/releases/tag/0.7.5)

- add missing description for `CreateShortcut`

# v0.7.4 [#](https://github.com/idleberg/vscode-nsis/releases/tag/0.7.4)

- improve documentation
- update dependencies

# v0.7.3 [#](https://github.com/idleberg/vscode-nsis/releases/tag/0.7.3)

- add description to install packaged extension (`.vsix`)

# v0.7.2 [#](https://github.com/idleberg/vscode-nsis/releases/tag/0.7.2)

- fix Modern UI scaffolding snippet
- modify scaffolding prefixes

# v0.7.1 [#](https://github.com/idleberg/vscode-nsis/releases/tag/0.7.1)

- modify default build keybinding (as suggested by guidelines)

# v0.7.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/0.7.0)

- add scaffolding-snippet for `task.json`

# v0.6.2 [#](https://github.com/idleberg/vscode-nsis/releases/tag/0.6.2)

- rename settings
- improve success message

# v0.6.1 [#](https://github.com/idleberg/vscode-nsis/releases/tag/0.6.1)

- some house-keeping

# v0.6.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/0.6.0)

- add settings for build system

# v0.5.1 [#](https://github.com/idleberg/vscode-nsis/releases/tag/0.5.1)

- modify build shortcut

# v0.5.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/0.5.0)

- add rudimentary build system
- fix `lineComment`

# v0.4.2 [#](https://github.com/idleberg/vscode-nsis/releases/tag/0.4.2)

- rename misnamed snippets

# v0.4.1 [#](https://github.com/idleberg/vscode-nsis/releases/tag/0.4.1)

- register missing snippets

# v0.4.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/0.4.0)

- add support for `MultiUser.nsh`
- add support for `StrStr.nsh`
- add support for `MUI2.nsh` (and `MUI.nsh`)
- improve descriptions for some of the snippets

# v0.3.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/0.3.0)

- merge descriptions from `atom-language-nsis@v5.0.0`

# v0.2.1 [#](https://github.com/idleberg/vscode-nsis/releases/tag/0.2.1)

- update description

# v0.2.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/0.2.0)

- add support for NSIS Language Files (.nlf)

# v0.1.1 [#](https://github.com/idleberg/vscode-nsis/releases/tag/0.1.1)

- add screenshot
- fix scaffolding snippets

# v0.1.0 [#](https://github.com/idleberg/vscode-nsis/releases/tag/0.1.0)

- first release
