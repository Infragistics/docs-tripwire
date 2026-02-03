<!-- <div style="display: flex; flex-flow: row; margin-bottom: 1rem; font-family: 'Titillium Web'">
    <img style="border-radius: 0.25rem; align-self: center; justify-content: left; " alt="Infragistics" src="https://www.infragistics.com/media/441501/horz_logo.png"/>
    <div style="display: flex; flex-flow: row; justify-content: center; margin-left: 1rem;
    align-items: center; font-family: 'Arial'; font-size: 24pt">Tripwire</div>
</div> -->

![Infragistics repository title](./ig-title.svg)

# Infragistics Tripwire Docs

Infragistics Tripwire is both the help viewer shell for online and offline help documentation as well as the home of the Grunt file build tasks to generate the help.


## Related Documents

- [The Build Process](docs/the-build-process.md)

## Overview

Tripwire works in conjunction with the [Ignite UI help topics repository](https://github.com/IgniteUI/help-topics),
which is the home for the help content documents. In order to get the
two repositories to work together there are a few setup steps which are
required.

## Setup
There are a few steps you need to do in order to get everything set up
correctly on your machine.

> **Note:** You must clone `tripwire` and `help-topics[-ja]` as siblings in the same root directory.

1. Clone this repository
2. Clone the [Ignite UI help topics repository](https://github.com/IgniteUI/help-topics)
3. Create the required [dynamic-linked directories](http://technet.microsoft.com/en-us/library/cc753194.aspx) by running the `create-linked-directories.bat` file in the root of this repository. (Technical details below.) 
4. Run `npm install` to install all the Grunt dependencies
5. [optional] If you've just installed Node you should also install the [Grunt CLI](http://gruntjs.com/getting-started#installing-the-cli) to enable the global `grunt` command with `npm install -g grunt-cli`.

## Build

To generate the help run one of the following:

  - `grunt offline` to generate the offline app
  - `grunt online` to generate the online app
  - `grunt` to generate both the online and offline apps

> **Note:** Platform/version configuration is done through parameters listed below. You can also pass a `--file` option as well to [Build a single file](#single-file) section.

#### Parameters

Some task options are [templated](http://gruntjs.com/configuring-tasks#templates) with global variables and also loadfiles from the `/config` folder all based on parameters. The available command line options are:

Option   | Type | Description | Default
-------- | ---- | ----------- | --------
`--major` | string | The major release version available throughout the configuration as `<%= major %>` | 15
`--minor` | string | Minor release version | 1
`--platform` | string | Documentation platform | jquery
`--latest` | bool |Only relevant to online builds. This outputs build files to the default root help folder of the MVC project. When `false` topics and images are placed under their own version folder (such as `help/14.1/..`). This setting also triggers appending of a version query (`/topic?v=14.1`) to all links in topics and table of contents. | true 
`--lang` | string | `en` or `ja` (Will also trigger localization of some parts of the applications) | en 
`--mvcapi` | bool | *Used in builds only.* Reads and incorporates external ToC nodes. Requires a `API_TOC.xml` from Document!X output. | none
`--index` | bool | *Used in builds only.* Requires localized tags xml file from `$/NetAdvantage/DEV/Common/ProductGuidance/Tags` if the language is not English. Use only if you need to manually update staging search. | none

The `platform` and `lang` options are combined to match a dynamically loaded configuration file like `config/jquery-en.json`. All variables from these files are loaded into global configuration and are therefore available for templating as well as being open to templates themselves.


So a common build like `grunt online` actually expands to:

	grunt online --platform=jquery --lang=en --major=15 --minor=1 --latest=true

Which will properly replace `%%version%%` variables in the docs as well as configure the version for API links and so on. 

#### Watchers

There are two configured [grunt watch](https://github.com/gruntjs/grunt-contrib-watch) targets that can trigger tasks when you modify a file:

- `grunt watch:css` Triggers the [sass](https://github.com/gruntjs/grunt-contrib-sass) and [autoprefixer](https://github.com/nDmitry/grunt-autoprefixer) tasks when a *.scss file changes. Use this to make changes to any of the CSS files, as they are all compiled into a main file.
- `grunt watch:md` Beta. Triggers a [single file build](#single-file) for the file that was changed. Does both online and offline builds by default, but can be controlled by passing either `--online` OR `--offline` parameter.

-----------------------------

### Creating a Dynamic-Linked Directory
In order to make the Markdown files that are in the help topics repository easily available to the Tripwire build files you must create a [dynamic-linked directory](http://technet.microsoft.com/en-us/library/cc753194.aspx) which effectively creates a folder alias from the Tripwire root to the `topics` folder in the `help-topics` repository.

The following image shows you how the `topics` folder under the `tripwire` repository is just a pointer to the `topics` folder in the `help-topics` repository

![](docs/images/tripwire-folders.png)

> Note the arrow on top of the topics folder indicating that it's a linked directory

#### Creating the Linked Directory
You can create a linked directory with a simple [command prompt utility called `mklink`](http://technet.microsoft.com/en-us/library/cc753194.aspx).

1. Open a command prompt
2. Run `mklink` to create the link between the link and target directories.

The following is an example of how you can use `mklink` to establish the link:

	mklink /j PATH_TO_NEW_LINK_DIRECTORY PATH_TO_EXISTING_DIRECTORY

or

	mklink /j "C:\Users\cshoemaker\Documents\IG\Projects\Tripwire\src\tripwire\topics" "C:\Users\cshoemaker\Documents\IG\Projects\Tripwire\src\help-topics\topics"

The arguments are:

- the `/j` parameter creates a [directory junction](http://technet.microsoft.com/en-us/library/cc753194.aspx)
- the first file path is the new directory link you want to create
  - think of this as creating a shortcut - this folder cannot exist prior to running the `mklink` command
- the second file path is the target directory you want to establish a link to

> **Note**: This same approach is used to keep the `Contents`, `images` and `styles` folders in sync between the online and offline applications.

### <a id="single-file"></a> Building single file
To build a single file rather than the entire help use the `--file` option to provide the **original** file path as it is in the topics folder/repo. This can be used with any build flavor - `default`, `offline` and `online`.

Example:

	grunt --file=C:\Users\dpetev\Documents\GitHub\tripwire\topics\02_Controls\igCombo\02_Binding_igCombo_to_Data\00_igCombo_Data_Binding.md

This will take your source file thought the process and produce html for the build you selected.

#### Accepted values for `--file`:

- Full path to the file as seen above (preferred)
	> Hint: You can *Shift + right-click* files in Explorer to "Copy as path" or use you editor-of-choice's option to copy the path if available.
- File name (will attempt to find it in the topics folder). Leading numbering and extension are optional:

		grunt offline --file=00_igCombo_Data_Binding.md
		grunt online --file=igCombo_Data_Binding.md
		grunt --file=igCombo_Data_Binding
- Can be wrapped in quotes if needed


#### Full rebuild for file with `--full`

Setting the `--full` flag will also allow tasks to cleanup old versions of the file and generate new Table of Contents. Example:

	grunt offline --file=00_igCombo_Data_Binding.md --full	

Copying specific to the topic images along is TBD.

<!-- 
## Tripwire Ported from IG DevOps Repository

https://infragistics.visualstudio.com/NetAdvantage/_git/tripwire -->
