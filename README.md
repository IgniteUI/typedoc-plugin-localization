## typedoc-localization-plugin
[![Build Status](https://travis-ci.org/IgniteUI/typedoc-localization-plugin.svg?branch=master)](https://travis-ci.org/IgniteUI/typedoc-localization-plugin)
### Plugin

A plugin for [Typedoc](http://typedoc.org)

When using [Typedoc](http://typedoc.org) for API docs generation you may want to generate documentation with different languages.

By using this plugin you will be able to:
    <br />
 -> Merge all code comments(classes, methods, properties, enumerations etc.) that needs localization in a couple of json files.
    <br />
 -> Translate them.
    <br />
 -> Use the updated files to build a documentation for an entire project in the desired language.

### Installing

```
npm install typedoc-localization-plugin
```

### Using

#### Step 1
In order to generate the json representation of each module of your application you will have to execute the command below: 
```
typedoc `<main-file-with-all-exports>` --generate-json `<directory-to-export-json's>`
```

We can use [Ignite UI for Angular](https://github.com/IgniteUI/igniteui-angular) repository for Example:

```
typedoc projects\igniteui-angular\src\public_api.ts --generate-json exports
```

This command will create `exports` folder.
<br />
`projects\igniteui-angular\src\public_api.ts` This file contains the file structure of the project. It takes up to `two` levels.
<br />
For instance when you have a `/directory/inner-dir1/inner-dir2/file.ts` it will create the following structure `exports/directory/inner-dir1/` which will contains all files that are under it or files that are deeply nested.


#### Step 2

After the export of the JSON files finished, you should modify the comments in the desired language.

```JSON
{
    "IgxGridComponent": {
        "comment": {
            "text": [
                "The Ignite UI Grid is used for presenting and manipulating tabular data in the simplest way possible.  Once data",
                "has been bound, it can be manipulated through filtering, sorting & editing operations.",
                "",
                "Example:",
                "```html",
                "<igx-grid [data]=\"employeeData\" autoGenerate=\"false\">",
                "  <igx-column field=\"first\" header=\"First Name\"></igx-column>",
                "  <igx-column field=\"last\" header=\"Last Name\"></igx-column>",
                "  <igx-column field=\"role\" header=\"Role\"></igx-column>",
                "</igx-grid>",
                "```",
                ""
            ],
            "shortText": [
                "**Ignite UI for Angular Grid** -",
                "[Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid.html)"
            ]
        },
        "properties": {
            "data": {
                "comment": {
                    "shortText": [
                        "An @Input property that lets you fill the `IgxGridComponent` with an array of data.",
                        "```html",
                        "<igx-grid [data]=\"Data\" [autoGenerate]=\"true\"></igx-grid>",
                        "```"
                    ]
                }
            },
        ....
```

The structure of every file has the following representation:
```JSON
{
    "className": {
        "properties": {},
        "methods": {},
        "accessors": {},
        "functions": {}
    }
}
```
What is the difference between `methods` and `functions` keys? 
<br />
`Methods` key represents all methods releted to the class. 
<br />
`Functions` key represents all global functions declared into the file.

> If a current file does not contain any comments that have to be exported from the TypeDoc, it won't exists into the section with json files.

#### Step 3

When you finish with the translations you have to generate the documentation with the transleted files `(json's)`.
<br />
So the following command should be executed:
```
typedoc --generate-from-json `<json's-directory>` --out `<exported-doc-directory>`
```

`<json's-directory>` could be `exports` folder.
<br />
`<exported-doc-directory>` could be `dist\docs`
