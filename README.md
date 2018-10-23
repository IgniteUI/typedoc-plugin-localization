## typedoc-plugin-localization
[![Build Status](https://travis-ci.org/IgniteUI/typedoc-plugin-localization.svg?branch=master)](https://travis-ci.org/IgniteUI/typedoc-plugin-localization)
[![npm version](https://badge.fury.io/js/typedoc-plugin-localization.svg)](https://badge.fury.io/js/typedoc-plugin-localization)

## Inspired and used by [igniteui-angular](https://github.com/IgniteUI/igniteui-angular)

### Plugin

A plugin for [Typedoc](http://typedoc.org)

When using [Typedoc](http://typedoc.org) for API docs generation you may want to generate documentation with different languages.

By using this plugin you will be able to:
 1. Merge all code comments(classes, methods, properties, enumerations etc.) that needs localization in a couple of json files.
 2. Translate them.
 3. Use the updated files to build a documentation for an entire project in the desired language.

### Installing

```
npm install typedoc-plugin-localization --save-dev
```

### Usage

#### Important notes
> Please take in mind that you are running your local npm packages by `npx` right before the command execution.
> <br />
> The alternative would be to install the plugin globally with `-g` at the end of the command.
> <br />
> Then you won't need to use `npx`.

> The plugin works with [typedoc](https://github.com/TypeStrong/typedoc) version@0.13.0 and above.

#### Arguments

* `--generate-json <path/to/jsons/directory/>`<br>
  Specifies the location where the JSON's should be written to.
* `--generate-from-json <path/to/generated/jsons>`<br>
  Specifies from where to get the loclized JSON's data.
* `--templateStrings <path/to/template-strings/json>`<br>
  Specifies the path to the JSON file which would contains your localized hardcoded template strings. Additional information could be found [here](#additional-information)
* `--localzie <localizaiton key>`<br>
  Specifies your localization key which would match the translations section in your templateStrings file. Additional information could be found [here](#additional-information)

#### Path variable descriptions
`<main-proj-dir>` - This file has to contain the file structure of the project.
    <br />
`<json-exports-dir>` - This file would contains all generated json files with retrieved comments.
    <br />
`<out-typedoc-dir>` - The directory where the documentation have to be generated

#### Step 1
In order to generate the json representation of each module of your application you will have to execute the command below: 
```
npx typedoc `<main-proj-dir>` --generate-json `<json-export-dir>`
```

We can use [Ignite UI for Angular](https://github.com/IgniteUI/igniteui-angular) repository for Example:

```
npx typedoc projects\igniteui-angular\src\ --generate-json exports
```

Folder `exports` will be automatically created

> This command will create `exports` folder.
> <br />
>`projects\igniteui-angular\src\` This directory contains the file structure of the project. It takes up to `two` levels.
> <br />
> For instance when you have a `/directory/inner-dir1/inner-dir2/file.ts` it will create the following structure `exports/directory/inner-dir1/` which   > will contains all files that are under it or files that are deeply nested.


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
        "accessors": {}
    }
}
```

> If a current file does not contain any comments that have to be exported from the TypeDoc, it won't exists into the section with json files.

> Every directory that would represents all generated JSON's would contains a file `globalFunctions.json`. There you could find all exported global functions witin your application. Please take in mind that if such a funcion doesn't contain any sort of comment it won't be exported!

#### Step 3

When you finish with the translations you will have to generate the documentation with the transleted files `(json's)`.
<br />
So the following command have to be executed:
```
npx typedoc `<main-proj-dir>` --generate-from-json `<json-exports-dir>` --out `<out-typedoc-dir>`
```

Example:
```
npx typedoc .\projects\igniteui-angular\src\ --generate-from-json .\exports\ --out localized
```

Folder `localized` will be automatically created.


#### Additional Information

For your convenience we have exposed a way to localize your hardcoded template strings. How? </br>
We have registered a helper function within our plugin which brings you the ability to achieve this. How to use it? </br>
Let's take an example of a `partial view`.

```html
        <ul>
            {{#each sources}}
                {{#if url}}
                    <li><span>Defined in</span> <a href="{{url}}">{{fileName}}:{{line}}</a></li>
                {{else}}
                    <li><span>Defined in</span> {{fileName}}:{{line}}</li>
                {{/if}}
            {{/each}}
        </ul>
```
Here we would like to translate "Defined in" hardcoded string. </br>

1. Create a file somewhere in your app which would contains all your definitions of hordcoded strings you would like to translate. </br>
    The structure of the file should be like this:
    ```json
    {
        localize-key: {
            "string": "translation"
        }
    }
    ```
    > The localization key is your responsibility. You can name it however you like. </br>

    In our case
    ```json
    {
        jp: {
            "Defined in": "定義："
        }
    }
    ```

2. Update your `partial view` with the helper `localize` function.
    ```html
        <ul>
            {{#each sources}}
                {{#if url}}
                    <li><span>{{#localize}}Defined in{{/localize}}</span> <a href="{{url}}">{{fileName}}:{{line}}</a></li>
                {{else}}
                    <li><span>{{#localize}}Defined in{{/localize}}</span> {{fileName}}:{{line}}</li>
                {{/if}}
            {{/each}}
        </ul>
    ```

3. Execute the translation command which would contain the `localization key` and the `path` to the `template strings` file. </br>
    For instance:
    ```
    npx typedoc `<main-proj-dir>` --localize `<localization-key>` --templateStrings <path/to/the/file>`
    ```
    In case of [igniteui-angular](https://github.com/IgniteUI/igniteui-angular) it would be:
    ```
    npx typedoc projects\igniteui-angular\src\ --localize jp --templateStrings ./extras/template/strings/shell-strings.json
    ```
    You can see how our template strings file looks like here [./extras/template/strings/shell-strings.json](https://github.com/IgniteUI/igniteui-angular/blob/master/extras/template/strings/shell-strings.json).