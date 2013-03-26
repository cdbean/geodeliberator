GeoAnnotator.ContributePanelCtrl = {
    containerPanel: null,
    contributeFormPanel: null,
    // new created footprints array
	newFootprints : [],

    register: function(containerPanel) {
        GeoAnnotator.ContributePanelCtrl.containerPanel = containerPanel;
    },

    init: function() {
        var thisCtrl = GeoAnnotator.ContributePanelCtrl;
		thisCtrl.newFootprints = [];

		if (!thisCtrl.contributeFormPanel) {
			thisCtrl.createContributePanel();
		}
		else {
			thisCtrl.onContributeReset();
		}
		thisCtrl.containerPanel.collapse(false);
		
    },

    update: function() {
		var thisCtrl = GeoAnnotator.ContributePanelCtrl;
        thisCtrl.onContributeReset();
    },

    createContributePanel: function() {
        var thisCtrl = GeoAnnotator.ContributePanelCtrl;

        thisCtrl.contributeFormPanel = new Ext.FormPanel({
            id: 'contribute-form',
            labelAlign: 'top',
            frame: true,
            autoHeight: true,
            bodyStyle: 'padding: 0 5 0 5;',
            items: [
            {
                xtype: 'hidden',
                id: 'newAnnotationId',
                name: 'newAnnotationId',
                value: '0'
            },
            {
                xtype: 'htmleditor',
                id: 'newAnnotationContent',
                name: 'newAnnotationContent',
                fieldLabel: 'Content',
                enableFont: false,
                enableLists: false,
                enableAlignments: false,
                height: 150,
                width: 330,
                autoScroll: true,
                anchor: '100%'
            },
			{
                xtype: 'radiogroup',
                fieldLabel: 'Visible to',
                hideLabel: false,
                name: 'shareLevelGroup',
                id: 'shareLevelGroup',
                columns: 2,
                items: [
                {
                    boxLabel: 'everyone',
                    name: 'shareLevel',
                    inputValue: 'everyone',
                    checked: true
                },
                {
                    boxLabel: 'registered users',
                    name: 'shareLevel',
                    inputValue: 'user'
                },
                {
                    boxLabel: 'group members',
                    name: 'shareLevel',
                    inputValue: 'member'
                },
                {
                    boxLabel: 'myself',
                    name: 'shareLevel',
                    inputValue: 'author'
                }]
            }],

            buttons: [{
                text: 'Submit',
                handler: thisCtrl.onContributeSubmit
            },
            {
                text: 'Cancel',
                handler: thisCtrl.onContributeReset
            }]
        });
		
		thisCtrl.containerPanel.add(thisCtrl.contributeFormPanel);
		thisCtrl.containerPanel.doLayout();

		thisCtrl.containerPanel.on('collapse', function() {
			var toolbox_group = GeoAnnotator.MapPanelCtrl.containerPanel.getTopToolbar().items.get('toolbox-group');
			if (toolbox_group) {
				toolbox_group.items.get('contribute-btn').toggle(false);
			}
			GeoAnnotator.MapPanelCtrl.setNavigationMode();
				
		});
		thisCtrl.containerPanel.on('expand', function() {
			var toolbox_group = GeoAnnotator.MapPanelCtrl.containerPanel.getTopToolbar().items.get('toolbox-group');
			if (toolbox_group) {
				toolbox_group.items.get('contribute-btn').toggle(true);
			}
			thisCtrl.contributeFormPanel.findById('newAnnotationContent').focus();
		});
    },

    getContextMap: function() {
        var map = GeoAnnotator.MapPanelCtrl.map;
        var xw = new XMLWriter();
        xw.writeStartDocument();
        xw.writeStartElement('contextmap');
        var zoom = map.getZoom();
        var centerX = map.getCenter().lon;
        var centerY = map.getCenter().lat;

        xw.writeAttributeString('zoom', zoom);
        xw.writeAttributeString('centerX', centerX);
        xw.writeAttributeString('centerY', centerY);

        // write options for map
        xw.writeStartElement('options');
        if (map.projection != null) {
            xw.writeStartElement('option');
            xw.writeAttributeString('key', 'projection');
            xw.writeAttributeString('value', map.projection);
            xw.writeEndElement();
        }
        if (map.displayProjection != null) {
            xw.writeStartElement('option');
            xw.writeAttributeString('key', 'displayProjection');
            xw.writeAttributeString('value', map.displayProjection);
            xw.writeEndElement();
        }
        if (map.units != null) {
            xw.writeStartElement('option');
            xw.writeAttributeString('key', 'units');
            xw.writeAttributeString('value', map.units);
            xw.writeEndElement();
        }
        if (map.maxResolution != null) {
            xw.writeStartElement('option');
            xw.writeAttributeString('key', 'maxResolution');
            xw.writeAttributeString('value', map.maxResolution);
            xw.writeEndElement();
        }
        if (map.maxExtent != null) {
            xw.writeStartElement('option');
            xw.writeAttributeString('key', 'maxExtent');
            xw.writeAttributeString('value', map.maxExtent.toBBOX(8));
            xw.writeEndElement();
        }
        if (map.numZoomLevels != null) {
            xw.writeStartElement('option');
            xw.writeAttributeString('key', 'numZoomLevels');
            xw.writeAttributeString('value', map.numZoomLevels);
            xw.writeEndElement();
        }
        xw.writeEndElement();
        // options
        var currLayers = GeoAnnotator.MapPanelCtrl.currLayers;
        if (currLayers.length > 0)
        {
            xw.writeStartElement('layers');

            for (var i = 0; i < currLayers.length; i++) {
                xw.writeStartElement('layer');
                xw.writeAttributeString('name', currLayers[i].name);
                switch (currLayers[i].CLASS_NAME) {
                case "OpenLayers.Layer.Google":
                    xw.writeAttributeString('type', "Google");
                    break;
                case "OpenLayers.Layer.WMS":
                    xw.writeAttributeString('type', "WMS");
                    //write url
                    if (currLayers[i].url != undefined && currLayers[i].url != null) {
                        xw.writeElementString('url', currLayers[i].url);
                    }
                    // write params
                    var params = currLayers[i].params;

                    if (params != undefined & params != null) {
                        xw.writeStartElement('params');

                        for (var key in params) {      
                            var value = params[key];
                                  
                            if (value != undefined && value != null) {
                                        xw.writeStartElement('param');
                                xw.writeAttributeString('key', key);
                                xw.writeAttributeString('value', value);
                                xw.writeEndElement();
                                // param
                                      
                            }
                        }
                        xw.writeEndElement();
                        //params
                    }
                    break;
                case "OpenLayers.Layer.GML":
                    xw.writeAttributeString('type', "GML");
                    //write url
                    if (currLayers[i].url != undefined && currLayers[i].url != null) {
                        xw.writeElementString('url', currLayers[i].url);
                    }
                    break;
                default:
                    break;
                }

                // write options
                var options = currLayers[i].options;
                if (options != undefined && options != null) {
                    xw.writeStartElement('options');
                    for (var key in options) {
                              
                        var value = options[key];
                              
                        if (value != undefined && value != null) {
                                    
                            if (key != 'formatOptions' && key != 'visibility') {
                                xw.writeStartElement('option');
                                xw.writeAttributeString('key', key);
                                if (key == 'format') {
                                    xw.writeAttributeString('value', new value().CLASS_NAME);
                                }
                                else if (currLayers[i].CLASS_NAME == 'OpenLayers.Layer.Google' && key == 'type') {
                                    xw.writeAttributeString('value', value.toString());
                                }
                                else {
                                    xw.writeAttributeString('value', value);
                                }
                                xw.writeEndElement();
                                // option
                            }
                                  
                        }
                    }
                    // write visibility option;
                    xw.writeStartElement('option');
                    xw.writeAttributeString('key', 'visibility');
                    xw.writeAttributeString('value', currLayers[i].visibility);
                    xw.writeEndElement();

                    xw.writeEndElement();
                    //options
                }

                // write formatOptions
                if (options['formatOptions'] != undefined && options['formatOptions'] != null) {
                    xw.writeStartElement('formatOptions');
                    var formatOptions = options['formatOptions'];
                    for (var key in formatOptions) {
                              
                        var value = formatOptions[key];
                              
                        if (value != undefined && value != null) {
                                    xw.writeStartElement('formatOption');
                            xw.writeAttributeString('key', key);
                            xw.writeAttributeString('value', value);
                            xw.writeEndElement();
                            // format option
                        }
                    }
                    xw.writeEndElement();
                    // formatOptions
                }

                xw.writeEndElement();
                // layer
                //}	
            }
            xw.writeEndElement();
            // layers
        }
        xw.writeEndElement();
        // contextmap
        xw.writeEndDocument();
        return xw.flush();
    },

	addFootprintToReference: function(fpId, name) {
		var thisCtrl = GeoAnnotator.ContributePanelCtrl;
		var htmleditor = thisCtrl.contributeFormPanel.getForm().findField('newAnnotationContent');
		htmleditor.focus();
		//htmleditor.insertAtCursor ('[[' + name + '|fp' + id + ']]');
		//htmleditor.setValue(htmleditor.getValue() + '[[' + name + '|fp' + id + ']]');
		var link_html = '<a href="#" class="ref-link" id="ref-fp' + fpId + '">' + name + '</a>'
		htmleditor.setValue(htmleditor.getValue() + link_html);
	},
	
	removeFootprintFromReference: function(fpId){
		var thisCtrl = GeoAnnotator.ContributePanelCtrl;
		var htmleditor = thisCtrl.contributeFormPanel.getForm().findField('newAnnotationContent');
		var content = htmleditor.getValue();
		
		var regex = /<a href=\"#\" class=\"ref-link\" id=\"ref-([fp,an]+-?[0-9]+)\">([a-z,0-9,_,\s,\-,\[,\]]+)<\/a>/gi; 
		var input = content
		if(regex.test(input)) {
			regex.lastIndex = 0;
			var matches = [];
			var match;
			while((match = regex.exec(input)) !== null) {
				if(match[0] === "") { 
					regex.lastIndex += 1 
				}
				else {
					matches.push({result: match, lastIndex: regex.lastIndex});
				}
			}
  			for (var i=0; i < matches.length; i++) {
				var match = matches[i].result;
				var id = match[1];
				var name = match[2];
				if (id === 'fp'+fpId) {
					content = content.replace(match[0], '');
				};
			}
		}
		htmleditor.setValue(content);
	},	
	
	addAnnotationToReference: function(anId, name){
		var thisCtrl = GeoAnnotator.ContributePanelCtrl;
		var htmleditor = thisCtrl.contributeFormPanel.getForm().findField('newAnnotationContent');
		htmleditor.focus();
		var link_html = '<a href="#" class="ref-link" id="ref-an' + anId + '">' + name + '</a>'
		htmleditor.setValue(htmleditor.getValue() + link_html);		
	},
	
	removeAnnotationFromReference: function(anId){
		var thisCtrl = GeoAnnotator.ContributePanelCtrl;
		var htmleditor = thisCtrl.contributeFormPanel.getForm().findField('newAnnotationContent');
		var content = htmleditor.getValue();
		
		var regex = /<a href=\"#\" class=\"ref-link\" id=\"ref-([fp,an]+-?[0-9]+)\">([a-z,0-9,_,\s,\-,\[,\]]+)<\/a>/gi; 
		var input = content
		if(regex.test(input)) {
			regex.lastIndex = 0;
			var matches = [];
			var match;
			while((match = regex.exec(input)) !== null) {
				if(match[0] === "") { 
					regex.lastIndex += 1 
				}
				else {
					matches.push({result: match, lastIndex: regex.lastIndex});
				}
			}
  			for (var i=0; i < matches.length; i++) {
				var match = matches[i].result;
				var id = match[1];
				var name = match[2];
				if (id === 'an'+fpId) {
					content = content.replace(match[0], '');
				};
			}
		}
		htmleditor.setValue(content);
	},	
	
    onContributeSubmit: function() {
        var thisCtrl = GeoAnnotator.ContributePanelCtrl
        var newAnnotation = {};
        // 0. id
        newAnnotation.id = thisCtrl.contributeFormPanel.getForm().findField('newAnnotationId').getValue();
        // 1. content
        newAnnotation.content = thisCtrl.contributeFormPanel.getForm().findField('newAnnotationContent').getValue();
        if (newAnnotation.content.length == 0) {
            Ext.Msg.alert('Error', 'The content of the annotation cannot be empty');
            return;
        }
        // 2. userId
        newAnnotation.userId = GeoAnnotator.currUserId;
        // 3. forumId
        newAnnotation.forumId = GeoAnnotator.currForumId;
        // 4. shareLevel
        var shareLevelGroup = thisCtrl.contributeFormPanel.getForm().findField('shareLevelGroup').items;
        newAnnotation.shareLevel = 'everyone';
        for (var i = 0; i < shareLevelGroup.items.length; i++) {
            if (shareLevelGroup.items[i].checked) {
                newAnnotation.shareLevel = shareLevelGroup.items[i].inputValue;
                break;
            }
        };
        // 6. timeCreated
        newAnnotation.timeCreated = new Date().toGMTString();
        // 7. contextMap
        newAnnotation.contextMap = thisCtrl.getContextMap();
        
		// 8. references and footprints
        newAnnotation.footprints = [];
		newAnnotation.references = [];
		var regex = /<a href=\"#\" class=\"ref-link\" id=\"ref-([fp,an]+-?[0-9]+)\">([a-z,0-9,_,\s,\-,\[,\]]+)<\/a>/gi; 
		var input = newAnnotation.content
		if(regex.test(input)) {
			regex.lastIndex = 0;
			var matches = [];
			var match;
			while((match = regex.exec(input)) !== null) {
				if(match[0] === "") { 
					regex.lastIndex += 1 
				}
				else {
					matches.push({result: match, lastIndex: regex.lastIndex});
				}
			}
  			for (var i=0; i < matches.length; i++) {
				var match = matches[i].result;
				var id = match[1];
				var name = match[2];
				
				if (id.indexOf('fp') === 0) {
					var exists = false;
					for (var j=0; j < newAnnotation.footprints.length; j++) {
						if (newAnnotation.footprints[j].id === id.substring(2)) {
							exists = true;
							break;
						}
					};
					if (!exists) {
						var footprint = {};
						footprint.alias = name;
						footprint.id = id.substring(2);		
						if (id.indexOf('fp-') === 0) {
							// new footprint
							for (var j = 0; j < thisCtrl.newFootprints.length; j++) {
                    			var feature = thisCtrl.newFootprints[j];
                    			if (footprint.id == feature.attributes.id) {
									var projWords = GeoAnnotator.MapPanelCtrl.map.projection.getCode().split(":");
									footprint.srid = projWords[projWords.length - 1];
                        			footprint.shape = new OpenLayers.Format.WKT().write(feature);
									newAnnotation.footprints.push(footprint);
                        			break;
                    			}
                			}
						}
						else {
							// existing footprint
							// allow annotation from other group/manuscript
							newAnnotation.footprints.push(footprint);
						}
					}
				}
				else if (id.indexOf('an') === 0) {
					// reference
					var exists = false;
					for (var j=0; j < newAnnotation.references.length; j++) {
						if (newAnnotation.references[j] === id.substring(2)) {
							exists = true;
							break;
						}
					};
					if (!exists) {
						newAnnotation.references.push(id.substring(2));
					}
				}	
			}
		} 
		thisCtrl.submitContributeFormData(newAnnotation);
    },

    onContributeReset: function() {
        var thisCtrl = GeoAnnotator.ContributePanelCtrl;

        // 0. id
        thisCtrl.contributeFormPanel.getForm().findField('newAnnotationId').setValue('0');
        // 1. content
        thisCtrl.contributeFormPanel.getForm().findField('newAnnotationContent').setValue('');
        // 2. shareLevel
        var shareLevelGroup = thisCtrl.contributeFormPanel.getForm().findField('shareLevelGroup').items;
		if (shareLevelGroup && shareLevelGroup.items) {
			for (var i = 0; i < shareLevelGroup.items.length; i++) {
            	if (i == 0) {
                	shareLevelGroup.items[i].setValue(true);
            	}
            	else {
                	shareLevelGroup.items[i].setValue(false);
            	}
        	}
		}
		thisCtrl.containerPanel.collapse(false);

        //thisCtrl.contributePanel.items.get('contribute-form').getForm().findField('issue').setValue(false);
        // 4. references
        //thisCtrl.referenceStore.removeAll();

        // 5. footprints
        //thisCtrl.footprintStore.removeAll();

    },
    
	submitContributeFormData: function(newAnnotation) {
        //alert(Ext.util.JSON.encode(newAnnotation));
        var thisCtrl = GeoAnnotator.ContributePanelCtrl;
        // request the user information
        Ext.Ajax.request({
            url: GeoAnnotator.baseUrl + 'annotation/',
            success: thisCtrl.onAddNewAnnotationSuccess,
            failure: thisCtrl.onAddNewAnnotationFailure,
            params: {
                'new': Ext.util.JSON.encode(newAnnotation),
                'userId': GeoAnnotator.currUserId,
                'forumId': GeoAnnotator.currForumId
            }
        });
    },

    onAddNewAnnotationSuccess: function(xhr) {
        var thisCtrl = GeoAnnotator.ContributePanelCtrl;
		var submitState = Ext.util.JSON.decode(xhr.responseText);
		if (submitState.success == true) {
            // change the states
            //alert('successfuly added!');
            // reset the new footprints array
			
            thisCtrl.newFootprints = [];
			GeoAnnotator.currFootprintId = '0';

			GeoAnnotator.currAnnotationId = submitState.data.id;

            // update controls		
            GeoAnnotator.TimelinePanelCtrl.update();
            GeoAnnotator.AnnotationInfoPanelCtrl.update();
			GeoAnnotator.ContributePanelCtrl.update();
			var currParams = {}
			if (GeoAnnotator.currUserId != '0'){
				currParams.userId = GeoAnnotator.currUserId;	
			} 
			if (GeoAnnotator.currForumId != '0'){
				currParams.forumId = GeoAnnotator.currForumId;
			}
			GeoAnnotator.MapPanelCtrl.update(currParams);     
			//GeoAnnotator.MapPanelCtrl.update();
			GeoAnnotator.ManageWindowCtrl.update();

			thisCtrl.containerPanel.collapse(false);
        }
        else {
            alert(submitState.errors.message);
        }
    },

    onAddNewAnnotationFailoure: function() {
        alert('failed to add new annotation');
    }
    
};
