{
	fieldOptions: function() {
		var that = this;
		//Get fields associated with current nodes and filter down to only numerics
		return this.getCurrentFields()
			.filter(function(f) {
				return f.get('type').indexOf('Number') > -1;
			})
			.map(function(f) {
				var iconShow = 'fa-check';
				return {
					title: (f.get('label') || f.get('name')),
					name: f.get('name'),
					icon: 'fa fa-fw' + iconShow,
					setActive: false,
					onClick: function() {
						//Iterate through sibling list items and add "active" class back onto those included in the selected fields array
						//(The active flags will have been removed by default when the current list item is selected)
						_.each(that.fieldSelection, function(field) {
							$(this).siblings(":contains(" + field + ")").addClass("active");
						}, this);
						//Change active flag on current item and update fieldSelection array accordingly
						if ($(this).hasClass("active")) {
							$(this).removeClass("active");
							//Remove current item from array
							var index = that.fieldSelection.indexOf(this.children[0].text.trim());
							if (index != -1) {
								that.fieldSelection.splice(index, 1)
							};
						} else {
							$(this).addClass("active");
							$('#fieldDropdown').parent().addClass("active");
							//Add current item to array
							that.fieldSelection.push(this.children[0].text.trim())
						}
						//Set text on the dropdown menu item
						var l = that.fieldSelection.length
						$('#fieldDropdown').children("span:first").html(l + " Field" + (l == 1 ? "" : "s") + " Selected");

						that.localRender();
					}
				};
			});
	},

	init: function() {

		this.fieldSelection = [];
		var that = this;

		//Set height of svg to be 85% of container, and width to be 95%
		//Also make sure that overflow is visible to display long component names
		height = (this.getHeight() * 0.85).toString() + "px";
		width = (this.getWidth() * 0.95).toString() + "px";
		this.addCSS("#customgraph", "height:" + height + " !important; width:" + width + " !important; overflow: visible !important;");

		LOG.log('init', this);

		//Add toggle children menu button
		this.addMenu({
			name: "Show Entire Workspace",
			id: "toggleWorkspace",
			icon: "fa fa-sitemap",
			classname: "",
			containerClass: "",
			click: function() {
				if ($(this).toggleClass('active').hasClass('active')) {
					$(this).parent().addClass("active");
				} else {
					$(this).parent().removeClass("active");
				}
				that.localRender();
			}
		});

		//Add toggle x axis menu button
		this.addMenu({
			name: "Group Data By Components",
			id: "toggleAxis",
			icon: "fa fa-cube",
			classname: "",
			containerClass: "",
			click: function() {
				if ($(this).toggleClass('active').hasClass('active')) {
					$(this).parent().addClass("active");
				} else {
					$(this).parent().removeClass("active");
				}
				that.localRender();
			}
		});

		this.addMenu({
			name: 'Select fields',
			id: 'fieldDropdown',
			icon: 'fa fa-list-alt',
			containerClass: '',
			dropdown: this.fieldOptions(),
			click: function() {
				//Flush out any existing logged field selections
				that.fieldSelection = [];
				//Select the ul associated with the dropdown menu and iterate through its child li elements
				_.each($(this).siblings("ul").children(), function(li) {
					if (li.className.includes("active")) {
						//If we have an active li we add the field name to the fieldSelect array
						that.fieldSelection.push(li.children[0].text.trim())
					}
				});
			}
		});
	},

	getDisplaySettings: function() {
		//Get display settings
		var settings = {
			groupByComp: $("#toggleAxis").attr("Class"),
			entireWorkspace: $("#toggleWorkspace").attr("Class")
		};
		return settings
	},

	getComps: function(setting) {
		var comps = this.getD3ComponentHierarchy();
		//Initialize our custom components array
		var components = [];
		//If setting is blank, we only want direct children, else we are showing the entire workspace
		if (setting == "") {
			//If selected node has children, collect them. Otherwise just used the selected node
			if (comps.selectedNode.children.length > 0) {
				_.each(comps.selectedNode.children, function(child) {
					//Check child is included in current filtering before adding to component array
					if (child.included) {
						components.push(child);
					}
				});
			} else {
				components = [comps.selectedNode];
			}
		} else {
			_.each(comps.nodeMap, function(comp) {
				if (comp.type != "workspace") {
					//Check comp is included in current workspace and also filtering before adding to component array
					if (comp.comp.attributes.rootWorkspace == comps.selectedNode.comp.attributes.rootWorkspace && comp.included) {
						components.push(comp);
					}
				}
			});
		}
		return components;
	},

	getData: function(settings) {

		var that = this;
		//Grab an array of the custom numerics fields associated with our current components
		var selectedFields = this.getCurrentFields()
			.filter(function(f) {
				return f.get('type').indexOf('Number') > -1 && that.fieldSelection.includes(f.get('label'));
			});
		//Our chart data array
		this.data = [];
		var components = this.getComps(settings.entireWorkspace);
		//Pass the data into the data array, the format depending on whether the user has selected to group data by components
		if (settings.groupByComp == "") {
			_.each(selectedFields, function(field) {
				var valItem = {
					key: field.attributes.label,
					values: [],
					item: field
				};
				_.each(components, function(comp) {
					// if (field.attributes.name in comp.numericFields) {
					// 	valItem.values.push({
					// 		x: comp.name,
					// 		y: comp.numericFields[field.attributes.name].value,
					// 		item: comp
					// 	});
					// }

						valItem.values.push({
							x: comp.name,
							y: (field.attributes.name in comp.numericFields) ? comp.numericFields[field.attributes.name].value : 0,
							item: comp
						});

				});
				that.data.push(valItem);
			});
		} else {
			_.each(components, function(comp) {
				var valItem = {
					key: comp.name,
					values: [],
					item: comp
				};
				_.each(selectedFields, function(field) {
						valItem.values.push({
							x: field.attributes.label,
							y: (field.attributes.name in comp.numericFields) ? comp.numericFields[field.attributes.name].value : 0,
							item: comp
						});
				});
				that.data.push(valItem);
			});
		}
		return this.data;
	},

	localRender: function() {

		var that = this;

		//Add the base Ardoq SVG
		this.svg = this.getD3SVG(null, null, true);
		var chart = null;

		//Get settings from menu buttons
		var settings = this.getDisplaySettings();
		//Build data array
		var data = this.getData(settings);

		var cv = nv.addGraph(function() {
			chart = nv.models.multiBarChart()
				.margin({
					left: 75
				})
				.showLegend(true)
				.color(['#222222', '#F3C300', '#875692', '#F38400', '#A1CAF1', '#BE0032', '#C2B280', '#848482', '#008856', '#E68FAC', '#0067A5', '#F99379', '#604E97', '#F6A600', '#B3446C', '#DCD300', '#882D17', '#8DB600', '#654522', '#E25822', '#2B3D26'])
				.transitionDuration(350)
				.reduceXTicks(false) //If 'false', every single x-axis tick label will be rendered.
				.rotateLabels(45) //Angle to rotate x-axis labels.
				.showControls(true) //Allow user to switch between 'Grouped' and 'Stacked' mode.
				.groupSpacing(0.03) //Distance between each group of bars.
			;
			chart.yAxis
				.tickFormat(d3.format('d'));

			chart.yAxis.axisLabel("Value").axisLabelDistance(30);

			//Pass data into SVG and call chart
			that.svg
				.datum(data)
				.attr("id", "customgraph")
				.call(chart);
			that.svg.selectAll(".nv-bar").on("click", function(d) {
				that.getContext().setComponent(d.item.comp);
			});

			return chart;
		});
		this.autoResizeSVG();
	}
}
