## typedoc-localization-plugin
[![Build Status](https://travis-ci.org/IgniteUI/typedoc-localization-plugin.svg?branch=master)](https://travis-ci.org/IgniteUI/typedoc-localization-plugin)
### Plugin

A plugin for [Typedoc](http://typedoc.org)

When using [Typedoc](http://typedoc.org) for API docs generation you may want to generate documentation with different languages.

By using this plugin you will be able to:
 -> Merge all code comments(classes, methods, properties, enumerations etc.) that needs localization in a couple of files.
 -> Translate them.
 -> Use the updated files to build a documentation for an entire project in the desired language.

### Installing

```
npm install --save typedoc-localization-plugin
```

### Using

#### 1-step
```
typedoc --generate `<directory-to-export-json's>` <from-where-to-export>
```

For example Ignite UI for Angular

```
typedoc projects\igniteui-angular\src\public_api.ts --generate exports
```

Will create `exports` folder.
`projects\igniteui-angular\src\public_api.ts` This file contain the file structure of the projects. It takes up to `two` levels.


#### 2-step

After JSON files are generated, you should modify the comments in the desired language.

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

#### 3-step

Generate TypeDoc documentation with the modified files.

```
typedoc --generate-from-json `<json's-directory>` --out <to-generate-documentation-directory>
```

`<json's-directory>` will be `exports` folder.
`<to-generate-documentation-directory>` will be `dist\docs`

