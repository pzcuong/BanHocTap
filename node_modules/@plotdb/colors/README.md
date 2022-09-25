# @plotdb/colors

get colors in your node.js console.


## Installation

    npm install --save @plotdb/colors


## Usage

    require("@plotdb/colors")
    console.log("some colored text".red);
    console.log("some colored text with red background".bgRed.yellow);
    colors.disable(); /* colored outputs are disabled after this */
    console.log("some text without style / color".bgRed.yellow);
    colors.enable(); /* colored outputs are disabled after this */
    console.log("color is back".bgRed.yellow);
 

## Colors and Styles

| fg      | bright fg     | bg        | bright bg       | styles        |
|---------|---------------|-----------|-----------------|---------------|
| black   | brightRed     | bgBlack   | bgBrightRed     | reset         |
| red     | brightGreen   | bgRed     | bgBrightGreen   | bold          |
| green   | brightYellow  | bgGreen   | bgBrightYellow  | dim           |
| yellow  | brightBlue    | bgYellow  | bgBrightBlue    | italic        |
| blue    | brightMagenta | bgBlue    | bgBrightMagenta | underline     |
| magenta | brightCyan    | bgMagenta | bgBrightCyan    | inverse       |
| cyan    | brightWhite   | bgCyan    | bgBrightWhite   | hidden        |
| white   |               | bgWhite   |                 | strikethrough |
| gray    |               | bgGray    |                 |               |
| grey    |               | bgGrey    |                 |               |


## Note

`@plotdb/colors` extends String.prototype directly which may not be a good approach.


## Reference

 - https://github.com/marak/colors.js/


## License

MIT

