const sass = require("node-sass");
const jsonImporter = require("node-sass-json-importer");
const fs = require("fs");

// Get our Design Token JSON

let stylesFilePath = "library/styles.tokens.json";
let styles = JSON.parse(fs.readFileSync(stylesFilePath, "utf-8"));

// Repair invalid JSON output in SASS from Design Tokens

function filterObject(obj, key) {
  for (var i in obj) {
    if (!obj.hasOwnProperty(i)) continue;
    if (i == key) {
      delete obj[key];
    } else if (typeof obj[i] == "object") {
      filterObject(obj[i], key);
    }
  }
  return obj;
}
styles = filterObject(styles, "extensions");

// Save these fixes as will be imported again at the next step

fs.writeFile(
  stylesFilePath,
  JSON.stringify(styles, null, 2),
  function (error: any) {
    if (error) {
      return console.error(error);
    }

    console.info(`Fixed styles to ${stylesFilePath}`);
  }
);

// Generate our CSS selectors using SASS

let outputFilePath = "dist/styles.css";

sass.render(
  {
    file: "src/styles.scss",
    importer: jsonImporter(),
    outFile: outputFilePath,
    outputStyle: "compressed",
  },
  function (error: any, result: { css: any }) {
    if (error) {
      return console.error(error);
    }

    // No errors during the compilation, write this result to /dist

    fs.writeFile(outputFilePath, result.css, function (error: any) {
      if (error) {
        return console.error(error);
      }

      console.info(`Built to ${outputFilePath}`);
    });
  }
);
