Multi-Bar Chart Plugin for Ardoq
======

This plugin allows you generate multi-bar charts in [Ardoq](https://ardoq.com/) based on any numerical fields present in your model.

It takes inspiration from the out-of-the-box Statistics visualisation but offers more customisation, including the ability to:
- Select the fields that are displayed
- Switch the visual grouping of data between fields and components
- Easily switch the scope of the data displayed between your current selection and the workspace as a whole

*Created using [NVD3's Stacked/Grouped Multi-Bar Chart components for d3](http://nvd3.org/examples/multiBar.html). The colors in the chart are based on Kelly's 22 Colors of Maximum Contrast, available [here](https://gist.github.com/ollieglass/f6ddd781eeae1d24e391265432297538).*

## Usage and Examples

For this quick guide we will look at a basic workspace containing a set of parents (named "component") and their children (named "child"). It's a Flexible workspace and three component types are being used across a three-level hierarchy. There are six custom numeric fields in the workspace model, some are available to all component types and some are restricted. Here's a snapshot of the workspace:

![Example workspace](https://github.com/rkclark/ardoq-multi-bar-chart/blob/master/img/ex_workspace.PNG)

When the plugin is first loaded, you see a "No Data Available" message on the visualisation window. This is because no fields have yet been selected for display. Use the "Select Fields" menu button to select one or many of your custom numeric fields to display.

![Select fields](https://github.com/rkclark/ardoq-multi-bar-chart/blob/master/img/ex_select.PNG)

Here's an example having selected three of our custom fields (My Field 1, 2 and 4) and "Component 1" in our hierarchy. Note that only the direct children of Component 1 are displayed by default:

![Example with three fields](https://github.com/rkclark/ardoq-multi-bar-chart/blob/master/img/ex_threefields.PNG)

To easily expand the scope of the data that is shown, we can click the "Show Entire Workspace" button:

![Example with entire workspace shown](https://github.com/rkclark/ardoq-multi-bar-chart/blob/master/img/ex_entireworkspace.PNG)

All of the components in the workspace are now shown. That's cool, but to fine-tune exactly which components are included in the chart you can use Ardoq's built in filtering functionality at any time. The plugin will respect the filters you've set. This is a powerful way to tailor the output of the visualisation to just what you need :)

Finally, let's look at the different display options we have available. First up is to switch to "Stacked" rather than "Grouped" view. Here's the same chart as the one above but in Stacked mode:

![Example of stacked mode](https://github.com/rkclark/ardoq-multi-bar-chart/blob/master/img/ex_stacked.PNG)

We can also choose to change the way the data is grouped in the bars on the chart, either by the fields we have selected (the default), or the components in our view. Let's start with the default view, this time with all six of our custom fields selected:

![Example default view all data](https://github.com/rkclark/ardoq-multi-bar-chart/blob/master/img/ex_alldatadefault.PNG)

By clicking "Group Data by Components" we now get:

![Example grouped by components](https://github.com/rkclark/ardoq-multi-bar-chart/blob/master/img/ex_groupbycomps.PNG)

Notice how the fields are now listed on the x-axis and the components themselves are represented by the bars on the chart. Depending on the data in your model, this view might benefit from stacked mode, like this:

![Example of stacked mode with grouping by components](https://github.com/rkclark/ardoq-multi-bar-chart/blob/master/img/ex_stackcomps.PNG)

This gives us a simple visual representation of how the values in each of our custom fields are split between our components :)

## Installation

- Open the Ardoq plugin editor *(Refer to Ardoq help documentation for guidance if needed)*
- Click to create a new Plugin
- Give the plugin an ID and name. The name will be shown in the visualisation list.
- Copy and paste the code from multi-bar.js into the code editor window, over-writing any existing code that may be there.
- Click to Save and Run the plugin. It will now be a selectable visualisation in your model!

---

*I hope you enjoy using the visualisation! Changes to the core Ardoq application may affect the plugin in the future, feel free to open an issue on this repo if you have any problems :)*

*Plugin working correctly as at Ardoq version Version: 3.4.60 / 1.39.16.*
