{
	fieldOptions: function() {
		var that = this;
		console.log("IN FIELD OPTIONS");
		return this.getCurrentFields()
			.filter(function(f) {
				//return f.get('type').indexOf('Number') > -1 || f.get('type').indexOf('SelectMultiple') > -1;
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
						console.log($(this).siblings());
						console.log("CLICKED:");
						console.log(this);

						_.each(that.fieldSelection, function(field) {
							$(this).siblings(":contains(" + field + ")").addClass("active");
							console.log($(this).siblings(":contains(" + field + ")"));
							console.log("Added active class to " + field);
						}, this);

						if ($(this).hasClass("active")) {
							$(this).removeClass("active");
							var index = that.fieldSelection.indexOf(this.children[0].text.trim());
							if (index != -1) {
								that.fieldSelection.splice(index, 1)
							};
						} else {
							$(this).addClass("active");
							$('#fieldDropdown').parent().addClass("active");
							that.fieldSelection.push(this.children[0].text.trim())
						}
						console.log("UPDATED FIELD SELECTION TO:");
						console.log(that.fieldSelection);

						var l = that.fieldSelection.length
						$('#fieldDropdown').children("span:first").html(l + " Field" + (l == 1 ? "" : "s") + " Selected");

						that.localRender();
					}
				};
			});
	},

	init: function() {
		//add your initializing code here.
		this.fieldSelection = [];
		var that = this;
		console.log(that);
		console.log(that.addMenu);
		height = (this.getHeight() - 150).toString() + "px";
		width = (this.getWidth() - 120).toString() + "px";
		this.addCSS("#customgraph", "height:" + height + " !important; width:" + width + " !important; overflow: visible !important; margin-bottom: 110px");
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
				console.log("CLCKED MENU");
				console.log($(this).siblings("ul"));
				var listOptions = $(this).siblings("ul").children();
				console.log("list options is:");
				console.log(listOptions);
				_.each(listOptions, function(li) {
					if (li.className.includes("active")) {
						that.fieldSelection.push(li.children[0].text.trim())
					}
				});
				console.log("fieldSelection is nowL");
				console.log(that.fieldSelection);
			}
		});
	},


	getSettings: function() {
		//Get display and other settings
		var settings = {
			groupByComp: $("#toggleAxis").attr("Class"),
			entireWorkspace: $("#toggleWorkspace").attr("Class")
		};
		return settings
	},

	getComps: function(setting) {
		var comps = this.getD3ComponentHierarchy();
		console.log("COMPS IS:");
		console.log(comps);
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
				children = [comps.selectedNode];
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
		console.log("FINAL COMPONENTS ARRAY IS:");
		console.log(components);
		return components;
	},

	getData: function(settings) {

		var that = this;
		//Get component hierarchy for current context.
		var selectedFields = this.getCurrentFields()
			.filter(function(f) {
				//return (f.get('type').indexOf('Number') > -1 || f.get('type').indexOf('SelectMultiple') > -1 ) && that.fieldSelection.includes(f.get('label'));
				return f.get('type').indexOf('Number') > -1 && that.fieldSelection.includes(f.get('label'));
			});
		//Our chart data array
		this.data = [];
		var components = this.getComps(settings.entireWorkspace);

		if (settings.groupByComp == "") {
			_.each(selectedFields, function(field) {
				var valItem = {
					key: field.attributes.label,
					values: [],
					item: field
				};
				_.each(components, function(comp) {
					if (field.attributes.name in comp.numericFields) {
						valItem.values.push({
							x: comp.name,
							y: comp.numericFields[field.attributes.name].value,
							item: comp
						});
					}

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
					if (field.attributes.name in comp.numericFields) {
						valItem.values.push({
							x: field.attributes.label,
							y: comp.numericFields[field.attributes.name].value,
							item: comp
						});
					}
				});
				that.data.push(valItem);
			});
		}


		return this.data;
	},
	localRender: function() {
		//add your rendering code here
		var that = this;
		console.log("THIS IS");
		console.log(this);
		//Add the base Ardoq SVG without legend.
		this.svg = this.getD3SVG(null, null, true);
		var chart = null;

		//Get settings from menu buttons
		var settings = this.getSettings();
		console.log("SETTINGS ARE:");
		console.log(settings);
		var data = this.getData(settings);
		//console.log(this.getModel());
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

			that.svg
				.datum(data)
				.attr("id", "customgraph")
				.call(chart);
			console.log(that.svg);
			that.svg.selectAll(".nv-bar").on("click", function(d) {
				that.getContext().setComponent(d.item.comp);
			});

			return chart;
		});
		this.autoResizeSVG();
	}
}
