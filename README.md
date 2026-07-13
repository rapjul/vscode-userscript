# Scriptmonkey

A simple UserScript language support extension which provides syntax highlight, completion, hover, and code snippets.

Most features of Scriptmonkey activates only when filename ends with `.user.js` by default to prevent polluting non-UserScript JavaScript files.

You can modify the extension settings to make Scriptmonkey work in other JavaScript files.

## Features

### Syntax Highlight

- **Metadata**

![Metadata highlight](images/metadata.png)

- **CSS in GM_addstyle**

![GM_addstyle highlight](images/GM_addstyle.png)

### Completion

- **Metadata**

![Metadata Completion](images/meta_completion.gif)

- **Code**

![Code Completion](images/code_completion.gif)

### Hover

![Code Hover](images/code_hover.png)

### Code Snippets

Type `userscript` to generate a UserScript template. You can modify the default values of some metadata keys in the extension settings.

![Code Snippets](images/code_snippets.gif)

## Release Notes

Please check [CHANGELOG](CHANGELOG.md).

## License

![MIT](https://img.shields.io/github/license/andywang425/vscode-scriptmonkey?style=for-the-badge)

## Special Thanks

- [kufii](https://github.com/kufii): The metadata highlight feature of Scriptmonkey is improved from [vscode-userscript](https://github.com/kufii/vscode-userscript).
