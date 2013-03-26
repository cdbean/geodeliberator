GeoAnnotator.MapPanelCtrl = {
	// containerPanel
	containerPanel : null,
	// map
	map : null,
	mapDiv : 'mapDiv',
	// layers
	baseLayer : null,
	currLayers : [],
	annotationVectors : null,
	newFootprintVectors : null,
	annotationDistVectors : null,
	// styles
	footprintStyle : null,
	newfootprintStyle: null,
	// controls
	navigationControl : null,
	modifyNewFootprintControl : null,
	selectFootprintControl: null,
	drawFootprintControls : null,
	
	// feature when hovering
	hoverFeature : null,
	// context menu
	contextMenu : null,
	// popup, for removal use
	lastPopup : null,
	// annotation list window
	annotationListWindow : null,
	annotationListStore : null,
	annotationListView : null,
	// currMapInfo
	currMapInfo : {},
	
	register : function (containerPanel){
		GeoAnnotator.MapPanelCtrl.containerPanel = containerPanel;
	},
	
	init : function () {
		var thisCtrl = GeoAnnotator.MapPanelCtrl;
		thisCtrl.currMapInfo = {};
		thisCtrl.currLayers = [];
		thisCtrl.hoverFeature = null;
		thisCtrl.contextMenu = null;
		thisCtrl.annotationListStore = null;
		thisCtrl.annotationListView = null;
		
		
		// stop event listening before map destroy
		if (thisCtrl.navigationControl && thisCtrl.navigationControl.events){
			thisCtrl.navigationControl.events.un({
                'activate': thisCtrl.onNavigationActivate,
				'deactivate': thisCtrl.onNavigationDeactivate,
               	scope: thisCtrl
    		});
		}
		// destory the map if not null
		if(thisCtrl.map != null) {
			thisCtrl.map.destroy();
		}
		// reset map div
		if (thisCtrl.containerPanel.items) {
			thisCtrl.containerPanel.removeAll();
		}
		if (thisCtrl.annotationListWindow){
			thisCtrl.annotationListWindow.close();
			thisCtrl.annotationListWindow = null;
		}
		thisCtrl.containerPanel.body.update('<div id="' + thisCtrl.mapDiv +'"></div>');	
		
		
		var mapOptions = {
			maxExtent: new OpenLayers.Bounds(-180, -88.759, 180, 88.759),
			controls: []
		};
		thisCtrl.buildMap(thisCtrl.mapDiv, mapOptions);            

	    thisCtrl.baseLayer = new OpenLayers.Layer.Image("GeoDeliberation", 
			'http://1.bp.blogspot.com/_HgqZlW4QMjY/SAvFVYcK-uI/AAAAAAAAAF0/6hkIIK4WqC8/s320/It%27s%2BUp%2BTo%2BAll%2BOf%2BUs.JPG',
			new OpenLayers.Bounds(-180, -88.759, 180, 88.759),
			new OpenLayers.Size(250, 307),
			{numZoomLevels: 1}
		);
    	
		
		thisCtrl.currLayers.push(thisCtrl.baseLayer);
		thisCtrl.map.addLayers(thisCtrl.currLayers);
		thisCtrl.map.zoomToMaxExtent();
		//alert(thisCtrl.map.getResolution());
		//thisCtrl.containerPanel.on('contextmenu', thisCtrl.onMapPanelContextMenu);
		thisCtrl.containerPanel.getEl().on('contextmenu', function(evt, div) {
			var thisCtrl = GeoAnnotator.MapPanelCtrl; 
			if(!thisCtrl.contextMenu){ // create context menu on first right click
            	thisCtrl.contextMenu = new Ext.menu.Menu({
                	id:'map-panel-ctx',
                	items: []
            	});
        	}
			thisCtrl.contextMenu.removeAll();
			
			if (GeoAnnotator.currUserId !== '0' && GeoAnnotator.currForumId !== '0') {
				if (thisCtrl.hoverFeature !== null) {
					var id = thisCtrl.hoverFeature.attributes.id;
					if (GeoAnnotator.ContributePanelCtrl.containerPanel.collapsed === false) {
						thisCtrl.contextMenu.add({
		               		id:'add-footprint-ctx',
		               		iconCls:'add-footprint-icon',
		               		text:'Add to reference',
		               		scope: thisCtrl,
		               		handler:function(){
								var thisCtrl = GeoAnnotator.MapPanelCtrl;
								if (thisCtrl.hoverFeature !== null) {
									thisCtrl.addFeatureToReference(thisCtrl.hoverFeature);
								}
		               		}
	               		});
					}
					if (thisCtrl.hoverFeature.attributes.id.indexOf('-') === 0) {
						thisCtrl.contextMenu.add({
	                   		id:'delete-footprint-ctx',
	                   		iconCls:'delete-footprint-icon',
	                   		text:'Delete',
	                   		scope: thisCtrl,
	                   		handler:function(){
								var thisCtrl = GeoAnnotator.MapPanelCtrl;
								if (thisCtrl.hoverFeature !== null) {
									var feature = thisCtrl.hoverFeature;																	
									thisCtrl.setNavigationMode();
									thisCtrl.deleteFeature(feature);
								}
	                   		}
	               		});
						thisCtrl.contextMenu.add({
	                   		id:'modify-footprint-ctx',
	                   		iconCls:'modify-footprint-icon',
	                   		text:'Modify',
	                   		scope: thisCtrl,
	                   		handler:function(){
								var thisCtrl = GeoAnnotator.MapPanelCtrl;
								if (thisCtrl.hoverFeature !== null) {
									thisCtrl.setModifyMode();
									thisCtrl.modifyNewFootprintControl.selectControl.select(thisCtrl.hoverFeature);
								}
	                   		}
	               		});
					}; 
				
				}
				else {
				    thisCtrl.contextMenu.add({
					id:'draw-footprint-ctx',
					iconCls:'draw-footprint-icon',
					text:'Draw a footprint',
					scope: thisCtrl,
					handler:function(){
					    var thisCtrl = GeoAnnotator.MapPanelCtrl;
					    thisCtrl.setDrawMode('polygon');
					}
				    });
				    thisCtrl.contextMenu.add({
					id:'draw-route-ctx',
					iconCls:'draw-route-icon',
					text:'Draw a route',
					scope: thisCtrl,
					handler:function(){
					    var thisCtrl = GeoAnnotator.MapPanelCtrl;
					    thisCtrl.setDrawMode('line');
					}
				    });

				}
				if (thisCtrl.contextMenu.items.length > 0) {
					thisCtrl.contextMenu.showAt(evt.getXY());
				};
				evt.preventDefault();				
			}

		});
		
		thisCtrl.footprintStyle = new OpenLayers.StyleMap({
			'default': new OpenLayers.Style({
				strokeColor: "#EE4F44",
                strokeOpacity: 1,
                strokeWidth: 2,
                fillColor: "#EE4F44",
                fillOpacity: 0.0
                //pointerEvents: 'visiblePainted',
                //pointRadius: 6, // sized according to type attribute
				//label : '${refCount}',
                //fontColor: '#ffffff',
				//labelAlign: 'center',
                //fontWeight: 'bold',
				//fontSize: '13px'
				}),
			'select': new OpenLayers.Style({
				fillColor: '#FFCC33',
    			fillOpacity: 0.3, 
    			strokeColor: '#blue',
    			strokeOpacity: 1,
    			strokeWidth: 4,
    			//pointerEvents: 'visiblePainted',
		        cursor: 'pointer'
				//pointRadius: 6
			}),
			'hover': new OpenLayers.Style({
				fillColor: '#FFCC33',
    			fillOpacity: 0.5, 
    			strokeColor: '#EE4F44',
    			strokeOpacity: 1,
    			strokeWidth: 3,
    			//pointerEvents: 'visiblePainted',
		        cursor: 'pointer'
				//pointRadius: 6
			})
		});

		var default_style = OpenLayers.Util.extend({}, OpenLayers.Feature.Vector.style['default']);
		default_style.strokeColor = "#00FF00";
        default_style.strokeOpacity = 1;
        default_style.strokeWidth = 2;
        default_style.fillColor = "#D4DDC3";
        default_style.fillOpacity = 0.0;
		default_style.strokeDashstyle = "dashdot";
		var hover_style = OpenLayers.Util.extend({}, OpenLayers.Feature.Vector.style['default']);
		hover_style.strokeColor = "#00FF00";
        hover_style.strokeOpacity = 1;
        hover_style.strokeWidth = 3;
        hover_style.fillColor = "#D4DDC3";
        hover_style.fillOpacity = 0.5;
		hover_style.strokeDashstyle = "dashdot";
		hover_style.cursor = 'pointer';
		var select_style = OpenLayers.Util.extend({}, OpenLayers.Feature.Vector.style['select']);
		select_style.strokeColor = "blue";
        select_style.strokeOpacity = 1;
        select_style.strokeWidth = 3;
        select_style.fillColor = "#D4DDC3";
        select_style.fillOpacity = 0.5;
		select_style.strokeDashstyle = "dashdot";
		select_style.cursor = 'pointer';
		
		thisCtrl.newfootprintStyle = new OpenLayers.StyleMap({
			'default': default_style,
			'select': select_style,
			'hover': hover_style
		});
		thisCtrl.loadToolbar();
	}, 
	
	update: function(params) {
		var thisCtrl = GeoAnnotator.MapPanelCtrl;
		var currParams = {}
		if (params && params !== null && params !== {}) {
			currParams = params
		}
		else {
			if (GeoAnnotator.currUserId != '0'){
				currParams.userId = GeoAnnotator.currUserId;	
			} 
			if (GeoAnnotator.currAnnotationId != '0') {
				currParams.annotationId = GeoAnnotator.currAnnotationId;
			}			
			if (GeoAnnotator.currForumId != '0'){
				currParams.forumId = GeoAnnotator.currForumId;
			}
		}
		// request the map information
		Ext.Ajax.request({
				url: GeoAnnotator.baseUrl + 'map/',
				success: thisCtrl.onLoadMapInfoSuccess,
				failure: thisCtrl.onLoadMapInfoFailure,
				params: currParams
		});
		thisCtrl.loadToolbar();
	},
	
	onLoadMapInfoSuccess : function (xhr) {
		var thisCtrl = GeoAnnotator.MapPanelCtrl;
		thisCtrl.currMapInfo = Ext.util.JSON.decode(xhr.responseText);
		if (thisCtrl.currMapInfo != null) {
			if (thisCtrl.currMapInfo.type == 'group') {
				// load map view
				thisCtrl.loadMap();
				// load features
				thisCtrl.loadFootprints();
				thisCtrl.loadControls();
				if (GeoAnnotator.currAnnotationId != '0') {
					thisCtrl.update();
				}
			}
			else {
				thisCtrl.updateMap();
			}
			//centerPanels.doLayout();
		}
	},
	
	onLoadMapInfoFailure : function () {
		// do nothing
		alert("Failed to load map information!");
	},
	
	// update the map from context map string
	updateMap : function() {
		var thisCtrl = GeoAnnotator.MapPanelCtrl;
		if (thisCtrl.currMapInfo.mapString && thisCtrl.currMapInfo.mapString != "") {
			var xmldoc = GeoAnnotator.Util.parseXML(thisCtrl.currMapInfo.mapString);
			var mapNode = null;
			if (xmldoc.getElementsByTagName('contextmap').length > 0) {
				mapNode = xmldoc.getElementsByTagName('contextmap').item(0);
			}
			else{
				return;
			}
			var zoom = mapNode.getAttribute('zoom') || '';
	    	var centerX = mapNode.getAttribute('centerX') || '';
	    	var centerY = mapNode.getAttribute('centerY') || '';
		
			var extent = mapNode.getAttribute('extent') || '';
			if (extent && extent !== '') {
				thisCtrl.map.zoomToExtent(OpenLayers.Bounds.fromString(extent));
			}
			else if (zoom !== '' && centerX !== '' && centerY !== '') {
				thisCtrl.map.setCenter(new OpenLayers.LonLat(centerX, centerY), parseInt(zoom));
			}
		}
		
		thisCtrl.setNavigationMode();
		// highlight footprints
		if (GeoAnnotator.currFootprintId != '0') {
			thisCtrl.moveToFeature(GeoAnnotator.currFootprintId);
		}
		else if (thisCtrl.currMapInfo.footprints != null) {
			for (var i = 0; i < thisCtrl.currMapInfo.footprints.length; i++) {
	    		var footprint = thisCtrl.currMapInfo.footprints[i];
				for (var i=0; i < thisCtrl.annotationVectors.features.length; i++) {
					var feature = thisCtrl.annotationVectors.features[i];
					if (feature.attributes.id === footprint.id) {
						thisCtrl.selectFootprintControl.highlight(feature);						
					}
					else {
						thisCtrl.selectFootprintControl.unhighlight(feature);
					}
				};
    		}	
		}
	},
	
	loadMap : function () {
		var thisCtrl = GeoAnnotator.MapPanelCtrl;
		var xmldoc = GeoAnnotator.Util.parseXML(thisCtrl.currMapInfo.mapString);
		var mapNode = null;
		if (xmldoc.getElementsByTagName('contextmap').length > 0) {
			mapNode = xmldoc.getElementsByTagName('contextmap').item(0);
		}
		else{
			return;
		}
		
		var zoom = mapNode.getAttribute('zoom');
    	var centerX = mapNode.getAttribute('centerX');
    	var centerY = mapNode.getAttribute('centerY');
		
		var extent = mapNode.getAttribute('extent') || '';

		// get the map options
    	var mapOptions = new Object();
    	if (mapNode.getElementsByTagName('options').length > 0) {
  			var optionsNode = mapNode.getElementsByTagName('options').item(0);
  			var optionNodes = optionsNode.getElementsByTagName('option');
  			for (var i = 0; i < optionNodes.length; i++) {
  				var optionNode = optionNodes.item(i);
  				var key = optionNode.getAttribute('key');
  				var value = optionNode.getAttribute('value');
  				// handle the problem of boolean false
  				if(value.toLowerCase() == 'true') {
  					value = true;
  				}
  				if (value.toLowerCase() == 'false'){
  					value = false;
  				}
  				
	  			switch(key)
	  			{
	  			case 'projection':
	  				mapOptions[key] = new OpenLayers.Projection(value);	
	  				break;
	  			case 'displayProjection':
	  				//mapOptions[key] = new OpenLayers.Projection(value);	
	  				mapOptions['displayProjection'] = new OpenLayers.Projection(value);
					break;
	  			case 'minExtent':
	  				mapOptions[key] = OpenLayers.Bounds.fromString(value);
	  				break;
	  			case 'maxExtent':
	  				mapOptions[key] = OpenLayers.Bounds.fromString(value);
	  				break;
				case 'numZoomLevels':
					mapOptions[key] = parseInt(value);
				default:
	  				mapOptions[key] = value;
	  			}  			
  			}
  		}
  	
    
		if(mapNode.getElementsByTagName('layers').length > 0) {
			// rebuild map
			// stop event listening before map destroy
			if (thisCtrl.navigationControl && thisCtrl.navigationControl.events){
				thisCtrl.navigationControl.events.un({
                    'activate': thisCtrl.onNavigationActivate,
					'deactivate': thisCtrl.onNavigationDeactivate,
                   	scope: thisCtrl
        		});
			}
			thisCtrl.map.destroy();
			mapOptions["controls"] = [];
			thisCtrl.buildMap(this.mapDiv, mapOptions);
    		thisCtrl.currLayers.length = 0;
	    
	    	var layersNode = mapNode.getElementsByTagName('layers').item(0);
			var layerNodes = layersNode.getElementsByTagName('layer');
    	    
    		for (var i = 0; i < layerNodes.length; i++) {
	    		var layerNode = layerNodes.item(i);
	    		var layerName = layerNode.getAttribute('name');
	    		var layerType = layerNode.getAttribute('type');
	    		var layerOptions = new Object();
	    		
  				if (layerNode.getElementsByTagName('options').length > 0) {
  					var optionsNode = layerNode.getElementsByTagName('options').item(0);
  					var optionNodes = optionsNode.getElementsByTagName('option');
  					for (var j = 0; j < optionNodes.length; j++) {
  						var optionNode = optionNodes.item(j);
  						var key = optionNode.getAttribute('key');
  						var value = optionNode.getAttribute('value');
  						// handle the problem of boolean false
  					
  						if(value.toLowerCase() == 'true') {
  							layerOptions[key] = true;
  						}
  						else if (value.toLowerCase() == 'false'){
  							layerOptions[key] = false;
  						}
						else if (key == 'minZoomLevel' || key == 'maxZoomLevel'){
							layerOptions[key] = parseInt(value);
							
						}	  			
  						else {
  							layerOptions[key] = value;	
  						}
  					}
  				}
  			
    			var newLayer;
    			switch(layerType)
				{
				case 'Google':
  					if (layerOptions['type'] && typeof layerOptions['type'] == "string") {
  						layerOptions['type'] = thisCtrl.getGMapType(layerOptions['type']);
  					}
  					newLayer = new OpenLayers.Layer.Google(layerName, layerOptions);
  					break;    
				case 'WMS':
					var layerUrl = layerNode.getElementsByTagName('url').item(0).childNodes[0].nodeValue;
				
  					var layerParams = new Object();
  					if (layerNode.getElementsByTagName('params').length > 0) {
  						var paramsNode = layerNode.getElementsByTagName('params').item(0);
  						var paramNodes = paramsNode.getElementsByTagName('param');
  						for (var j = 0; j < paramNodes.length; j++) {
  							var paramNode = paramNodes.item(j);
  							layerParams[paramNode.getAttribute('key')] = paramNode.getAttribute('value');	
  						}
  					}
  					newLayer = new OpenLayers.Layer.WMS(layerName, layerUrl, layerParams, layerOptions);
  					break;
  				case 'GML':
  					var layerUrl = layerNode.getElementsByTagName('url').item(0).childNodes[0].nodeValue;
  				
  					if (layerOptions['format'] == 'OpenLayers.Format.KML') {
  						layerOptions['format'] = OpenLayers.Format.KML;
  					}
  				
  					var layerFormatOptions = new Object();
  					if (layerNode.getElementsByTagName('formatOptions').length > 0) {
  						var formatOptionsNode = layerNode.getElementsByTagName('formatOptions').item(0);
  						var formatOptionNodes = formatOptionsNode.getElementsByTagName('formatOption');
  						for (var j = 0; j < formatOptionNodes.length; j++) {
  							var formatOptionNode = formatOptionNodes.item(j);
  							layerFormatOptions[formatOptionNode.getAttribute('key')] = formatOptionNode.getAttribute('value');	
  						}
  					}
  					layerOptions['formatOptions'] = layerFormatOptions;
  				
  					newLayer = new OpenLayers.Layer.GML(layerName, layerUrl, layerOptions);
  					break;
				default:
					break;
    			}
    			if (newLayer != undefined && newLayer != null) {
    				if (layerOptions['visibility'] == true && layerOptions['isBaseLayer'] == true) {
    					thisCtrl.baseLayer = newLayer;
    				}
    				thisCtrl.currLayers.push(newLayer);
    			}
	    	}
		
			thisCtrl.map.addLayers(thisCtrl.currLayers);
		    thisCtrl.map.setBaseLayer(thisCtrl.baseLayer);
		    
			
		    thisCtrl.map.setCenter(new OpenLayers.LonLat(centerX, centerY), parseInt(zoom));
			if (extent && extent !== '') {
				thisCtrl.map.zoomToExtent(OpenLayers.Bounds.fromString(extent));
			};
		}
	},
	
	loadFootprints : function () {
		var thisCtrl = GeoAnnotator.MapPanelCtrl;
		//OpenLayers.Feature.Vector.style['default']['strokeWidth'] = '2';
		var annotationVector = null;
		var wktParser = new OpenLayers.Format.WKT();
		
		thisCtrl.annotationVectors = new OpenLayers.Layer.Vector(
    		'Annotation Footprints', {styleMap: thisCtrl.footprintStyle, displayInLayerSwitcher: true}
    	);		
		thisCtrl.map.addLayer(this.annotationVectors);
		
		// load footprints
		if (thisCtrl.currMapInfo.footprints != null) {
			for (var i = 0; i < thisCtrl.currMapInfo.footprints.length; i++) {
	    		var footprint = thisCtrl.currMapInfo.footprints[i];
				
				var feature = wktParser.read(footprint.shape);
				origin_prj = new OpenLayers.Projection("EPSG:" + footprint.srid);
				feature.geometry.transform(origin_prj, thisCtrl.map.projection);
				feature.attributes = {};
	    		feature.attributes.id = footprint.id;
				if (footprint.refCount != null) {
					feature.attributes.pointRadius = footprint.refCount * 5;
					feature.attributes.refCount = footprint.refCount;
				}
	    		if (footprint.alias != null) {
					feature.attributes.alias = footprint.alias;
				}
				thisCtrl.annotationVectors.addFeatures([feature]);
    		}	
		}
		
		
		thisCtrl.newFootprintVectors = new OpenLayers.Layer.Vector('New Footprints', {styleMap: thisCtrl.newfootprintStyle, displayInLayerSwitcher: false});
		thisCtrl.newFootprintVectors.addFeatures(GeoAnnotator.ContributePanelCtrl.newFootprints);
		thisCtrl.map.addLayer (this.newFootprintVectors);

		thisCtrl.markerLayer = new OpenLayers.Layer.Markers('Markers', {styleMap: thisCtrl.newfootprintStyle, displayInLayerSwitcher: true});
		thisCtrl.map.addLayer(this.markerLayer);
	},
	
	loadControls : function() {
		var thisCtrl = GeoAnnotator.MapPanelCtrl;
		thisCtrl.map.addControl(new OpenLayers.Control.PanZoomBar());
    	thisCtrl.map.addControl(new OpenLayers.Control.LayerSwitcher());
		thisCtrl.map.addControl(new OpenLayers.Control.Attribution());
    	
	    thisCtrl.navigationControl = new OpenLayers.Control.Navigation();
		thisCtrl.map.addControl(thisCtrl.navigationControl);

		thisCtrl.selectFootprintControl = new OpenLayers.Control.SelectFeature(
			[thisCtrl.annotationVectors,thisCtrl.newFootprintVectors],
	 		{
	        	clickout: true, toggle: false,
	            multiple: false, hover: false,
	            //toggleKey: "ctrlKey", // ctrl key removes from selection
	            //multipleKey: "shiftKey", // shift key adds to selection
	            //box: true,
				//onSelect: thisCtrl.onFeatureSelect, onUnselect: thisCtrl.onFeatureUnselect,
				//displayClass: 'olControlSelectFeature',
				callbacks: {over: thisCtrl.onOverFeature, out: thisCtrl.onOutFeature, click: thisCtrl.onClickFeature}
			}
		);
		thisCtrl.map.addControl(thisCtrl.selectFootprintControl);
		
		thisCtrl.modifyNewFootprintControl = new OpenLayers.Control.ModifyFeature(thisCtrl.newFootprintVectors);
		thisCtrl.newFootprintVectors.events.register("afterfeaturemodified", 
			thisCtrl.newFootprintVectors, 
			thisCtrl.onModificationEnd
		);
		//thisCtrl.modifyNewFootprintControl.onDeletingStart = thisCtrl.onFeatureDeleted;
		thisCtrl.map.addControl(thisCtrl.modifyNewFootprintControl);
				
		// originally there is only polygon tool
		// I would like to add line and point tool
		// by CD
		thisCtrl.drawFootprintControls = {
		    polygon: new OpenLayers.Control.DrawFeature(
			thisCtrl.newFootprintVectors, 
			OpenLayers.Handler.Polygon, 
			{
				featureAdded:function(feature) { 
					feature.state = OpenLayers.State.INSERT; 
					thisCtrl.onFeatureAdded(feature);
				}
			}
		    ),
		    line: new OpenLayers.Control.DrawFeature(
			thisCtrl.newFootprintVectors, 
			OpenLayers.Handler.Path, 
			{
				featureAdded:function(feature) { 
					feature.state = OpenLayers.State.INSERT; 
					thisCtrl.onFeatureAdded(feature);
				}
			}
		    ),
		    point: new OpenLayers.Control.DrawFeature(
			thisCtrl.newFootprintVectors, 
			OpenLayers.Handler.Point, 
			{
				featureAdded:function(feature) { 
					feature.state = OpenLayers.State.INSERT; 
					//thisCtrl.onFeatureAdded(feature);
				}
			}
		    ),
		};
		for (var key in thisCtrl.drawFootprintControls) {
		    thisCtrl.map.addControl(thisCtrl.drawFootprintControls[key]);    	
		}
		

		// set the default behavoirs
		thisCtrl.setNavigationMode();
	},
	
	loadToolbar : function () {
		// add top toolbar 
		var thisCtrl = GeoAnnotator.MapPanelCtrl;
		var tbar = thisCtrl.containerPanel.getTopToolbar();
		tbar.items.each(function (item, index, length) {
			item.destroy();
		});
		if (GeoAnnotator.currForumId === '0') {
			return;
		}; 
		
		if (GeoAnnotator.currUserId !== '0') {
			tbar.add({
				xtype: 'buttongroup',
				id: 'toolbox-group',
	            title: 'Annotation',
	            //columns: 3,
	            defaults: {
	                scale: 'medium'
	            },
	            items: [
				{
	            	id: 'contribute-btn',
	            	iconCls: 'contribute-btn',
	            	pressed: false,
	            	enableToggle: true,
	            	toggleHandler: function(button, pressed){
						if(pressed){
							GeoAnnotator.ContributePanelCtrl.containerPanel.expand(false);
						}
						else{
							GeoAnnotator.ContributePanelCtrl.containerPanel.collapse(false);
						}
					},
	            	text: 'Contribute',
	            	tooltip: {
	                	title: 'Contribute',
	                	text: 'Contribute to the current forum'
	            	}
	        	},
				{
		            id: 'manage-btn',
		            iconCls: 'manage-btn',
		            pressed: false,
		            enableToggle: true,
		            toggleHandler: function(button, pressed){
						if(pressed){
							GeoAnnotator.ManageWindowCtrl.containerWindow.show();
						}
						else{
							GeoAnnotator.ManageWindowCtrl.containerWindow.hide();
						}
					},
		            text: 'Manage',
		            tooltip: {
		                title: 'Manage',
		                text: 'Manage the annotations'
		            }
	        	}]
			});
		    // tools for questionnaire only, display group of buttons of marks
		    tbar.add({
			xtype: 'buttongroup',
			id: 'Markers-group',
			title: 'Markers',
			//columns: 3,
			defaults: {
			    scale: 'medium'
			},
			items: [{
			    id: 'noise-btn',
			    iconcls: 'noise-btn',
			    pressed: false,
			    enableToggle: true,
			    toggleGroup: 'marks',
			    toggleHandler: function(button, pressed){
						    if(pressed){
							var thisCtrl = GeoAnnotator.MapPanelCtrl;
							thisCtrl.setMarkerMode();
							// thisCtrl.setDrawMode('point');
						    }
						    else{
							// do something
						    }
					    },
			    text: 'noise',
			    tooltip: {
				    // title: '',
				    text: 'label the place as noisy'
			    }
			},
			{
			    id: 'stop-btn',
			    iconcls: 'stop-btn',
			    pressed: false,
			    enableToggle: true,
			    toggleGroup: 'marks',
			    toggleHandler: function(button, pressed){
						    if(pressed){
							// do something
							
							var thisCtrl = GeoAnnotator.MapPanelCtrl;
							thisCtrl.setDrawMode('point');
						    }
						    else{
							// do something
						    }
					    },
			    text: 'stop',
			    tooltip: {
				    // title: '',
				    text: 'label the place as a stop'
			    }
			},
			{
			    id: 'landscape-btn',
			    iconcls: 'landscape-btn',
			    pressed: false,
			    enableToggle: true,
			    toggleGroup: 'marks',
			    toggleHandler: function(button, pressed){
						    if(pressed){
							// do something
							var thisCtrl = GeoAnnotator.MapPanelCtrl;
							thisCtrl.setDrawMode('point');
						    }
						    else{
							// do something
						    }
					    },
			    text: 'landscape',
			    tooltip: {
				    // title: '',
				    text: 'label the place as beautiful landscape'
			    }
			},
			{
			    id: 'question-btn',
			    iconcls: 'question-btn',
			    pressed: false,
			    enableToggle: true,
			    toggleGroup: 'marks',
			    toggleHandler: function(button, pressed){
						    if(pressed){
							// do something
							var thisCtrl = GeoAnnotator.MapPanelCtrl;
							thisCtrl.setDrawMode('point');
						    }
						    else{
							// do something
						    }
					    },
			    text: 'question',
			    tooltip: {
				    // title: '',
				    text: 'label the place as questionable'
			    }
			},
			{
			    id: 'smell-btn',
			    iconcls: 'smell-btn',
			    pressed: false,
			    enableToggle: true,
			    toggleGroup: 'marks',
			    toggleHandler: function(button, pressed){
						    if(pressed){
							// do something
							var thisCtrl = GeoAnnotator.MapPanelCtrl;
							thisCtrl.setDrawMode('point');
						    }
						    else{
							// do something
						    }
					    },
			    text: 'smell',
			    tooltip: {
				    // title: '',
				    text: 'label the place as smell'
			    }
			} ]
		    });
		}; 


		tbar.doLayout();
	},
	
 	getGMapType : function(type) {
		var newGMapType;
		switch(type){
	  	case 'G_NORMAL_MAP':
	  		newGMapType = G_NORMAL_MAP;
	  		newGMapType.toString = function () {return 'G_NORMAL_MAP';};
	  		break;
	  	case 'G_SATELLITE_MAP':
	  		newGMapType = G_SATELLITE_MAP;
	  		newGMapType.toString = function () {return 'G_SATELLITE_MAP';};
	  		break;
	  	case 'G_HYBRID_MAP':
	  		newGMapType = G_HYBRID_MAP;
	  		newGMapType.toString = function () {return 'G_HYBRID_MAP';};
	  		break;
	  	case 'G_PHYSICAL_MAP':
	  		newGMapType = G_PHYSICAL_MAP;
	  		newGMapType.toString = function () {return 'G_PHYSICAL_MAP';};
	  		break;
	  	case 'G_CUSTOM_CENTREIMAGERY_MAP':
	  		var tileCentreImagery= new GTileLayer(new GCopyrightCollection(""),0,19, {
	      		tileUrlTemplate: 'http://www.apps.geovista.psu.edu/tilecache/tilecache.py/1.0.0/centreimageryjpeg/{Z}/{X}/{Y}.jpg?type=google',
	      		isPng:false});
	      	newGMapType = new GMapType([tileCentreImagery,G_HYBRID_MAP.getTileLayers()[1]], new GMercatorProjection(20), "Centre Imagery with Google Labels", {shortName:"CIL"});
	      	newGMapType.toString = function () {return 'G_CUSTOM_CENTREIMAGERY_MAP';};
	      	break;
	  	default:
	  		newGMapType = G_NORMAL_MAP;
	  		newGMapType.toString = function () {return 'G_NORMAL_MAP';};
	  		break;
	  	}
  		return newGMapType;  	
	},

	setNavigationMode : function() {
		var thisCtrl = GeoAnnotator.MapPanelCtrl;
		if (thisCtrl.navigationControl) {
			thisCtrl.navigationControl.activate();	
		}
		if (thisCtrl.selectFootprintControl) {
			thisCtrl.selectFootprintControl.activate();
		}
		if (thisCtrl.drawFootprintControls) {
		    for (var key in thisCtrl.drawFootprintControls) {
			thisCtrl.drawFootprintControls[key].deactivate();
		    }
		}
		if (thisCtrl.modifyNewFootprintControl) {
			thisCtrl.modifyNewFootprintControl.deactivate();					
		}
		// todo: unregister click event for marker
		thisCtrl.map.events.unregister("click", thisCtrl.map, thisCtrl.onAddMarker);
	},

	setMarkerMode : function() {
	    var thisCtrl = GeoAnnotator.MapPanelCtrl;
	    var map = thisCtrl.map;

	    map.events.register("click", map, thisCtrl.onAddMarker);
	},

	onAddMarker : function(e) {
	    var thisCtrl = GeoAnnotator.MapPanelCtrl;
	    var map = thisCtrl.map;

	    if (thisCtrl.lastPopup) {
		    map.removePopup(thisCtrl.lastPopup);
		}
		//var position = this.events.getMousePosition(e);
		var position = map.getLonLatFromPixel(e.xy);
		var size = new OpenLayers.Size(21,25);
		var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
		// select different icons for different markers
		// get the current pressed item in toolbar, maybe there's another method?
		var tbar = GeoAnnotator.MapPanelCtrl.containerPanel.getTopToolbar();
		var marker = null;
		tbar.items.get('Markers-group').items.each(function(item) {
		    if (item.pressed) {
			marker = item.id;
		    }
		});
		// change url to {{ STATIC_URL }}
		var icon = new OpenLayers.Icon('/static/images/' + marker + '.png', size, offset);   

		thisCtrl.markerLayer.addMarker(new OpenLayers.Marker(position,icon));

		// popup for annotation input
		var content = "<span>Input your comment:</span><br/><textarea></textarea><button>Confirm</button>"; // popup content
		thisCtrl.lastPopup = new OpenLayers.Popup.FramedCloud("MarkAnnotation-popup",
			position,
			new OpenLayers.Size(200,200),
			content,
			icon,
			true, // display close
			thisCtrl.onPopupClosed); 

		map.addPopup(thisCtrl.lastPopup);
	},

	// submit marker to server when popup closed
	onPopupClosed : function(e) {
	    var thisCtrl = GeoAnnotator.MapPanelCtrl;
	    thisCtrl.map.removePopup(thisCtrl.lastPopup);
	},

	setDrawMode : function(mode) {
		var thisCtrl = GeoAnnotator.MapPanelCtrl;
		if (thisCtrl.navigationControl) {
			thisCtrl.navigationControl.deactivate();	
		}
		if (thisCtrl.selectFootprintControl) {
			thisCtrl.selectFootprintControl.deactivate();
		}
		if (thisCtrl.drawFootprintControls) {
		    for (var key in thisCtrl.drawFootprintControls) {
			if (mode == key) {
			    thisCtrl.drawFootprintControls[key].activate();
			}
		    }
		}
		if (thisCtrl.modifyNewFootprintControl) {
			thisCtrl.modifyNewFootprintControl.deactivate();					
		}		
	},
	
	setModifyMode : function() {
		var thisCtrl = GeoAnnotator.MapPanelCtrl;
		if (thisCtrl.navigationControl) {
			thisCtrl.navigationControl.activate();	
		}
		if (thisCtrl.selectFootprintControl) {
			thisCtrl.selectFootprintControl.deactivate();
		}
		if (thisCtrl.drawFootprintControls) {
		    for (var key in thisCtrl.drawFootprintControls) {
			thisCtrl.drawFootprintControls[key].deactivate();
		    }
		}
		if (thisCtrl.modifyNewFootprintControl) {
			thisCtrl.modifyNewFootprintControl.activate();					
		}
	},

	buildMap : function (div, options)
	{
		var thisCtrl = GeoAnnotator.MapPanelCtrl;
		thisCtrl.map = new OpenLayers.Map(div,options);
    	
		//thisCtrl.map.addControl(new OpenLayers.Control.PanZoomBar());
    	//thisCtrl.map.addControl(new OpenLayers.Control.LayerSwitcher());
    	//thisCtrl.map.addControl(new OpenLayers.Control.MousePosition());
		//thisCtrl.map.addControl(new OpenLayers.Control.OverviewMap());
	},
	
	addFeatureToReference : function(feature) {
		/*
		if (feature.attributes.alias != null) {
			name = feature.attributes.alias;
		}
		*/
		var name = '[FP' + feature.attributes.id + ']'
		var id = feature.attributes.id;		
		GeoAnnotator.ContributePanelCtrl.addFootprintToReference(id, name);
				
		/*
		var records = GeoAnnotator.ContributePanelCtrl.footprintStore.query('id',id);
		for (var i = 0; i < records.length; i++){
			GeoAnnotator.ContributePanelCtrl.footprintStore.remove(records.get(i));
		}
	
		GeoAnnotator.ContributePanelCtrl.footprintStore.insert(0,new Ext.data.Record({id: id, type: type, name: name}));
		*/
	},
	
	removeFeatureFromReference : function(feature) {
		/*
		var records = GeoAnnotator.ContributePanelCtrl.footprintStore.query('id',feature.attributes.id);
		for (var i = 0; i < records.length; i++){
			GeoAnnotator.ContributePanelCtrl.footprintStore.remove(records.get(i));
		}
		*/
		GeoAnnotator.ContributePanelCtrl.removeFootprintFromReference(feature.attributes.id);
	},
	
	deleteFeature : function (feature){
		var thisCtrl = GeoAnnotator.MapPanelCtrl;
		for (var i = 0; i < GeoAnnotator.ContributePanelCtrl.newFootprints.length; i++){
			if (GeoAnnotator.ContributePanelCtrl.newFootprints[i].attributes.id == feature.attributes.id){
				GeoAnnotator.ContributePanelCtrl.removeFootprintFromReference(feature.attributes.id);
				GeoAnnotator.ContributePanelCtrl.newFootprints.splice(i,1);
				thisCtrl.newFootprintVectors.destroyFeatures([feature], {silent: true});
				thisCtrl.hoverFeature = null;
				return;
			}
		}
	},
	
	onModificationEnd: function(feature, modified) {
		var thisCtrl = GeoAnnotator.MapPanelCtrl;
		thisCtrl.setNavigationMode();
		thisCtrl.hoverFeature = null;
	},
	
	addSelectedFeaturesToReferences : function () {
		var thisCtrl = GeoAnnotator.MapPanelCtrl;
		var layer = thisCtrl.annotationVectors;
		for (var i = 0; i < layer.selectedFeatures.length; i++){
			var feature = layer.selectedFeatures[i];
			thisCtrl.addFeatureToReference(feature);
		}
	},
	
	showAnnotationListWindow : function () {
		var thisCtrl = GeoAnnotator.MapPanelCtrl;
		// change status
		// create the annotation list window if not open
		if (!thisCtrl.annotationListWindow){
			thisCtrl.annotationListStore = new Ext.data.JsonStore({
        		root: 'annotations',
        		totalProperty: 'totalCount',
        		idProperty: 'id',
        		fields: [
            	'id', 'userName', 
				{name: 'timeCreated', type: 'date'},
	            'excerpt'],
	        	proxy: new Ext.data.HttpProxy ({
	            	url: GeoAnnotator.baseUrl + 'annotations/'
	        	}),
				baseParams: {userId: GeoAnnotator.currUserId, forumId: GeoAnnotator.currForumId, start:0, limit:10}
			});
			// create the template
			var annotationListTpl = new Ext.XTemplate(
	        	'<tpl for=".">',
	        	'<div class="list-item">',
	            '<h3><span>{timeCreated:date("M d, Y")}</span>',
	            '{userName} says:</h3>',
	            '<p>{excerpt}</p>',
	        	'</div></tpl>'
    		);
			thisCtrl.annotationListDataView =  new Ext.DataView({
            	tpl: annotationListTpl,
            	store: thisCtrl.annotationListStore,
            	itemSelector: 'div.list-item',
				multiSelect: true,
				selectedClass: 'list-item-selected', 
				overClass:'list-item-over',
				emptyText : 'No Annotations'
				//plugins: new Ext.DataView.DragSelector({dragSafe:false})
        	});
			thisCtrl.annotationListDataView.on('click',thisCtrl.onAnnotationListItemClick);
			
			thisCtrl.annotationListWindow = new Ext.Window({
		            layout      : 'fit',
		            width       : 450,
		            autoHeight	: true,
					//height      : 450,
		            closeAction :'hide',
		            plain       : true,
					title		: 'Annotation List',
					autoScroll  : true,
		            items : [thisCtrl.annotationListDataView],
					tbar: new Ext.PagingToolbar({
            			store: thisCtrl.annotationListStore,
            			pageSize: 10,
            			displayInfo: true,
            			displayMsg: 'Annotations {0} - {1} of {2}',
            			emptyMsg: "No annotations to display"
        			}),		
		    });
			//thisCtrl.annotationListWindow.on('hide', function(){btn.toggle(false);})
		}
		thisCtrl.annotationListWindow.show();	
	},

	moveToFeature : function (featureId) {
		var thisCtrl = GeoAnnotator.MapPanelCtrl;
		for (var i=0; i < thisCtrl.annotationVectors.features.length; i++) {
			var feature = thisCtrl.annotationVectors.features[i];
			if (feature.attributes.id === featureId) {
				var lon = feature.geometry.getCentroid().x;
				var lat = feature.geometry.getCentroid().y;
				thisCtrl.map.panTo(new OpenLayers.LonLat(lon, lat));
				thisCtrl.selectFootprintControl.unselectAll();
				thisCtrl.selectFootprintControl.select(feature);
				return;
			};
		};
	},
	
	onFeatureAdded : function (feature){
	    var thisCtrl = GeoAnnotator.MapPanelCtrl;

	    if (feature.goemetry instanceof OpenLayers.Geometry.Polygon) {
		// use minus to distinguish new footprints with existing ones
		feature.attributes.id = '-'+GeoAnnotator.ContributePanelCtrl.newFootprints.length;
		feature.attributes.alias = 'new footprint';
		GeoAnnotator.ContributePanelCtrl.newFootprints.push(feature);
		if (GeoAnnotator.ContributePanelCtrl.containerPanel.collapsed === false) {
			thisCtrl.addFeatureToReference(feature);
		}
		/*
		var tbar = GeoAnnotator.ContributePanelCtrl.containerPanel.getTopToolbar();
		tbar.items.get('contribute-toolbox-group').items.get('drawFootprint-btn').toggle(false);
		*/
		thisCtrl.setNavigationMode();		
	    }
	    if (feature.geometry instanceof OpenLayers.Geometry.LineString) {
		// create popup
		// remove existing popup first
		if (thisCtrl.lastPopup) {
		    thisCtrl.map.removePopup(thisCtrl.lastPopup);
		}
		// todo: refine pupup anchor position
		var position = new OpenLayers.LonLat(feature.geometry.components[0].x, feature.geometry.components[0].y);
		var content = "<script>alert('hello');</script> \
		    <span>Rate the route:</span><br/><button onclick='GeoAnnotator.MapPanelCtrl.onRatingBtnClicked()' class='ratingbtn' style='background-color:#0F4DA8'>1</button> \
				<button class='ratingbtn' style='margin-left:0px;background-color:#00AB6F'>2</button> \
				<button class='ratingbtn' style='margin-left:0px;background-color:#F0FC00'>3</button> \
				<button class='ratingbtn' style='margin-left:0px;background-color:#FFA700'>4</button> \
				<button class='ratingbtn' style='margin-left:0px;background-color:#FF4500'>5</button>";
		thisCtrl.lastPopup = new OpenLayers.Popup("RouteRate-popup",
			position,
			new OpenLayers.Size(150,50),
			content,
			null,
			false); // display close
		thisCtrl.map.addPopup(thisCtrl.lastPopup);
		thisCtrl.setNavigationMode();

	    }
	    if (feature.goemetry instanceof OpenLayers.Geometry.Point) {
	    }
	},

	onRatingBtnClicked : function () {
	    // close rating popup
	    var thisCtrl = GeoAnnotator.MapPanelCtrl;
	    thisCtrl.map.removePopup(thisCtrl.lastPopup);
	    // change route line style
	    // submit route info to server
	},
					
	onClickFeature : function (feature){
		if (feature){
			var thisCtrl = GeoAnnotator.MapPanelCtrl;
			// get the annotatios based on the footprint id
			if (feature.attributes.id.indexOf('-') === 0) {
				return;
			}; 
			GeoAnnotator.currFootprintId = feature.attributes.id;
			
			if (parseInt(feature.attributes.refCount) === 1) {
				Ext.Ajax.request({
   					url: GeoAnnotator.baseUrl + 'annotations/',
   					//method: 'GET',
  					params: { userId: GeoAnnotator.currUserId, forumId: GeoAnnotator.currForumId, footprintId: GeoAnnotator.currFootprintId, start:0, limit:1},
   					success: function(xhr) {
						var currAnnotation = Ext.util.JSON.decode(xhr.responseText);
						// change the states
						if (currAnnotation.totalCount > 0) {
							var id = currAnnotation.annotations[0].id;
							var type = currAnnotation.annotations[0].type;
							GeoAnnotator.currAnnotationId = id;
			
							// update controls		
							//GeoAnnotator.TimelinePanelCtrl.update();
							GeoAnnotator.AnnotationInfoPanelCtrl.update();
		
							//GeoAnnotator.MapPanelCtrl.update();
						};
					},
   					failure: function() {
						alert('failed!');
					}
				});
			}
			else {
				// create the annotation list window if not open
				thisCtrl.showAnnotationListWindow();
			
				thisCtrl.annotationListStore.removeAll();
				//thisCtrl.annotationListStore.baseParams = {userId: GeoAnnotator.currUserId, forumId: GeoAnnotator.currForumId, footprintId: GeoAnnotator.currFootprintId};
				thisCtrl.annotationListStore.load({params:{userId: GeoAnnotator.currUserId, forumId: GeoAnnotator.currForumId, footprintId: GeoAnnotator.currFootprintId, start:0, limit:10}});
				//thisCtrl.annotationListStore.load({params:{footprintId: GeoAnnotator.currFootprintId}});
				thisCtrl.selectFootprintControl.clickFeature(feature);
			}
		}
	},

	onOverFeature : function(feature) {
		var thisCtrl = GeoAnnotator.MapPanelCtrl;
		feature.layer.drawFeature (feature, 'hover');
		thisCtrl.hoverFeature = feature; 
	},
	
	onOutFeature : function (feature) {
		var thisCtrl = GeoAnnotator.MapPanelCtrl;
		thisCtrl.hoverFeature = null;
		if (thisCtrl.contextMenu !== null) {
			thisCtrl.contextMenu.hide();
		}
		if (OpenLayers.Util.indexOf(this.layer.selectedFeatures, feature) == -1){
			feature.layer.drawFeature (feature, 'default');
		}
		else{
			feature.layer.drawFeature (feature, 'select');
		}		 	
	},
	
	
	onAnnotationListItemClick : function (dataView, index, node, e) {
		// change the states
		var id = dataView.getRecord(node).get('id');
		var type = dataView.getRecord(node).get('type');
		
		GeoAnnotator.currAnnotationId = id;
									
		// update controls		
		//GeoAnnotator.TimelinePanelCtrl.update();
		GeoAnnotator.AnnotationInfoPanelCtrl.update();
		
		//GeoAnnotator.MapPanelCtrl.update();
	},
};

