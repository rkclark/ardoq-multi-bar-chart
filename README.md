Multi-Bar Chart Plugin for Ardoq
======

This plugin allows you generate multi-bar charts in [Ardoq](https://ardoq.com/) based on any numerical fields present in your model.

It takes inspiration from the out-of-the-box Statistics visualisation but offers more customisation, including the ability to:
- Select the fields that are displayed
- Switch the visual grouping of data on the x-axis between fields and components
- Easily switch the scope of the data displayed between your current selection and the workspace as a whole

## Usage and Examples

For this quick guide we will look at a basic workspace containing a set of parents (named "component") and their children (named "child"). It's a Flexible workspace and three component types are being used across a three-level hierarchy. There are six custom numeric fields in the workspace model, some are available to all component types and some are restricted. Here's a snapshot of the workspace:

![Example workspace](https://github.com/rkclark/multi-bar-chart/blob/master/ex_workspace.PNG)


## Installation

- Open the Ardoq plugin editor *(Refer to Ardoq help documentation for guidance if needed)*
- Click to create a new Plugin
- Give the plugin an ID and name. The name will be shown in the visualisation list.
- Copy and paste the code from sunburst.js into the code editor window, over-writing any existing code that may be there.
- Click to Save and Run the plugin. It will now be a selectable visualisation in your model!

---

*I hope you enjoy using the visualisation! Changes to the core Ardoq application may affect the plugin in the future, feel free to open an issue on this repo if you have any problems :)*

*Plugin working correctly as at Ardoq version Version: 3.4.60 / 1.39.16.*
