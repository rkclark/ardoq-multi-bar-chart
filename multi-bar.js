{
	getFieldOptions: function() {
		var that = this;
		//Get fields associated with current nodes and filter down to only numerics
		return this.getCurrentFields()
			.filter(function(f) {
				return f.get('type').indexOf('Number') > -1;
			})
			.map(function(f) {
				var isActive = !!that.fieldSelection[f.get('name')];
				var iconShow = isActive ? 'fa-check' : '';
				return {
					title: (f.get('label') || f.get('name')),
					name: f.get('name'),
					icon: 'fa fa-fw ' + iconShow,
					onClick: function() {
						// Update fieldSelection hash accordingly
						if (that.fieldSelection[f.get('name')]) {
							//Remove current item from array
							delete that.fieldSelection[f.get('name')];
						} else {
							that.fieldSelection[f.get('name')] = true;
						}
						//Set text on the dropdown menu item
						var l = _.size(that.fieldSelection);
						$('#fieldDropdown').children("span:first").html(l + " Field" + (l == 1 ? "" : "s") + " Selected");

						that.localRender();
					}
				};
			});
	},

	init: function() {

		this.fieldSelection = {};
		var that = this;

		//Set height of svg to be 85% of container, and width to be 95%
		//Also make sure that overflow is visible to display long component names
		this.addCSS("#customgraph", "height: 85% !important; width: 95% !important; overflow: visible !important;");

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
			dropdown: this.getFieldOptions()
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
				return f.get('type').indexOf('Number') > -1 && that.fieldSelection[f.get('name')];
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
		this.reRenderDropdownMenu('fieldDropdown', _.bind(this.getFieldOptions, this));

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
