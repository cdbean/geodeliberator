function Comment(type, content) {
    this.type = type;
    this.content = content;
}

var GeoAnnotator = {
	currUserId : '0',
	currForumId : '0',
	currAnnotationId : '0',
	currFootprintId : '0',
			
	//var baseUrl = "http://130.203.158.62/geoannotator/";
	//baseUrl : "../GeoAnnotatorService/",
	baseUrl : "/api/",
	
	init : function (){
		this.currUserId = $('#userId').val();
		this.currForumId = '0';
		this.currAnnotationId = '0';
		this.currFootprintId = '0';
                alert('{{ userId }}');
						
		GeoAnnotator.ContainerTBCtrl.init();
		
		GeoAnnotator.MapPanelCtrl.init();
		GeoAnnotator.TimelinePanelCtrl.init();
	
		GeoAnnotator.AnnotationInfoPanelCtrl.init();
		GeoAnnotator.ContributePanelCtrl.init();
		GeoAnnotator.ManageWindowCtrl.init();
		
		GeoAnnotator.AnnotationBookmarkWindowCtrl.init();
		GeoAnnotator.AnnotationHistoryWindowCtrl.init();
		
		
		// check whether the user is stored in cookie
		//var userId = Ext.state.Manager.get('userId', '0');
//		this.currUserId = Ext.state.Manager.get('userId', '0'); 
		
		// check the url params
//		var params = Ext.urlDecode(location.search.substring(1));
//		this.currUserId = params['userId'] || this.currUserId;
//		this.currForumId = params['forumId'] || this.currForumId;
		GeoAnnotator.ContainerTBCtrl.update();
		if (this.currUserId !== '0') {
			GeoAnnotator.ManageWindowCtrl.update();
		}
		if (this.currForumId !== '0') {
			this.currAnnotationId = params['annotationId'] || this.currAnnotationId;
			if (this.currAnnotationId !== '0') {
				GeoAnnotator.AnnotationInfoPanelCtrl.update();	
			};
			GeoAnnotator.TimelinePanelCtrl.update();
			GeoAnnotator.MapPanelCtrl.update();
			GeoAnnotator.ManageWindowCtrl.update();
		};
		
		
	}
};

GeoAnnotator.ContainerTBCtrl = {
	// container panel
	containerTB : null,
	currUserInfo : {},
	currForumInfo : {},
	// log in window
	logInWindow : null,
	forumInfoWindow : null,
	forumList : null,
	register : function (containerTB) {
		GeoAnnotator.ContainerTBCtrl.containerTB = containerTB;
	},
	
	init : function () {
		thisCtrl = GeoAnnotator.ContainerTBCtrl;
		thisCtrl.currUserInfo = {};
		thisCtrl.currForumInfo = {};
		thisCtrl.updatePanelContent();
	},
	
	update : function (){
		thisCtrl = GeoAnnotator.ContainerTBCtrl;
		// request the user information
		Ext.Ajax.request({
   			url: GeoAnnotator.baseUrl + 'user/',
   			success: thisCtrl.onLoadUserInfoSuccess,
   			failure: thisCtrl.onLoadUserInfoFailure,
   			params: {'userId':GeoAnnotator.currUserId}
		});
	},
		
	updatePanelContent: function(){
		// 0. clear current panel content
		thisCtrl = GeoAnnotator.ContainerTBCtrl;
		if (thisCtrl.containerTB.items) {
			thisCtrl.containerTB.removeAll();
		}		
		// 1. the forum selection list
		var forumListStore = new Ext.data.JsonStore({
			autoDestroy: true,
			autoLoad: true,
			url: GeoAnnotator.baseUrl + 'forums/',
			baseParams: {'userId':GeoAnnotator.currUserId},
			root: 'participating',
			idProperty: 'id',
			fields: ['id', 'name']
		});
		thisCtrl.forumList = new Ext.form.ComboBox({
			store: forumListStore, 
			displayField:'name',
			typeAhead: true,
			mode: 'local',
			triggerAction: 'all',
			emptyText:'Select a forum...',
			selectOnFocus:true,
			listeners:{
         		'select': thisCtrl.onForumListSelect
    		}
		});
		thisCtrl.containerTB.add({xtype: 'tbtext', text: 'Current Forum: '});
		thisCtrl.containerTB.add(thisCtrl.forumList);
		thisCtrl.containerTB.add('-');
		thisCtrl.containerTB.add({
			id: 'forum-id-btn',
			text: 'Forum Info',
			iconCls: 'detail-icon',
			disabled : true,
			listeners:{
				'click': thisCtrl.onForumDetailClick
			}
		});		
		thisCtrl.containerTB.add(' ');
		// 2. toggle History and bookmark windows
		thisCtrl.containerTB.add({
            id: 'timeline-btn',
            iconCls: 'timeline-icon',
            disabled : true,
			pressed: false,
            enableToggle: true,
            toggleHandler: function(button, pressed){
				if(pressed){
					GeoAnnotator.TimelinePanelCtrl.containerPanel.expand(false);
				}
				else{
					GeoAnnotator.TimelinePanelCtrl.containerPanel.collapse(false);
				}
			},
            text: 'Timeline',
            tooltip: {
                title: 'Timeline',
                text: 'Show the timeline'
            }
        });
		thisCtrl.containerTB.add({
            id: 'annotation-history-btn',
            iconCls: 'annotation-history-tab',
            disabled : true,
			pressed: false,
            enableToggle: true,
            toggleHandler: function(button, pressed){
				if(pressed){
					GeoAnnotator.AnnotationHistoryWindowCtrl.containerWindow.show();
				}
				else{
					GeoAnnotator.AnnotationHistoryWindowCtrl.containerWindow.hide();
				}
			},
            text: 'History',
            tooltip: {
                title: 'History',
                text: 'Show the browsing history'
            }
        });
		thisCtrl.containerTB.add({
            id: 'annotation-bookmark-btn',
            iconCls: 'annotation-bookmark-tab',
            disabled : true,
			pressed: false,
            enableToggle: true,
            toggleHandler: function(button, pressed){
				if(pressed){
					GeoAnnotator.AnnotationBookmarkWindowCtrl.containerWindow.show();
				}
				else{
					GeoAnnotator.AnnotationBookmarkWindowCtrl.containerWindow.hide();
				}
			},
            text: 'Bookmarks',
            tooltip: {
                title: 'Bookmarks',
                text: 'Show the browsing bookmarks'
            }
        });
		
		// 3. the login buttons
		if (GeoAnnotator.currUserId != '0') {
			thisCtrl.containerTB.add('->');
			thisCtrl.containerTB.add({xtype: 'tbtext', text: 'Welcome, ' + thisCtrl.currUserInfo.userName + '!'});
			thisCtrl.containerTB.add('-');
			thisCtrl.containerTB.add({
			    itemId: 'logoutLink',
			    xtype: 'box',
			    autoEl: {
				tag: 'a',
				href: '/user/logout',
				html: 'Log out'
			    }
			});
		}
		else {
			thisCtrl.containerTB.add('->');
			thisCtrl.containerTB.add({
				text: 'Log In',
				listeners: {
					'click' : thisCtrl.onLogInClick 
				}
			});
		}
		thisCtrl.containerTB.doLayout();		
	},
	
	onLogInClick : function() {
		var thisCtrl = GeoAnnotator.ContainerTBCtrl;
		
		if(!thisCtrl.logInWindow){
			var login = new Ext.FormPanel({ 
	        	labelWidth:80,
	        	url: GeoAnnotator.baseUrl + 'authentication/', 
	        	frame:true, 
	        	title:'Please Login', 
	        	defaultType:'textfield',
				monitorValid:true,
				// Specific attributes for the text fields for username / password. 
				// The "name" attribute defines the name of variables sent to the server.
	        	items:[{ 
	                fieldLabel:'Username', 
	                name:'userName', 
	                allowBlank:false 
	            },
				{ 
	                fieldLabel:'Password', 
	                name:'password', 
	                inputType:'password', 
	                allowBlank:false 
	            }],
	 
				// All the magic happens after the user clicks the button     
	        	buttons:[{ 
	                text:'Login',
	                formBind: true,	 
					id: 'login-btn',
	                // Function that fires when user clicks the button 
	                handler:function(){ 
	                    login.getForm().submit({ 
		                    method:'POST', 
		                    waitTitle:'Connecting', 
		                    waitMsg:'Sending data...',
		  
		                    success:function(form, action){ 
								var obj = Ext.util.JSON.decode(action.response.responseText); 
		                    	//Ext.Msg.alert('Status', obj.data.userId);
								GeoAnnotator.currForumId = '0';
								GeoAnnotator.currAnnotationId = '0';
								GeoAnnotator.currFootprintId = '0';
		
								GeoAnnotator.ContainerTBCtrl.init();
								GeoAnnotator.MapPanelCtrl.init();
								GeoAnnotator.TimelinePanelCtrl.init();
			
								GeoAnnotator.AnnotationInfoPanelCtrl.init();
								GeoAnnotator.ContributePanelCtrl.init();
								GeoAnnotator.ManageWindowCtrl.init();
								GeoAnnotator.AnnotationHistoryWindowCtrl.init();
								GeoAnnotator.AnnotationBookmarkWindowCtrl.init();
				
								// set the user in cookie
								GeoAnnotator.currUserId = obj.data.userId;
								Ext.state.Manager.set('userId', GeoAnnotator.currUserId);
								GeoAnnotator.ContainerTBCtrl.update();
								GeoAnnotator.ContainerTBCtrl.logInWindow.hide();

		                   	},
		  
		                    failure:function(form, action){ 
		                    	if(action.failureType == 'server'){ 
		                       		obj = Ext.util.JSON.decode(action.response.responseText); 
									Ext.Msg.alert('Login Failed!', obj.errors.reason); 
		                        }
								else{ 
		                            Ext.Msg.alert('Warning!', 'Authentication server is unreachable : ' + action.response.responseText); 
		                        } 
		                        login.getForm().reset(); 
		                    } 
	                	}); 
	                } 
	            }] 
	    	});

			thisCtrl.logInWindow = new Ext.Window({
		    	layout      : 'fit',
	            width       : 300,
	            height      : 150,
	            closeAction :'hide',
	            plain       : true,
				modal		: true,
				//title		: 'Legend',
	            items : [login],
				defaultButton: 'login-btn'
	    	});
			thisCtrl.logInWindow.on('hide', function(){login.getForm().reset();});
		}
		thisCtrl.logInWindow.show();
	},
	
	onLogOutClick : function() {
//		Ext.state.Manager.clear('userId');

	    $.get ( '/user/logout'
	    );
//	    GeoAnnotator.init();
	},
	
	onLoadUserInfoSuccess : function (xhr) {
		thisCtrl = GeoAnnotator.ContainerTBCtrl;
		thisCtrl.currUserInfo = Ext.util.JSON.decode(xhr.responseText);
		if (thisCtrl.currUserInfo != null) {
			// update panel
			thisCtrl.updatePanelContent();
			
			if (GeoAnnotator.currUserId != '0') {
				var storedUserId = Ext.state.Manager.get('userId', '0');
				
				if (GeoAnnotator.currUserId != storedUserId) {
					// set cookie
					Ext.state.Manager.set('userId', GeoAnnotator.currUserId);
				}
				else {
					if (Ext.state.Manager.get('forumId', '0') != '0'){
						// simulate the click on the group
						
					}
				}
			}		
		}
	},
	
	onLoadUserInfoFailure : function () {
		// do nothing
		alert("Failed to load user information!");
	},
	
	onForumListSelect : function(combo, record, index) {
		var id = record.get('id');
		var thisCtrl = GeoAnnotator.ContainerTBCtrl;
		if (id && GeoAnnotator.currForumId != id) {
			// reset the new footprints array
			GeoAnnotator.currForumId = id;
			
			thisCtrl.containerTB.getComponent('forum-id-btn').enable();
			thisCtrl.containerTB.getComponent('timeline-btn').enable();
			thisCtrl.containerTB.getComponent('annotation-history-btn').enable();
			thisCtrl.containerTB.getComponent('annotation-bookmark-btn').enable();
		}
			
		// update controls		
		var currParams = {};
		if (GeoAnnotator.currUserId != '0'){
			currParams.userId = GeoAnnotator.currUserId;	
		} 
		if (GeoAnnotator.currForumId != '0'){
			currParams.forumId = GeoAnnotator.currForumId;
		}
		GeoAnnotator.MapPanelCtrl.update(currParams);
		GeoAnnotator.TimelinePanelCtrl.update();
		GeoAnnotator.ManageWindowCtrl.update();

		if (record.data.name == 'Questionnaire') {
		    var html = "<div class='default-info'> Please draw a route on the map. <br><br>\
				<button onclick='GeoAnnotator.MapPanelCtrl.setDrawMode(\"line\")'>Start drawing your route!</button> \
				</div>";	
                    html += $('#legend').clone().css('display', '').html();
		    GeoAnnotator.AnnotationInfoPanelCtrl.annotationInfoDisplayPanel.body.update(html);
		}


	},
	
	onForumDetailClick : function() {
		var thisCtrl = GeoAnnotator.ContainerTBCtrl;
        // request the group information
        Ext.Ajax.request({
            url: GeoAnnotator.baseUrl + 'forum/',
            success: thisCtrl.onLoadForumInfoSuccess,
            failure: thisCtrl.onLoadForumInfoFailure,
            params: {
                'userId': GeoAnnotator.currUserId,
                'forumId': GeoAnnotator.currForumId
            }
        });
	},
	
	onLoadForumInfoSuccess: function(xhr) {
       var thisCtrl = GeoAnnotator.ContainerTBCtrl;
       thisCtrl.currForumInfo = Ext.util.JSON.decode(xhr.responseText);
       if (thisCtrl.currForumInfo != null) {
           // show the forum detail
           thisCtrl.showForumInfo();

           // set cookies
           if (GeoAnnotator.currUserId != '0' && GeoAnnotator.currForumId != '0') {
               Ext.state.Manager.set('userId', GeoAnnotator.currUserId);
               Ext.state.Manager.set('forumId', GeoAnnotator.currForumId);
           }
       }
    },

    onLoadForumInfoFailure: function() {
        // do nothing
        alert("Failed to load forum information!");
    },
 
	showForumInfo : function() {
		var thisCtrl = GeoAnnotator.ContainerTBCtrl;
		html = '<div id="forumGeneralInfo">' + thisCtrl.currForumInfo.description + '</div>';
		//alert(html);
		if(!thisCtrl.forumInfoWindow){
			thisCtrl.forumInfoWindow = new Ext.Window({
		    	layout      : 'fit',
	            width       : 500,
	            height      : 500,
				autoScroll	: true,
	            closeAction :'hide',
	            plain       : true,
				modal		: false,
				html		: html,
	    	});
			thisCtrl.forumInfoWindow.on('hide', function(){GeoAnnotator.ContainerTBCtrl.forumInfoWindow.body.update('');});
		}
		else {
			thisCtrl.forumInfoWindow.body.update(html);
		}
		thisCtrl.forumInfoWindow.show();
		thisCtrl.forumInfoWindow.alignTo(thisCtrl.containerTB.getComponent('forum-id-btn').el, 'tl-tl');
	}
};

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
	// is newRouteLayer necessary?
	newRouteLayer : null,
	myRouteLayer : null,
	otherRouteLayer: null,
	markerLayer : null,
	pointLayer : null,
	// popup
	lastPopup: null,
	lastMarkerFeature: null,
	// routeFeature: OpenLayers.Feature
	// routeFeature.attributes.id
	routes: [],
	routeSegments: [],
	currRoute: null,
	currRouteSegment: null,
	currMarkerType: null,

	// styles
	footprintStyle : null,
	newfootprintStyle: null,
	newRouteStyle: null,
	myRouteStyle: null,
	otherRouteStyle: null,
	markerStyle: null,
	// controls
	navigationControl : null,
	modifyNewFootprintControl : null,
	selectFootprintControl: null,
	drawFootprintControls : null,
	selectRouteControl: null,
	dragMarkerControl: null,
	
	// feature when hovering
	hoverFeature : null,
	// feature selected
	selectedFeature: null,
	// context menu
	contextMenu : null,
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
		thisCtrl.selectedFeature = null;
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
			'../static/images/instruction.png',
			new OpenLayers.Bounds(-180, -88.759, 180, 88.759),
			new OpenLayers.Size(400, 400),
			{numZoomLevels: 1}
		);
    	
		
		thisCtrl.currLayers.push(thisCtrl.baseLayer);
		thisCtrl.map.addLayers(thisCtrl.currLayers);
		thisCtrl.map.zoomToMaxExtent();
		//alert(thisCtrl.map.getResolution());
		//thisCtrl.containerPanel.on('contextmenu', thisCtrl.onMapPanelContextMenu);
//		thisCtrl.containerPanel.getEl('tbar').on('contextmenu', function(evt, div) {
		thisCtrl.map.div.oncontextmenu = function (evt) {
		    var thisCtrl = GeoAnnotator.MapPanelCtrl; 
		    if(!thisCtrl.contextMenu){ // create context menu on first right click
			thisCtrl.contextMenu = new Ext.menu.Menu({
			    id:'map-panel-ctx',
			    items: []
			});
		    }
		    thisCtrl.contextMenu.removeAll();
		    
		    if (GeoAnnotator.currUserId !== '0' && GeoAnnotator.currForumId !== '0') {
			var currFeature = thisCtrl.hoverFeature;
			if (currFeature !== null) {
			    if (currFeature.layer.name == 'My Routes') {
				thisCtrl.contextMenu.add({
				    id:'change-visibility-ctx',
				    iconCls:'change-visibility-icon',
				    text:'Visibility',
				    scope: thisCtrl,
				    menu: {
					items: [
					    new Ext.menu.CheckItem({
						id: 'everyone-check-ctx',
						text: 'Everyone',
						scope: thisCtrl,
						handler: function () {
						    thisCtrl.setRouteVisibility(thisCtrl.hoverFeature, 'everyone');
						}
					    }),
					    new Ext.menu.CheckItem({
						id: 'group-check-ctx',
						text: 'Group',
						scope: thisCtrl,
						handler: function () {
						    thisCtrl.setRouteVisibility(thisCtrl.hoverFeature, 'group');
						}
					    }),
					    new Ext.menu.CheckItem({
						id: 'registered-check-ctx',
						text: 'Registered users',
						scope: thisCtrl,
						handler: function() {
						    thisCtrl.setRouteVisibility(thisCtrl.hoverFeature, 'registered');
						}
					    }),
					    new Ext.menu.CheckItem({
						id: 'myself-check-ctx',
						text: 'Myself',
						scope: thisCtrl,
						handler: function() {
						    thisCtrl.setRouteVisibility(thisCtrl.hoverFeature, 'myself');
						}
					    })
					]
				    }
				});
				var visMenuItemId = currFeature.attributes.visibility + '-check-ctx';
				thisCtrl.contextMenu.items.items[0].menu.items.get(visMenuItemId).checked = true;
			    }

			    thisCtrl.contextMenu.add({
				id:'modify-footprint-ctx',
				iconCls:'modify-footprint-icon',
				text:'Modify',
				scope: thisCtrl,
				handler:function(){
				    var thisCtrl = GeoAnnotator.MapPanelCtrl;
				    if (currFeature !== null) {
					thisCtrl.setModifyMode();
					thisCtrl.selectFeatureControl.selectFeature(currFeature);
				    }
				}
			    });
			    thisCtrl.contextMenu.add({
				id:'delete-feature-ctx',
				iconCls:'delete-feature-icon',
				text:'Delete',
				scope: thisCtrl,
				handler:function(){
				    var thisCtrl = GeoAnnotator.MapPanelCtrl;

				    if (currFeature !== null) {
					    thisCtrl.setNavigationMode();
					    // pop up message box for confirmation
					    $( "#dialog-confirm" ).dialog({
						resizable: false,
						height:140,
						modal: true,
						buttons: {
						    "Delete": function() {
							thisCtrl.deleteFeature(currFeature);
							$( this ).dialog( "close" );
						    },
						    Cancel: function() {
							$( this ).dialog( "close" );
						    }
						},
						resizable: true,
					    });
				    }
				}
			    });
			}
			else {
//			    thisCtrl.contextMenu.add({
//				id:'report-problem-ctx',
//				iconCls:'report-problem-icon',
//				text:'Report a problem',
//				scope: thisCtrl,
//				menu: {
//				    items: [
//					new Ext.menu.CheckItem({
//					    id: 'noise-check-ctx',
//					    iconCls:'noise',
//					    text: 'Noise',
//					    scope: thisCtrl,
//					    handler: function() {
//						thisCtrl.addMarkerByPosition([evt.x, evt.y], 'noise');
//					    }
//					}),
//					new Ext.menu.CheckItem({
//					    id: 'stop-check-ctx',
//					    iconCls:'stop',
//					    text: 'Stop',
//					    scope: thisCtrl,
//					    handler: function() {
//						thisCtrl.addMarkerByPosition([evt.x, evt.y], 'stop');
//					    }
//					}),
//					new Ext.menu.CheckItem({
//					    id: 'question-check-ctx',
//					    iconCls:'question',
//					    text: 'Question',
//					    scope: thisCtrl,
//					    handler: function() {
//					       	thisCtrl.addMarkerByPosition([evt.x, evt.y], 'question');
//					    }
//					}),
//					new Ext.menu.CheckItem({
//					    id: 'landscape-check-ctx',
//					    iconCls:'landscape',
//					    text: 'Landscape',
//					    scope: thisCtrl,
//					    handler: function () {
//						thisCtrl.addMarkerByPosition([evt.x, evt.y], 'landscape');
//					    }
//					}),
//					new Ext.menu.CheckItem({
//					    id: 'traffic-check-ctx',
//					    iconCls:'traffic',
//					    text: 'Traffic',
//					    scope: thisCtrl,
//					    handler: function() {
//					       	thisCtrl.addMarkerByPosition([evt.x, evt.y], 'traffic');
//					    }
//					}),
//					new Ext.menu.CheckItem({
//					    id: 'litter-check-ctx',
//					    iconCls:'litter',
//					    text: 'Litter',
//					    scope: thisCtrl,
//					    handler: function () {
//						thisCtrl.addMarkerByPosition([evt.x, evt.y], 'litter');
//					    }
//					}),
//					new Ext.menu.CheckItem({
//					    id: 'disturbing-check-ctx',
//					    iconCls:'disturbing',
//					    text: 'Disturbing',
//					    scope: thisCtrl,
//					    handler: function () {
//					       	thisCtrl.addMarkerByPosition([evt.x, evt.y], 'disturbing');
//					    }
//					}),
//					new Ext.menu.CheckItem({
//					    id: 'lighting-check-ctx',
//					    iconCls:'lighting',
//					    text: 'Lighting',
//					    scope: thisCtrl,
//					    handler: function() {
//					       	thisCtrl.addMarkerByPosition([evt.x, evt.y], 'lighting');
//					    }
//					}),
//					new Ext.menu.CheckItem({
//					    id: 'safety-check-ctx',
//					    iconCls:'safety',
//					    text: 'Safety',
//					    scope: thisCtrl,
//					    handler: function() {
//						thisCtrl.addMarkerByPosition([evt.x, evt.y], 'safety');
//					    }
//					}),
//					new Ext.menu.CheckItem({
//					    id: 'smell-check-ctx',
//					    iconCls:'smell',
//					    text: 'Smell',
//					    scope: thisCtrl,
//					    handler: function () {
//						thisCtrl.addMarkerByPosition([evt.x, evt.y], 'smell');
//					    }
//					}),
//					new Ext.menu.CheckItem({
//					    id: 'exclamation-check-ctx',
//					    iconCls:'exclamation',
//					    text: 'Exclamation',
//					    scope: thisCtrl,
//					    handler: function () {
//						thisCtrl.addMarkerByPosition([evt.x, evt.y], 'exclamation');
//					    }
//					}),
//				    ]
//				}
//			    }); 
//			    thisCtrl.contextMenu.add({
//				id:'report-facility-ctx',
//				iconCls:'report-facility-icon',
//				text:'Report a facility',
//				scope: thisCtrl,
//				handler:function(){
//				    var thisCtrl = GeoAnnotator.MapPanelCtrl;
//				    thisCtrl.addMarkerByPosition([evt.x, evt.y]);
//				}
//			    }); 
			    thisCtrl.contextMenu.add({
				id:'report-problems-ctx',
				iconCls:'report-problems-icon',
				text:'Report Observations',
				scope: thisCtrl,
				handler:function(){
				    var thisCtrl = GeoAnnotator.MapPanelCtrl;
				    thisCtrl.addMarkersByPosition([evt.x, evt.y-120]); // todo: y is wrong here
				}
			    }); 
//			    thisCtrl.contextMenu.add({
//				id:'report-facilities-ctx',
//				iconCls:'report-facilities-icon',
//				text:'Report facilities',
//				scope: thisCtrl,
//				handler:function(){
//				    var thisCtrl = GeoAnnotator.MapPanelCtrl;
//				    thisCtrl.addFacilityByPosition([evt.x, evt.y]);
//				}
//			    });
			}
			if (thisCtrl.contextMenu.items.length > 0) {
				thisCtrl.contextMenu.showAt([evt.x, evt.y]);
			};
			evt.preventDefault();				
		    }

		};
		// todo: click on map to hide contextmenu. The code below doesn't work
		thisCtrl.map.events.register('click', thisCtrl.map, function () {
		    if (thisCtrl.contextMenu) {
			thisCtrl.contextMenu.hide();
		    }
		});

		thisCtrl.markerStyle = new OpenLayers.StyleMap({
		    strokeWidth: 3,
		    strokeOpacity: 1,
		    strokeColor: '#00FF00',
		    pointRadius:16,
		});
		var typeRule = {
		    'noise': {externalGraphic: '../static/images/noise.png'},
		    'stop': {externalGraphic: '../static/images/stop.png'},
		    'question': {externalGraphic: '../static/images/question.png'},
		    'landscape': {externalGraphic: '../static/images/landscape.png'},
		    'traffic': {externalGraphic: '../static/images/traffic.png'},
		    'litter': {externalGraphic: '../static/images/litter.png'},
		    'disturbing': {externalGraphic: '../static/images/disturbing.png'},
		    'lighting': {externalGraphic: '../static/images/lighting.png'},
		    'safety': {externalGraphic: '../static/images/safety.png'},
		    'smell': {externalGraphic: '../static/images/smell.png'},
		    'multiple': {externalGraphic: '../static/images/problems.png'},
		    'house': {externalGraphic: '../static/images/house.png'},
		    'restaurant': {externalGraphic: '../static/images/restaurant.png'},
		    'grocery': {externalGraphic: '../static/images/grocery.png'},
		    'service': {externalGraphic: '../static/images/service.png'},
		    'office': {externalGraphic: '../static/images/office.png'},
		    'school': {externalGraphic: '../static/images/school.png'},
		    'park': {externalGraphic: '../static/images/park.png'},
		    'gathering': {externalGraphic: '../static/images/gathering.png'},
		    'other': {externalGraphic: '../static/images/other.png'},
		};
		thisCtrl.markerStyle.addUniqueValueRules('default', 'type', typeRule);


		thisCtrl.myRouteStyle = new OpenLayers.StyleMap({
		    'default': new OpenLayers.Style({
				strokeColor: "#FF8333",
				strokeOpacity: 1,
				strokeWidth: 2,
//				fillColor: "#EE4F44",
//				fillOpacity: 0.0
				//pointerEvents: 'visiblePainted',
				//pointRadius: 6, // sized according to type attribute
						//label : '${refCount}',
				//fontColor: '#ffffff',
						//labelAlign: 'center',
				//fontWeight: 'bold',
						//fontSize: '13px'
						}),
		     'select': new OpenLayers.Style({
//				fillColor: '#FFCC33',
//				fillOpacity: 0.3, 
				strokeColor: '#FF0000',
				strokeOpacity: 1,
				strokeWidth: 4,
				//pointerEvents: 'visiblePainted',
				cursor: 'pointer'
					//pointRadius: 6
				}),
		     'hover': new OpenLayers.Style({
//				fillColor: '#FFCC33',
//				fillOpacity: 0.5, 
				strokeColor: '#FF0000',
				strokeOpacity: 1,
				strokeWidth: 3,
				//pointerEvents: 'visiblePainted',
				cursor: 'pointer'
					//pointRadius: 6
			})
		});

		thisCtrl.otherRouteStyle = new OpenLayers.StyleMap({
		    'default': new OpenLayers.Style({
				strokeColor: "#FF8333",
				strokeOpacity: 1,
				strokeWidth: 2,
				strokeDashstyle: 'longdash',
//				fillColor: "#EE4F44",
//				fillOpacity: 0.0
				//pointerEvents: 'visiblePainted',
				//pointRadius: 6, // sized according to type attribute
						//label : '${refCount}',
				//fontColor: '#ffffff',
						//labelAlign: 'center',
				//fontWeight: 'bold',
						//fontSize: '13px'
						}),
		     'select': new OpenLayers.Style({
//				fillColor: '#FFCC33',
//				fillOpacity: 0.3, 
				strokeColor: '#FF0000',
				strokeOpacity: 1,
				strokeWidth: 4,
				strokeDashstyle: 'longdash',
				//pointerEvents: 'visiblePainted',
				cursor: 'pointer'
					//pointRadius: 6
				}),
		     'hover': new OpenLayers.Style({
//				fillColor: '#FFCC33',
//				fillOpacity: 0.5, 
				strokeColor: '#FF0000',
				strokeOpacity: 1,
				strokeWidth: 3,
				strokeDashstyle: 'longdash',
				//pointerEvents: 'visiblePainted',
				cursor: 'pointer'
					//pointRadius: 6
			})
		});

		var lookup = {
		    "5": {strokeColor: '#FF665A'},
		    "4": {strokeColor: '#CF575C'},
		    "3": {strokeColor: '#A14973'},
		    "2": {strokeColor: '#73355C'},
		    "1": {strokeColor: '#4C264C'},
		    "null": {strokeColor: '#FF9999'} 
		};
		thisCtrl.myRouteStyle.addUniqueValueRules("default", "rate", lookup);
		thisCtrl.otherRouteStyle.addUniqueValueRules("default", "rate", lookup);

		var transportRule = {
		    'Bike': {strokeWidth: 2},
		    'Walk': {strokeWidth: 4},
		    'Both': {strokeWidth: 2},
		};
		thisCtrl.myRouteStyle.addUniqueValueRules("default", "transport", transportRule);
		thisCtrl.otherRouteStyle.addUniqueValueRules("default", "transport", transportRule);

		thisCtrl.newRouteStyle = new OpenLayers.StyleMap({
		    'default': new OpenLayers.Style({
				strokeColor: "#EE4F44",
				strokeOpacity: 1,
				strokeWidth: 2,
//				fillColor: "#EE4F44",
//				fillOpacity: 0.0
				//pointerEvents: 'visiblePainted',
				//pointRadius: 6, // sized according to type attribute
						//label : '${refCount}',
				//fontColor: '#ffffff',
						//labelAlign: 'center',
				//fontWeight: 'bold',
						//fontSize: '13px'
						}),
		     'select': new OpenLayers.Style({
//				fillColor: '#FFCC33',
//				fillOpacity: 0.3, 
				strokeColor: '#FF0000',
				strokeOpacity: 1,
				strokeWidth: 4,
				//pointerEvents: 'visiblePainted',
				cursor: 'pointer'
					//pointRadius: 6
				}),
		     'hover': new OpenLayers.Style({
//				fillColor: '#FFCC33',
//				fillOpacity: 0.5, 
				strokeColor: '#FF0000',
				strokeOpacity: 1,
				strokeWidth: 3,
				//pointerEvents: 'visiblePainted',
				cursor: 'pointer'
					//pointRadius: 6
			})
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

	setRouteVisibility : function (feature, visibility) {
	    $.post(feature.attributes.id + '/visibility',
		    {
			'userId': GeoAnnotator.currUserId,
			'routeId': feature.attributes.id,
			'visibility': visibility
		    },
		    function () {
			feature.attributes.visibility = visibility;
		    }
	    );
	},

	// load routes and markers
	onLoadRoutesSuccess : function (xhr) {
	    var thisCtrl = GeoAnnotator.MapPanelCtrl;
	    var response = Ext.util.JSON.decode(xhr.responseText);
	    var routes_info = response.routes;
	    var route_segs_info = response.route_segs;
	    var routes_id = [];
	    var my_routes = [];
	    var other_routes = [];

	    if (routes_info.length != 0) {
		var wktParser = new OpenLayers.Format.WKT();
		for (var i = 0; i < routes_info.length; i++) {
		    var rou = routes_info[i];
		    var feature = wktParser.read(rou.shape);
		    var origin_prj = new OpenLayers.Projection("EPSG:" + rou.srid);
		    feature.geometry.transform(origin_prj, thisCtrl.map.projection);
		    feature.attributes.id = rou.id;
		    feature.attributes.visibility = rou.visibility;
		    feature.attributes.rate = rou.rate;
		    feature.attributes.owner = rou.owner;
		    feature.attributes.transport = rou.transport
		    // create instances of OpenLayers.Marker
		    var markers = [];
		    var markers_info = rou.markers;
		    for (var j = 0; j < markers_info.length; j++) {
			var ma = markers_info[j];
			var fp = ma.footprint;
			var fea = wktParser.read(fp.shape);
			var origin_prj = new OpenLayers.Projection("EPSG:" + fp.srid);
			fea.geometry.transform(origin_prj, thisCtrl.map.projection);

			// actually one marker has only one footprint, just for temporarily doing
//			    var pos = fea.geometry.getBounds().getCenterLonLat();
//			    var size = new OpenLayers.Size(21,25);
//			    var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
//			    var icon = new OpenLayers.Icon('../static/images/' + ma.type + '.png', size, offset);   
//			    var marker = new OpenLayers.Marker(pos,icon);
			fea.attributes = {};
			fea.attributes.route = ma.route;
			fea.attributes.seg   = ma.seg;
			fea.attributes.id    = ma.id;
			fea.attributes.type  = ma.type;
			fea.attributes.comment = ma.comment;
			fea.style = fea.style ? fea.style : {};
			fea.style.display = 'none';
//			    marker.events.on({
//				'mousedown': function(e) {
//				    alert ('hello!');
//				}
//			    });
//			    marker.events.register('click', marker, function () { alert('hello'); });

			markers.push(fea);
			    // add marker to layer
//			    marker.display(false);
		    }
		    thisCtrl.pointLayer.addFeatures(markers);
		    feature.attributes.markers = markers;

		    thisCtrl.routes.push(feature);
		    routes_id.push(rou.id);
		    if (rou.owner.id == GeoAnnotator.currUserId) {
			my_routes.push(feature);
		    } else {
			other_routes.push(feature);
		    }
		} 
		for (var i = 0; i < route_segs_info.length; i++) {
		    var seg = route_segs_info[i];
		    var feature = wktParser.read(seg.shape);
		    var origin_prj = new OpenLayers.Projection("EPSG:" + seg.srid);
		    feature.geometry.transform(origin_prj, thisCtrl.map.projection);
		    feature.attributes.id = seg.id;
		    thisCtrl.routeSegments.push(feature);
		}
		// add route or segments?
//		thisCtrl.routeLayer.addFeatures(thisCtrl.routeSegments);
		thisCtrl.myRouteLayer.addFeatures(my_routes);
		thisCtrl.otherRouteLayer.addFeatures(other_routes);
	    }
	},

	onLoadRoutesFailure : function (xhr) {
	    var err = Ext.util.JSON.decode(xhr.responseText);
	    alert(err);
	},

	onLoadMarkersSuccess : function (xhr) {
	    var thisCtrl = GeoAnnotator.MapPanelCtrl;
	    var markerInfo = Ext.util.JSON.decode(xhr.responseText);
	    var markannotations = markerInfo.markannotations;

	    if (markannotations.length != 0) {
		var markerFeatures = []
		var wktParser = new OpenLayers.Format.WKT();

		for (var i = 0; i < markannotations.length; i++) {
		    var ma = markannotations[i];
		    for (var j = 0; j < ma.footprints.length; j++) {
			var fp = ma.footprints[j];
			var feature = wktParser.read(fp.shape);
			var origin_prj = new OpenLayers.Projection("EPSG:" + fp.srid);
			feature.geometry.transform(origin_prj, thisCtrl.map.projection);
			markerFeatures.push(feature);

			// actually one marker has only one footprint, just for temporarily doing
			var pos = feature.geometry.getBounds().getCenterLonLat();
			var size = new OpenLayers.Size(21,25);
			var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
			var icon = new OpenLayers.Icon('../static/images/' + ma.markType + '.png', size, offset);   
			thisCtrl.markerLayer.addMarker(new OpenLayers.Marker(pos,icon));
		    }
		}
		if (markerFeatures.length != 0) {
		    thisCtrl.pointLayer.addFeatures(markerFeatures);
		}
	    }
	},

	onLoadMarkersFailure : function (xhr) {
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
		// request routes -- for questionnaire
		Ext.Ajax.request({
		    url: 'routes',
		    success: thisCtrl.onLoadRoutesSuccess,
		    failure: thisCtrl.onLoadRoutesFailure,
		    params: {userId: GeoAnnotator.currUserId} 
		});
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
		    switch(layerType) {
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
		thisCtrl.newRouteLayer	= new OpenLayers.Layer.Vector('New Route', {styleMap: thisCtrl.newRouteStyle, displayInLayerSwitcher: false});
		thisCtrl.map.addLayer(this.newRouteLayer);
		thisCtrl.myRouteLayer		= new OpenLayers.Layer.Vector('My Routes', {styleMap: thisCtrl.myRouteStyle, displayInLayerSwitcher: true});
		thisCtrl.map.addLayer(thisCtrl.myRouteLayer);
		thisCtrl.otherRouteLayer	= new OpenLayers.Layer.Vector("Other's Route", {styleMap: thisCtrl.otherRouteStyle, displayInLayerSwitcher: true});
		thisCtrl.map.addLayer(thisCtrl.otherRouteLayer);
		
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

//		thisCtrl.markerLayer = new OpenLayers.Layer.Markers('Markers', {styleMap: thisCtrl.newfootprintStyle, displayInLayerSwitcher: true});
//		thisCtrl.map.addLayer(thisCtrl.markerLayer);
		thisCtrl.pointLayer = new OpenLayers.Layer.Vector('Markers', {styleMap: thisCtrl.markerStyle, displayInLayerSwitcher: true});
		thisCtrl.map.addLayer(thisCtrl.pointLayer);

		// set zIndex to listen to events
//		thisCtrl.markerLayer.setZIndex(999);
//		thisCtrl.myRouteLayer.setZIndex(1000);
//		thisCtrl.newRouteLayer.setZIndex(1000);
//		thisCtrl.otherRouteLayer.setZIndex(1000);
	},
	
	loadControls : function() {
	    var thisCtrl = GeoAnnotator.MapPanelCtrl;
	    thisCtrl.map.addControl(new OpenLayers.Control.PanZoomBar());
	    thisCtrl.map.addControl(new OpenLayers.Control.LayerSwitcher());
	    thisCtrl.map.addControl(new OpenLayers.Control.Attribution());
    
	    thisCtrl.navigationControl = new OpenLayers.Control.Navigation();
	    thisCtrl.map.addControl(thisCtrl.navigationControl);

	    thisCtrl.selectFeatureControl = new OpenLayers.Control.SelectFeature([
		thisCtrl.myRouteLayer, 
		thisCtrl.otherRouteLayer, 
		thisCtrl.newRouteLayer,
		thisCtrl.pointLayer
		], {
		    clickout: false, toggle: true,
		    multiple: true, hover: false,
		    onSelect: thisCtrl.onSelectFeature,
		    onUnselect: thisCtrl.onUnselectFeature,
		    callbacks: {
			over: thisCtrl.onOverFeature, 
			out: thisCtrl.onOutFeature, 
		    }
		}
	    );
	    thisCtrl.map.addControl(thisCtrl.selectFeatureControl);

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

//	    thisCtrl.selectMarkerControl = new OpenLayers.Control.SelectFeature(
//		thisCtrl.pointLayer,
//		{
//		    clickout: true, toggle: true,
//		    multiple: false, hover: false,
//		}
//	    );
//	    thisCtrl.map.addControl(thisCtrl.selectMarkerControl);

//	    thisCtrl.newRouteLayer.events.on({
//		'featureselected': function(e) {
//		    GeoAnnotator.MapPanelCtrl.currRoute = e.feature;
//		    if (e.feature.attributes.markers) {
//			for (var i = 0; i < e.feature.attributes.markers.length; i++) {
//			    e.feature.attributes.markers[i].style = null;
//			}
//		    }
//		    if (e.feature.attributes.id) { // to indicate whehter it is a newly drawn route
//			GeoAnnotator.AnnotationInfoPanelCtrl.displayRouteSummary(e.feature);
//		    }
//		},
//		'featureunselected': function(e) {
//		    GeoAnnotator.MapPanelCtrl.currRoute = null;
//		    for (var i = 0; i < e.feature.attributes.markers.length; i++) {
//			e.feature.attributes.markers[i].style = {display: 'none'};
//		    }
//		    var html = "<p>Click on the route to see the detailed information</p>";
//		    html += "<button onclick='GeoAnnotator.MapPanelCtrl.setDrawMode(\"line\")'>Draw another route</button> "
//		    GeoAnnotator.AnnotationInfoPanelCtrl.annotationInfoDisplayPanel.body.update(html);
//		}
//	    });
//	    thisCtrl.myRouteLayer.events.on({
//		'featureselected': function(e) {
//		    GeoAnnotator.MapPanelCtrl.currRoute = e.feature;
//		    if (e.feature.attributes.markers) {
//			for (var i = 0; i < e.feature.attributes.markers.length; i++) {
//			    e.feature.attributes.markers[i].style = null;
//			}
//		    }
//		    if (e.feature.attributes.id) { // to indicate whehter it is a newly drawn route
//			GeoAnnotator.AnnotationInfoPanelCtrl.displayRouteSummary(e.feature);
//		    }
//		},
//		'featureunselected': function(e) {
//		    GeoAnnotator.MapPanelCtrl.currRoute = null;
//		    for (var i = 0; i < e.feature.attributes.markers.length; i++) {
//			e.feature.attributes.markers[i].style = {display: 'none'};
//		    }
//		    var html = "<p>Click on the route to see the detailed information</p>";
//		    html += "<button onclick='GeoAnnotator.MapPanelCtrl.setDrawMode(\"line\")'>Draw another route</button> "
//		    GeoAnnotator.AnnotationInfoPanelCtrl.annotationInfoDisplayPanel.body.update(html);
//		}
//	    });
//	    thisCtrl.otherRouteLayer.events.on({
//		'featureselected': function(e) {
//		    GeoAnnotator.MapPanelCtrl.currRoute = e.feature;
//		    if (e.feature.attributes.markers) {
//			for (var i = 0; i < e.feature.attributes.markers.length; i++) {
//			    e.feature.attributes.markers[i].style = null;
//			}
//		    }
//		    GeoAnnotator.AnnotationInfoPanelCtrl.displayRouteSummary(e.feature);
//		},
//		'featureunselected': function(e) {
//		    GeoAnnotator.MapPanelCtrl.currRoute = null;
//		    for (var i = 0; i < e.feature.attributes.markers.length; i++) {
//			e.feature.attributes.markers[i].style = {display: 'none'};
//		    }
//		    var html = "<p>Click on the route to see the detailed information</p>";
//		    html += "<button onclick='GeoAnnotator.MapPanelCtrl.setDrawMode(\"line\")'>Draw another route</button> "
//		    GeoAnnotator.AnnotationInfoPanelCtrl.annotationInfoDisplayPanel.body.update(html);
//		}
//	    });
//	    thisCtrl.pointLayer.events.on({
//		'featureselected': function(e) {
//		    var thisCtrl = GeoAnnotator.MapPanelCtrl;
//		    var fea = e.feature;
//		    fea.popup = new OpenLayers.Popup("marker-popup",
//			fea.geometry.getBounds().getCenterLonLat(),
//			new OpenLayers.Size(200,150),
//			$('#markerPopupContent').css('display', '').html(),
//			false
//		    );
//
//		    thisCtrl.lastPopup = fea.popup;
//
//		    thisCtrl.map.addPopup(thisCtrl.lastPopup, true);
//		},
//		'featureunselected': function(e) {
//		    thisCtrl.map.removePopup(thisCtrl.lastPopup);
//		}
//	    });
	    
//	    thisCtrl.modifyNewFootprintControl = new OpenLayers.Control.ModifyFeature(thisCtrl.newFootprintVectors);
//	    thisCtrl.newFootprintVectors.events.register("afterfeaturemodified", 
//		thisCtrl.newFootprintVectors, 
//		thisCtrl.onModificationEnd
//	    );
	    //thisCtrl.modifyNewFootprintControl.onDeletingStart = thisCtrl.onFeatureDeleted;
//	    thisCtrl.map.addControl(thisCtrl.modifyNewFootprintControl);

	    thisCtrl.modifyFeatureControl = new OpenLayers.Control.ModifyFeature(thisCtrl.myRouteLayer);
//	    thisCtrl.modifyFeatureControl.mode = OpenLayers.Control.ModifyFeature.RESHAPE | OpenLayers.Control.ModifyFeature.DRAG;
//	    thisCtrl.modifyFeatureControl.createVertices = true;
	    thisCtrl.myRouteLayer.events.register("afterfeaturemodified", 
		thisCtrl.myRouteLayer, 
		thisCtrl.onModificationEnd
	    );
	    thisCtrl.map.addControl(thisCtrl.modifyFeatureControl);

	    thisCtrl.modifyMarkerControl = new OpenLayers.Control.ModifyFeature(thisCtrl.pointLayer,
		{
		    mode: OpenLayers.Control.ModifyFeature.DRAG
		}
	    );
//	    thisCtrl.modifyMarkerControl.mode = OpenLayers.Control.ModifyFeature.DRAG;
//	    thisCtrl.markerLayer.events.register("afterfeaturemodified", 
//		thisCtrl.markerLayer, 
//		thisCtrl.onModificationEnd
//	    );
	    thisCtrl.map.addControl(thisCtrl.modifyMarkerControl);
			    
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
		    thisCtrl.newRouteLayer, 
		    OpenLayers.Handler.Path, 
		    {
			featureAdded:function(feature) { 
			    feature.state = OpenLayers.State.INSERT; 
			    thisCtrl.onFeatureAdded(feature);
			}
		    }
		),
		point: new OpenLayers.Control.DrawFeature(
		    thisCtrl.pointLayer, 
		    OpenLayers.Handler.Point, 
		    {
			featureAdded:function(feature) { 
			    feature.attributes.type = 'noise';
			    feature.state = OpenLayers.State.INSERT; 
			    thisCtrl.onFeatureAdded(feature);
			}
		    }
		)
	    };

	    for (var key in thisCtrl.drawFootprintControls) {
		thisCtrl.map.addControl(thisCtrl.drawFootprintControls[key]);    	
	    }

	    // set the default behavoirs
	    thisCtrl.setNavigationMode();
	},
	
	loadToolbar : function () {
		// add top toolbar 
		//alert(thisCtrl.containerPanel.getTopToolbar());
		var thisCtrl = GeoAnnotator.MapPanelCtrl;
		var tbar = thisCtrl.containerPanel.getTopToolbar();
		tbar.items.each(function (item, index, length) {
			item.destroy();
		});
		if (GeoAnnotator.currForumId === '0') {
			return;
		}; 
		
		if (GeoAnnotator.currUserId !== '0') {
		    var thisCtrl = GeoAnnotator.MapPanelCtrl;
		    tbar.add({
			xtype: 'buttongroup',
			id: 'Problem-group',
			title: 'Problems',
//			disabled: true,
			//columns: 3,
			defaults: {
			    scale: 'medium'
			},
			items: [{
			    id: 'noise',
			    iconCls: 'noise',
			    pressed: false,
			    enableToggle: true,
			    toggleGroup: 'marks',
			    toggleHandler: function(button, pressed){
						    if(pressed){
							thisCtrl.setDrawMode('point');
							thisCtrl.currMarkerType = button.id;
						    }
						    else{
							thisCtrl.setNavigationMode();
						    }
					    },
			    tooltip: { text: 'noisy' }
			}, {
			    id: 'stop',
			    iconCls: 'stop',
			    pressed: false,
			    enableToggle: true,
			    toggleGroup: 'marks',
			    toggleHandler: function(button, pressed){
						    if(pressed){
							thisCtrl.setDrawMode('point');
							thisCtrl.currMarkerType = button.id;
						    }
						    else{
							thisCtrl.setNavigationMode();
						    }
					    },
			    tooltip: { text: 'stop' }
			}, {
			    id: 'landscape',
			    iconCls: 'landscape',
			    pressed: false,
			    enableToggle: true,
			    toggleGroup: 'marks',
			    toggleHandler: function(button, pressed){
						    if(pressed){
							thisCtrl.setDrawMode('point');
							thisCtrl.currMarkerType = button.id;
						    }
						    else{
							// do something
							thisCtrl.setNavigationMode();
						    }
					    },
			    tooltip: { text: 'beautiful landscape' }
			}, {
			    id: 'question',
			    iconCls: 'question',
			    pressed: false,
			    enableToggle: true,
			    toggleGroup: 'marks',
			    toggleHandler: function(button, pressed){
						    if(pressed){
							thisCtrl.setDrawMode('point');
							thisCtrl.currMarkerType = button.id;
						    }
						    else{
							thisCtrl.setNavigationMode();
						    }
					    },
			    tooltip: { text: 'questionable' }
			}, {
			    id: 'traffic',
			    iconCls: 'traffic',
			    pressed: false,
			    enableToggle: true,
			    toggleGroup: 'marks',
			    toggleHandler: function(button, pressed){
						    if(pressed){
							thisCtrl.setDrawMode('point');
							thisCtrl.currMarkerType = button.id;
						    }
						    else{
							thisCtrl.setNavigationMode();
						    }
					    },
			    tooltip: { text: 'traffic' }
			}, {
			    id: 'litter',
			    iconCls: 'litter',
			    pressed: false,
			    enableToggle: true,
			    toggleGroup: 'marks',
			    toggleHandler: function(button, pressed){
						    if(pressed){
							thisCtrl.setDrawMode('point');
							thisCtrl.currMarkerType = button.id;
						    }
						    else{
							thisCtrl.setNavigationMode();
						    }
					    },
			    tooltip: { text: 'litter' }
			}, {
			    id: 'disturbing',
			    iconCls: 'disturbing',
			    pressed: false,
			    enableToggle: true,
			    toggleGroup: 'marks',
			    toggleHandler: function(button, pressed){
						    if(pressed){
							thisCtrl.setDrawMode('point');
							thisCtrl.currMarkerType = button.id;
						    }
						    else{
							thisCtrl.setNavigationMode();
						    }
					    },
			    tooltip: { text: 'People/animals disturbing' }
			}, {
			    id: 'safety',
			    iconCls: 'safety',
			    pressed: false,
			    enableToggle: true,
			    toggleGroup: 'marks',
			    toggleHandler: function(button, pressed){
						    if(pressed){
							thisCtrl.setDrawMode('point');
							thisCtrl.currMarkerType = button.id;
						    }
						    else{
							thisCtrl.setNavigationMode();
						    }
					    },
			    tooltip: { text: 'safety' }
			}, {
			    id: 'lighting',
			    iconCls: 'lighting',
			    pressed: false,
			    enableToggle: true,
			    toggleGroup: 'marks',
			    toggleHandler: function(button, pressed){
						    if(pressed){
							thisCtrl.setDrawMode('point');
							thisCtrl.currMarkerType = button.id;
						    }
						    else{
							thisCtrl.setNavigationMode();
						    }
					    },
			    tooltip: { text: 'Lighting' }
			}, {
			    id: 'smell',
			    iconCls: 'smell',
			    pressed: false,
			    enableToggle: true,
			    toggleGroup: 'marks',
			    toggleHandler: function(button, pressed){
						    if(pressed){
							thisCtrl.setDrawMode('point');
							thisCtrl.currMarkerType = button.id;
						    }
						    else{
							thisCtrl.setNavigationMode();
						    }
					    },
			    tooltip: { text: 'smell' }
			}, ]
		    });
		    tbar.add({
			xtype: 'buttongroup',
			id: 'Facility-group',
			title: 'Facilities',
//			disabled: true,
			//columns: 3,
			defaults: {
			    scale: 'medium'
			},
			items: [{
			    id: '',
			    iconCls: 'house',
			    pressed: false,
			    enableToggle: true,
			    toggleGroup: 'marks',
			    toggleHandler: function(button, pressed){
						    if(pressed){
							thisCtrl.setDrawMode('point');
							thisCtrl.currMarkerType = button.id;
						    }
						    else{
							thisCtrl.setNavigationMode();
						    }
					    },
			    tooltip: { text: 'Houses/Apartments' }
			}, {
			    id: 'restaurant',
			    iconCls: 'restaurant',
			    pressed: false,
			    enableToggle: true,
			    toggleGroup: 'marks',
			    toggleHandler: function(button, pressed){
						    if(pressed){
							thisCtrl.setDrawMode('point');
							thisCtrl.currMarkerType = button.id;
						    }
						    else{
							thisCtrl.setNavigationMode();
						    }
					    },
			    tooltip: { text: 'Restaurants/Shops' }
			}, {
			    id: 'grocery',
			    iconCls: 'grocery',
			    pressed: false,
			    enableToggle: true,
			    toggleGroup: 'marks',
			    toggleHandler: function(button, pressed){
						    if(pressed){
							thisCtrl.setDrawMode('point');
							thisCtrl.currMarkerType = button.id;
						    }
						    else{
							// do something
							thisCtrl.setNavigationMode();
						    }
					    },
			    tooltip: { text: 'Grocery store' }
			}, {
			    id: 'service',
			    iconCls: 'service',
			    pressed: false,
			    enableToggle: true,
			    toggleGroup: 'marks',
			    toggleHandler: function(button, pressed){
						    if(pressed){
							thisCtrl.setDrawMode('point');
							thisCtrl.currMarkerType = button.id;
						    }
						    else{
							thisCtrl.setNavigationMode();
						    }
					    },
			    tooltip: { text: 'Services(Laundry Mat, Cat Repair, Post Office, etc' }
			}, {
			    id: 'office',
			    iconCls: 'office',
			    pressed: false,
			    enableToggle: true,
			    toggleGroup: 'marks',
			    toggleHandler: function(button, pressed){
						    if(pressed){
							thisCtrl.setDrawMode('point');
							thisCtrl.currMarkerType = button.id;
						    }
						    else{
							thisCtrl.setNavigationMode();
						    }
					    },
			    tooltip: { text: 'Offices' }
			}, {
			    id: 'school',
			    iconCls: 'school',
			    pressed: false,
			    enableToggle: true,
			    toggleGroup: 'marks',
			    toggleHandler: function(button, pressed){
						    if(pressed){
							thisCtrl.setDrawMode('point');
							thisCtrl.currMarkerType = button.id;
						    }
						    else{
							thisCtrl.setNavigationMode();
						    }
					    },
			    tooltip: { text: 'Schools, churches or other community centers' }
			}, {
			    id: 'park',
			    iconCls: 'park',
			    pressed: false,
			    enableToggle: true,
			    toggleGroup: 'marks',
			    toggleHandler: function(button, pressed){
						    if(pressed){
							thisCtrl.setDrawMode('point');
							thisCtrl.currMarkerType = button.id;
						    }
						    else{
							thisCtrl.setNavigationMode();
						    }
					    },
			    tooltip: { text: 'Recreation trails, parks, or forested areas' }
			}, {
			    id: 'gathering',
			    iconCls: 'gathering',
			    pressed: false,
			    enableToggle: true,
			    toggleGroup: 'marks',
			    toggleHandler: function(button, pressed){
						    if(pressed){
							thisCtrl.setDrawMode('point');
							thisCtrl.currMarkerType = button.id;
						    }
						    else{
							thisCtrl.setNavigationMode();
						    }
					    },
			    tooltip: { text: 'Neighborhood gathering space (a coffee shop, plaza, or other popular hang out' }
			}, {
			    id: 'other',
			    iconCls: 'other',
			    pressed: false,
			    enableToggle: true,
			    toggleGroup: 'marks',
			    toggleHandler: function(button, pressed){
						    if(pressed){
							thisCtrl.setDrawMode('point');
							thisCtrl.currMarkerType = button.id;
						    }
						    else{
							thisCtrl.setNavigationMode();
						    }
					    },
			    tooltip: { text: 'Other comment' }
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
		if (thisCtrl.dragMarkerControl) {
			thisCtrl.dragMarkerControl.activate();
		}
		if (thisCtrl.selectFeatureControl) {
			thisCtrl.selectFeatureControl.activate();
		}
		if (thisCtrl.drawFootprintControls) {
		    for (var key in thisCtrl.drawFootprintControls) {
			thisCtrl.drawFootprintControls[key].deactivate();
		    }
		}
		if (thisCtrl.modifyFeatureControl) {
			thisCtrl.modifyFeatureControl.deactivate();					
		}
		if (thisCtrl.modifyMarkerControl) {
			thisCtrl.modifyMarkerControl.deactivate();					
		}
	},

	setDrawMode : function(mode) {
	    var thisCtrl = GeoAnnotator.MapPanelCtrl;
	    if (thisCtrl.navigationControl) {
		    thisCtrl.navigationControl.activate();	
	    }
	    if (thisCtrl.dragMarkerControl) {
		    thisCtrl.dragMarkerControl.deactivate();
	    }
	    if (thisCtrl.selectFeatureControl) {
		    thisCtrl.selectFeatureControl.deactivate();
	    }
	    if (thisCtrl.selectMarkerControl) {
		    thisCtrl.selectMarkerControl.deactivate();
	    }
	    if (thisCtrl.modifyFeatureControl) {
		    thisCtrl.modifyFeatureControl.deactivate();					
	    }
	    if (thisCtrl.modifyMarkerControl) {
		    thisCtrl.modifyMarkerControl.deactivate();					
	    }
	    if (thisCtrl.drawFootprintControls) {
		for (var key in thisCtrl.drawFootprintControls) {
		    if (mode == key) {
			thisCtrl.drawFootprintControls[key].activate();
		    }
		}
	    }
	},
	
	setModifyMode : function() {
		var thisCtrl = GeoAnnotator.MapPanelCtrl;
		if (thisCtrl.navigationControl) {
			thisCtrl.navigationControl.activate();	
		}
		if (thisCtrl.selectFeatureControl) {
			thisCtrl.selectFeatureControl.activate();
		}
		if (thisCtrl.dragMarkerControl) {
			thisCtrl.dragMarkerControl.activate();
		}
		if (thisCtrl.selectFootprintControl) {
			thisCtrl.selectFootprintControl.deactivate();
		}
		if (thisCtrl.drawFootprintControls) {
		    for (var key in thisCtrl.drawFootprintControls) {
			thisCtrl.drawFootprintControls[key].deactivate();
		    }
		}
		if (thisCtrl.modifyFeatureControl) {
			thisCtrl.modifyFeatureControl.activate();					
		}
		if (thisCtrl.modifyMarkerControl) {
			thisCtrl.modifyMarkerControl.activate();					
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

		// send a delete request
		if (feature.geometry instanceof OpenLayers.Geometry.LineString) {
		    $.post( 'route/' + feature.attributes.id + '/delete',
			{
			    'routeId': feature.attributes.id, 
			    'userId': GeoAnnotator.currUserId 
			},
			function(result) {
			    if (result.success) {
				feature.layer.destroyFeatures([feature], {silent: true});
				thisCtrl.pointLayer.destroyFeatures(feature.attributes.markers)
				thisCtrl.hoverFeature = null;
				thisCtrl.selectedFeature = null;
				thisCtrl.currRoute = null;
			    } else {
				alert (result.error);
			    }
			}
		    );
		}
		else if (feature.geometry instanceof OpenLayers.Geometry.Point) {
		    $.post( 'marker/' + feature.attributes.id + '/delete',
			{
			    'markerId': feature.attributes.id, 
			    'userId': GeoAnnotator.currUserId 
			},
			function(result) {
			    if (result.success) {
				feature.layer.destroyFeatures([feature], {silent: true});
				thisCtrl.hoverFeature = null;
				thisCtrl.selectedFeature = null;
			    } else {
				alert (result.error);
			    }
			}
		    );
		}
	},
	
	onModificationEnd: function(feature, modified) {
		var thisCtrl = GeoAnnotator.MapPanelCtrl;
		console.log('feature modified');
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
	
	addFacilityByPosition: function (xy) {
	    var thisCtrl = GeoAnnotator.MapPanelCtrl;
	    var map = thisCtrl.map;
	    var pos	= map.getLonLatFromPixel({x:xy[0], y:(xy[1]-10)});
	    thisCtrl.lastMarkerFeature	= new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(pos.lat, pos.lon));

	    var html = $('#observationsPopup').clone().css(display, '').html();
	    thisCtrl.lastPopup = new OpenLayers.Popup("MultiMarker-popup",
		    pos,
		    new OpenLayers.Size(200,250),
		    html,
		    false);

	    thisCtrl.lastMarkerFeature.attributes.type = 'facilities';
	    thisCtrl.lastMarkerFeature.popup = thisCtrl.lastPopup;
	    map.addPopup(thisCtrl.lastMarkerFeature.popup, true);

	    thisCtrl.pointLayer.addFeatures([thisCtrl.lastMarkerFeature]);

	    $(":checkbox[name='facilities']").click(function () {
		var thisCheck = $(this);
		var divId = "#" + thisCheck.val() + "Div";
		if (thisCheck.is(':checked')) {
		    $(divId).show();
		} else {
		    $(divId).hide();
		}
	    });
	},

	addMarkerByPosition : function(xy, type) {
	    var thisCtrl = GeoAnnotator.MapPanelCtrl;
	    var map = thisCtrl.map;
	    var pos	= map.getLonLatFromPixel({x:xy[0], y:xy[1]});
	    thisCtrl.lastMarkerFeature	= new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(pos.lon, pos.lat));
	    thisCtrl.lastMarkerFeature.attributes.type = type;

	    thisCtrl.pointLayer.addFeatures([thisCtrl.lastMarkerFeature]);

	    thisCtrl.lastMarkerFeature.popup = new OpenLayers.Popup("marker-popup",
		    pos,
		    new OpenLayers.Size(200,150),
		    $('#markerPopupContent').clone().css('display', '').html(),
		    false);

	    thisCtrl.lastPopup = thisCtrl.lastMarkerFeature.popup;
	    map.addPopup(thisCtrl.lastPopup, true);
	},

	addMarkersByPosition : function (xy) {
	    var thisCtrl = GeoAnnotator.MapPanelCtrl;
	    var map = thisCtrl.map;
	    var pos	= map.getLonLatFromPixel({x:xy[0], y:xy[1]});
	    thisCtrl.lastMarkerFeature	= new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(pos.lon, pos.lat));

	    var html = $('#observationsPopup').clone().css('display', '').html();
	    thisCtrl.lastPopup = new OpenLayers.Popup("MultiMarker-popup",
		    pos,
		    new OpenLayers.Size(200,250),
		    html,
		    false);

	    thisCtrl.lastMarkerFeature.popup = thisCtrl.lastPopup;
	    map.addPopup(thisCtrl.lastMarkerFeature.popup, true);
//	    thisCtrl.lastMarkerFeature.style = {externalGraphic: '../static/style/images/facilities.png'};
	    thisCtrl.lastMarkerFeature.attributes.type = 'multiple';

	    thisCtrl.pointLayer.addFeatures([thisCtrl.lastMarkerFeature]);

	    $(":checkbox[name='observations']").click(function () {
		var thisCheck = $(this);
		var divId     = "#" + thisCheck.val() + "Div";
		if (thisCheck.is(':checked')) {
		    $(divId).show();
		} else {
		    $(divId).hide();
		}
	    });

	},

	onFeatureAdded : function (feature){
	    var thisCtrl = GeoAnnotator.MapPanelCtrl;
	    if (feature.geometry instanceof OpenLayers.Geometry.Polygon) {
	    }
	    else if (feature.geometry instanceof OpenLayers.Geometry.LineString) {
		thisCtrl.currRoute = feature;
		// build route
		var route_info = {};
		route_info.shape = new OpenLayers.Format.WKT().write(feature);
		route_info.userId = GeoAnnotator.currUserId;
		route_info.forumId = GeoAnnotator.currForumId; 
		var projWords = thisCtrl.map.projection.getCode().split(":");
		route_info.srid = projWords[projWords.length - 1];
		Ext.Ajax.request({
		    url: 'route',
		    success: thisCtrl.onSubmitRouteSuccess,
		    failure: thisCtrl.onSubmitRouteFailure,
		    params: {'route_info': Ext.util.JSON.encode(route_info)} 
		});
		thisCtrl.selectFeatureControl.select(feature);
		thisCtrl.setNavigationMode();
	    }
	    else if (feature.geometry instanceof OpenLayers.Geometry.Point) {
		var map = thisCtrl.map;
		// create popup
		var position = feature.geometry.getBounds().getCenterLonLat();
		var size = new OpenLayers.Size(21,25);
		var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
		// select different icons for different markers
		// get the current pressed item in toolbar, maybe there's another method?
		var tbar = GeoAnnotator.MapPanelCtrl.containerPanel.getTopToolbar();
		var markerType = null;
		tbar.items.get('Problem-group').items.each(function(item) {
		    if (item.pressed) {
			markerType = item.id;
			feature.attributes.type = markerType; 
		    }
		});
		tbar.items.get('Facility-group').items.each(function(item) {
		    if (item.pressed) {
			markerType = item.id;
			feature.attributes.type = markerType; 
		    }
		});
		feature.layer.redraw();
		feature.popup = new OpenLayers.Popup("marker-popup",
			position,
			new OpenLayers.Size(200,150),
			$('#markerPopupContent').clone().css('display', '').html(),
			false);

		thisCtrl.lastPopup = feature.popup;
		thisCtrl.lastMarkerFeature = feature;

		map.addPopup(thisCtrl.lastPopup, true);
	    }
	},

	onCommentCanceled : function() {
	    var thisCtrl = GeoAnnotator.MapPanelCtrl;
	    if (thisCtrl.lastPopup) {
		thisCtrl.map.removePopup(thisCtrl.lastPopup);
	    }
	},

	onCommentEdited : function () {
	    var thisCtrl = GeoAnnotator.MapPanelCtrl;
	    var markerId = thisCtrl.lastMarkerFeature.attributes.id; 
	    Ext.Ajax.request({
		url: 'marker/' + markerId + '/update',
		success: thisCtrl.onSubmitMarkerSuccess,
		failure: thisCtrl.onSubmitMarkerFailure,
		params: {'updates': Ext.util.JSON.encode(updates)} // todo: params to be determined
	    });
	    // remove popup
	    if (thisCtrl.lastPopup) {
		thisCtrl.map.removePopup(thisCtrl.lastPopup);
	    }
	}, 

	onCommentPosted : function () {
	    // create instace of markannotaton {route, marktype, annotation}
	    // annotation {footprint, userId, forumId, shareLevel, timeCreated, contextMap}
	    // footprint {srid, shape}
	    var thisCtrl = GeoAnnotator.MapPanelCtrl;
	    var markannotations = [];

	    if (thisCtrl.currRoute == null) {
		alert ("please select/draw a route first!");
	    } else {
		if ($(":checkbox[name='observations']:checked").length > 1) {
		    // footprint
		    var footprint = {};
		    // var feature   = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(pos.lon, pos.lat), null, null);
		    var projWords = thisCtrl.map.projection.getCode().split(":");
		    footprint.srid = projWords[projWords.length - 1];
		    footprint.shape = new OpenLayers.Format.WKT().write(thisCtrl.lastMarkerFeature);
		    $(":checkbox[name='observations']:checked").each(function () {
			var thisCheck = $(this);
			// build annotation
			var markannotation = {};
			markannotation.annotation = {};

			// annotation
			var annotation = {};
			annotation.footprints = [];
			annotation.footprints.push(footprint);
			annotation.userId = GeoAnnotator.currUserId;
			annotation.forumId = GeoAnnotator.currForumId;
			annotation.shareLevel = 'everyone';
			annotation.timeCreated = new Date().toGMTString();
			var commentId = "textarea[name='" + thisCheck.val() + "Comment']";
			annotation.content	= $(commentId).val(); // get comment in the popup
			annotation.contextMap = ""; // not in this case
	    //	    annotation.contextMap = GeoAnnotator.ContributePanelCtrl.getContextMap();
	    //
			markannotation.annotation = annotation;
			markannotation.markertype = thisCheck.val();
			markannotation.routeId = thisCtrl.currRoute.attributes.id;
			markannotations.push(markannotation);
		    });
		} else {
		    // build annotation
		    var markannotation = {};
		    markannotation.annotation = {};

		    // footprint
		    var footprint = {};
		    // var feature   = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(pos.lon, pos.lat), null, null);
		    var projWords = thisCtrl.map.projection.getCode().split(":");
		    footprint.srid = projWords[projWords.length - 1];
		    footprint.shape = new OpenLayers.Format.WKT().write(thisCtrl.lastMarkerFeature);

		    // annotation
		    var annotation = {};
		    annotation.footprints = [];
		    annotation.footprints.push(footprint);
		    annotation.userId = GeoAnnotator.currUserId;
		    annotation.forumId = GeoAnnotator.currForumId;
		    annotation.shareLevel = 'everyone';
		    annotation.timeCreated = new Date().toGMTString();
		    annotation.content	= $("#markerComment").val(); // get comment in the popup
		    annotation.contextMap = ""; // not in this case
	//	    annotation.contextMap = GeoAnnotator.ContributePanelCtrl.getContextMap();
	//
		    markannotation.annotation = annotation;
		    markannotation.markertype = thisCtrl.lastMarkerFeature.attributes.type;
		    markannotation.routeId = thisCtrl.currRoute.attributes.id;

		    markannotations.push(markannotation);
		}

		Ext.Ajax.request({
		    url: 'marker',
		    success: thisCtrl.onSubmitMarkerSuccess,
		    failure: thisCtrl.onSubmitMarkerFailure,
		    params: {'markannotations': Ext.util.JSON.encode(markannotations)} // todo: params to be determined
		});
	    }
	    // remove popup
	    if (thisCtrl.lastPopup) {
		thisCtrl.map.removePopup(thisCtrl.lastPopup);
	    }

	},
	
	destroyPopup : function () {
	    var thisCtrl = GeoAnnotator.MapPanelCtrl;
	    // remove popup
	    if (thisCtrl.lastPopup) {
		thisCtrl.map.removePopup(thisCtrl.lastPopup);
	    }
	},

	onSubmitMarkerSuccess : function (xhr) {
	    var thisCtrl = GeoAnnotator.MapPanelCtrl;
	    var res = Ext.util.JSON.decode(xhr.responseText);
	    if (res.success) {
		thisCtrl.lastMarkerFeature.attributes.id = res.id;
		thisCtrl.lastMarkerFeature.attributes.annotationsId = res.annotationsId;
		thisCtrl.lastMarkerFeature.attributes.comment = res.comment;
		thisCtrl.lastMarkerFeature.attributes.route = res.routeId;
		for (var i = 0, len = thisCtrl.currRoute.attributes.markers.length; i < len; i++) {
		    if (thisCtrl.currRoute.attributes.markers[i].attributes.id == thisCtrl.lastMarkerFeature.attributes.id) {
			return;
		    }
		}
		thisCtrl.currRoute.attributes.markers.push(thisCtrl.lastMarkerFeature);
		thisCtrl.lastMarkerFeature = null;
	    }
	    else {
		alert(res.error);
	    }
	},

	onSubmitMarkerFailure : function (xhr) {
	    var err = Ext.util.JSON.decode(xhr.responseText);
	    alert (err);
	},

	onSubmitRouteSuccess : function (xhr) {
	    var thisCtrl = GeoAnnotator.MapPanelCtrl;

	    var routeInfo = Ext.util.JSON.decode(xhr.responseText);
	    if (routeInfo.id != '0') {
		thisCtrl.currRoute.attributes.id = routeInfo.id;
		thisCtrl.currRoute.attributes.owner = routeInfo.owner;
		thisCtrl.currRoute.attributes.visibility = routeInfo.visibility;
		thisCtrl.currRoute.attributes.markers = [];
		thisCtrl.routes.push(thisCtrl.currRoute);
		GeoAnnotator.AnnotationInfoPanelCtrl.displayQuestions(thisCtrl.currRoute);
	    }
	    else {
		alert ('Server error! Route not saved!');
	    }
	},

	onSubmitRouteFailure : function (xhr) {
	    var err = Ext.util.JSON.decode(xhr.responseText);
	    alert (err);
	},
					

	onClickRoute : function (feature) {
	    thisCtrl = GeoAnnotator.MapPanelCtrl;
	    thisCtrl.currRoute = feature;
	    
//	    routesId = [];
//	    routesId.push(feature.attributes.id);

	    // toggle markers
//	    for (var i = 0; i < feature.attributes.markers.length; i++) {
//		var marker = feature.attributes.markers[i];
//		if ((thisCtrl.myRouteLayer.selectedFeatures && feature == thisCtrl.myRouteLayer.selectedFeatures[0])
//			|| (thisCtrl.otherRouteLayer.selectedFeatures && feature == thisCtrl.otherRouteLayer.selectedFeatures[0])) { // if feature already selected 
//		    marker.display(false); 
//		} else {
//		    marker.display(true); 
//		}
//	    }

	    // todo: show summary of questionnaire
	    GeoAnnotator.AnnotationInfoPanelCtrl.displayRouteSummary(feature);
	},

	onLoadRoutePrivacySuccess : function (xhr) {
	    var routeInfo = Ext.util.JSON.decode(xhr.responseText);
	    	},

	onClickFeature : function (feature){
		if (feature){
			var thisCtrl = GeoAnnotator.MapPanelCtrl;
			// get the annotatios based on the footprint id
			if ('id' in feature.attributes && feature.attributes.id.indexOf('-') === 0) {
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

	onOverRoute : function (feature) {
	    var thisCtrl = GeoAnnotator.MapPanelCtrl;
	    // if the feature is not selected
	    if (OpenLayers.Util.indexOf(feature.layer.selectedFeatures, feature) == -1) { 
		feature.layer.drawFeature (feature, 'hover');
		thisCtrl.hoverFeature = feature; 
		// show related markers
		if (feature.attributes.markers) {
		    for (var i = 0; i < feature.attributes.markers.length; i++) {
			feature.attributes.markers[i].style = null;
		    }
		    thisCtrl.pointLayer.redraw();
		}
	    }
	},

	onOutRoute: function (feature) {
	    var thisCtrl = GeoAnnotator.MapPanelCtrl;
	    if (thisCtrl.contextMenu !== null) {
		    thisCtrl.contextMenu.hide();
	    }
	    // if the feature is not selected
	    if (OpenLayers.Util.indexOf(feature.layer.selectedFeatures, feature) == -1 ) { 
		thisCtrl.hoverFeature = null;
		feature.layer.drawFeature (feature, 'default');
		if (feature.attributes.markers) {
		    for (var i = 0; i < feature.attributes.markers.length; i++) {
			var marker = feature.attributes.markers[i];
			marker.style = {display: 'none'}; // hide if already visibile
		    }
		    thisCtrl.pointLayer.redraw();
		}
	    }
	},

	onSelectFeature: function (feature) {
	    var thisCtrl = GeoAnnotator.MapPanelCtrl;
	    if (feature.attributes.markers) {
		thisCtrl.currRoute = feature;
		thisCtrl.selectedFeature = feature;
//		var selectedFeatures = thisCtrl.myRouteLayer.selectedFeatures;
//		selectedFeatures.push(thisCtrl.otherRouteLayer.selectedFeatures);
//		selectedFeatures.push(thisCtrl.newRouteLayer.selectedFeatures);

		for (var i = 0; i < feature.attributes.markers.length; i++) {
		    feature.attributes.markers[i].style = null;
		}
		GeoAnnotator.MapPanelCtrl.pointLayer.redraw();
		GeoAnnotator.AnnotationInfoPanelCtrl.displayRouteSummary(feature);
	    }
	    else if (feature.attributes.type) { // indicating it is a marker
		$('#markerCommentReviewPopup').html('');
		$.get('comments/' + feature.attributes.id,
			{
			},
			function(res) {
			    if (res.success) {
				var comments = res.comments;
				for (var i=0; i < comments.length; i++) {
				    // create popup element for each comment
				    $('<hr>').prependTo('#markerCommentReviewPopup');
				    $('<br>').prependTo('#markerCommentReviewPopup');
				    $('<label></label>').text(comments[i].createAt).prependTo('#markerCommentReviewPopup');
				    $('<textarea></textarea>').attr('disabled', true).attr('id', comments[i].type+'MarkerCommentReview').text(comments[i].content).prependTo('#markerCommentReviewPopup');
				    $('<label></label>').text(' said: ').prependTo('#markerCommentReviewPopup');
				    $('<label></label>').css({'font-weight': 'bolder'}).text(comments[i].owner).prependTo('#markerCommentReviewPopup');
				    $('<br>').prependTo('#markerCommentReviewPopup');
				    $('<strong></strong>').text(comments[i].type).prependTo('#markerCommentReviewPopup');
				    $('<label>Observation: </label>').prependTo('#markerCommentReviewPopup');
				}
			    }
			    else {
				$('<p></p>').text(res.error).prependTo('#markerCommentReviewPopup');
			    }
			    $('#markerCommentReviewBtn').clone().css('display', '').appendTo('#markerCommentReviewPopup');
			    feature.popup = new OpenLayers.Popup("marker-popup",
						    feature.geometry.getBounds().getCenterLonLat(),
						    new OpenLayers.Size(200,150),
						    $('#markerCommentReviewPopup').clone().css('display', '').html(),
						    false
						);

			    thisCtrl.lastPopup = feature.popup;
			    thisCtrl.map.addPopup(thisCtrl.lastPopup, true);
			    thisCtrl.lastMarkerFeature = feature;
			}
		);

//		$('#markerCommentReview').text(feature.attributes.comment);
	    }
	},

	onUnselectFeature: function (feature) {
	    var thisCtrl = GeoAnnotator.MapPanelCtrl;
	    if (feature.attributes.markers) {
		GeoAnnotator.MapPanelCtrl.currRoute = null;
		thisCtrl.selectedFeature = null;
		for (var i = 0; i < feature.attributes.markers.length; i++) {
		    feature.attributes.markers[i].style = {display: 'none'};
		}
		GeoAnnotator.MapPanelCtrl.pointLayer.redraw();
		var html = "<div class='default-info'><p>Click on the route to see the detailed information</p>";
		html += "<button onclick='GeoAnnotator.MapPanelCtrl.setDrawMode(\"line\")'>Draw another route</button></div> "
		GeoAnnotator.AnnotationInfoPanelCtrl.annotationInfoDisplayPanel.body.update(html);
	    }
	    else if (feature.attributes.type) {
		if (thisCtrl.lastPopup) {
		    thisCtrl.map.removePopup(thisCtrl.lastPopup);
		    thisCtrl.lastMarkerFeature = null;
		}
	    }
	},

	onOverFeature : function(feature) {
	    var thisCtrl = GeoAnnotator.MapPanelCtrl;
	    thisCtrl.hoverFeature = feature; 
	    // if the feature is not selected
	    if (OpenLayers.Util.indexOf(feature.layer.selectedFeatures, feature) == -1 ) {
		feature.layer.drawFeature (feature, 'hover');
		// show related markers
		if (feature.attributes.markers) {
		    for (var i = 0; i < feature.attributes.markers.length; i++) {
			var marker = feature.attributes.markers[i];
			marker.style = null;
		    }
		    thisCtrl.pointLayer.redraw();
		}
	    }
	    
	},
	
	onOutFeature : function (feature) {
	    var thisCtrl = GeoAnnotator.MapPanelCtrl;
	    thisCtrl.hoverFeature = null;
	    if (thisCtrl.contextMenu !== null) {
		thisCtrl.contextMenu.hide();
	    }
	    // if the feature is not selected
	    if (OpenLayers.Util.indexOf(feature.layer.selectedFeatures, feature) == -1 ) {
		feature.layer.drawFeature (feature, 'default');
		if (feature.attributes.markers) {
		    for (var i = 0; i < feature.attributes.markers.length; i++) {
			var marker = feature.attributes.markers[i];
			marker.style = {display: 'none'}; // hide if already visibile
		    }
		    thisCtrl.pointLayer.redraw();
		}
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

GeoAnnotator.TimelinePanelCtrl = {
	containerPanel: null,
	timelineData : {},
	startDate : null,
	endDate : null,
	earliestDate : null,
	latestDate : null,
	totalCount : 0,
	mode : 'month',
	unit : 'day',
	timelinePanel : null,
	annotationListWindow : null,
	annotationListStore : null,
	register : function (containerPanel) {
		this.containerPanel = containerPanel;
	},
	
	init : function() {
		thisCtrl = GeoAnnotator.TimelinePanelCtrl;
		
		thisCtrl.timelineData = new Ext.data.ArrayStore({
			fields: ['date', 'count', 'label']
		});
		
		thisCtrl.timelinePanel = new Ext.Panel({
			//layout: 'fit',
        	tbar: [
			{
            	//text: 'Earliest',
				id: 'timeline-earliest-btn',
				iconCls: 'timeline-earliest-icon',
				//iconAlign: 'left', 
            	handler: thisCtrl.moveToEarliest
			},
			'-',
			{
            	//text: 'Previous',
				id : 'timeline-previous-btn',
				iconCls: 'timeline-previous-icon',
				//iconAlign: 'left', 
            	handler: thisCtrl.moveToPrev
			},
			'-',
			{
            	text: 'Day',
				id : 'timeline-day-btn',
				enableToggle: true,
				pressed: false, 
				toggleGroup: 'timeline-mode',
				handler: function(button, evt){
					thisCtrl = GeoAnnotator.TimelinePanelCtrl;
					thisCtrl.mode = 'day';
					thisCtrl.moveToNow();
					button.toggle(true);
				}
			},
			'-',
			{
            	text: 'Week',
				id : 'timeline-week-btn',
				enableToggle: true,
				pressed: false, 
				toggleGroup: 'timeline-mode',
				handler: function(button, evt){
					thisCtrl = GeoAnnotator.TimelinePanelCtrl;
					thisCtrl.mode = 'week';
					thisCtrl.moveToNow();
					button.toggle(true);
				}
			},
			'-',
			{
            	text: 'Month',
				id : 'timeline-month-btn',
				enableToggle: true,
				pressed: true, 
				toggleGroup: 'timeline-mode',
				handler: function(button, evt){
					thisCtrl = GeoAnnotator.TimelinePanelCtrl;
					thisCtrl.mode = 'month';
					thisCtrl.moveToNow();
					button.toggle(true);
				}
			},
			'-',
			{
            	text: 'Year',
				id : 'timeline-year-btn',
				enableToggle: true,
				pressed: false, 
				toggleGroup: 'timeline-mode',
				handler: function(button, evt){
					thisCtrl = GeoAnnotator.TimelinePanelCtrl;
					thisCtrl.mode = 'year';
					thisCtrl.moveToNow();
					button.toggle(true);
				}
			},
			'-',
			{
            	//text: 'Next',
				id : 'timeline-next-btn',
				iconCls: 'timeline-next-icon',
				//iconAlign: 'right', 
            	handler: thisCtrl.moveToNext
			},
			'-',
			{
            	//text: 'Latest',
				id : 'timeline-latest-btn',
				iconCls: 'timeline-latest-icon',
				//iconAlign: 'right', 
            	handler: thisCtrl.moveToLatest
			},
			'->',
			{
				text: 'Now',
				id : 'timeline-now-btn',
				iconCls: 'timeline-now-icon',
				handler : thisCtrl.moveToNow
			}
			],
        	items: {
            	xtype: 'columnchart',
            	store: thisCtrl.timelineData,
            	yField: 'count',
	    		url: '/static/lib/ext-3.2.1/resources/charts.swf',
            	xField: 'label',
            	xAxis: new Ext.chart.CategoryAxis({
                	title: 'Time'
            	}),
            	yAxis: new Ext.chart.NumericAxis({
                	title: 'Count'
            	}),
				tipRenderer : function(chart, record, index, series){
                	return record.data.count + ' annotations';
            	},
            	extraStyle: {
               		xAxis: {
                    	//labelRotation: -90
                	}
            	},
				listeners: {
					itemclick: thisCtrl.onTimelineItemClick
          		}
			}   
    	});
		thisCtrl.containerPanel.add(thisCtrl.timelinePanel);
		thisCtrl.containerPanel.doLayout();
		thisCtrl.containerPanel.on('collapse', function() {
			GeoAnnotator.MapPanelCtrl.map.updateSize();
			GeoAnnotator.ContainerTBCtrl.containerTB.get('timeline-btn').toggle(false);
		});
		thisCtrl.containerPanel.on('expand', function() {
			GeoAnnotator.MapPanelCtrl.map.updateSize();
			GeoAnnotator.ContainerTBCtrl.containerTB.get('timeline-btn').toggle(true);
		});
		thisCtrl.containerPanel.collapse(false);
	},
	
	loadTimelineData : function(timeline) {
		var thisCtrl = GeoAnnotator.TimelinePanelCtrl;
		var data = [];
		switch (thisCtrl.mode) {
		case 'year':
			data = thisCtrl.generateYearData(timeline);
			break;
		case 'month':
			data = thisCtrl.generateMonthData(timeline);
			break;
		case 'week':
			data = thisCtrl.generateWeekData(timeline);
			break;
		case 'day':
			data = thisCtrl.generateDayData(timeline);
			break;
		default:
			alert('not supported display mode!');
		}
		thisCtrl.timelineData.loadData(data);
	},
	
	generateYearData : function(timeline) {
		var thisCtrl = GeoAnnotator.TimelinePanelCtrl;
		var data = [];
		var m_names = new Array("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec");
		if (thisCtrl.startDate) {
			var cursorDate = new Date(thisCtrl.startDate.getFullYear(), thisCtrl.startDate.getMonth());
			for (var i=0; i < 12; i++) {
				cursorDate.setMonth(cursorDate.getMonth()+1);
				var month = cursorDate.getMonth();
				var year = cursorDate.getFullYear();
				var label = m_names[month] + ' ' + year;
				var dataitem = [cursorDate.toGMTString(), 0, label];
				for (var j=0; j < timeline.length; j++) {
					var timelineDate = new Date(timeline[j].month);
					if (cursorDate.toGMTString() === timelineDate.toGMTString()) {
						dataitem[1] = parseInt(timeline[j].count);
						break;
					}
				}
				data.push(dataitem);
			}
		}
		return data;
	},

	generateMonthData : function(timeline) {
		var thisCtrl = GeoAnnotator.TimelinePanelCtrl;
		var data = [];
		var m_names = new Array("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec");
		if (thisCtrl.startDate) {
			var cursorDate = new Date(thisCtrl.startDate.getFullYear(), thisCtrl.startDate.getMonth(), thisCtrl.startDate.getDate());
			for (var i=0; i < 30; i++) {
				cursorDate.setDate(cursorDate.getDate()+1);
				//alert('cursorDate:' + cursorDate);
				var month = cursorDate.getMonth();
				var day = cursorDate.getDate();
				var sup = "";
				if (day == 1 || day == 21 || day ==31){
				   sup = "st";
				}
				else if (day == 2 || day == 22){
				   sup = "nd";
				}
				else if (day == 3 || day == 23){
				   sup = "rd";
				}
				else{
				   sup = "th";
				}
				var label = "";
				if (day == 1) {
					label = m_names[month] + ' ' + day;
				}
				else {
					label = day;
				}
				//var label = (month+1) + '/' + day;// + sup; 
				var dataitem = [cursorDate.toGMTString(), 0, label];
				for (var j=0; j < timeline.length; j++) {
					var timelineDate = new Date(timeline[j].day);
					if (cursorDate.toGMTString() == timelineDate.toGMTString()) {
						dataitem[1] = parseInt(timeline[j].count);
						break;
					}
				}
				data.push(dataitem);
			}
		}
		return data;
	},
	
	generateWeekData : function(timeline) {
		var thisCtrl = GeoAnnotator.TimelinePanelCtrl;
		var data = [];
		var m_names = new Array("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec");
		if (thisCtrl.startDate) {
			var cursorDate = new Date(thisCtrl.startDate.getFullYear(), thisCtrl.startDate.getMonth(), thisCtrl.startDate.getDate());
			for (var i=0; i < 7; i++) {
				cursorDate.setDate(cursorDate.getDate()+1);
				var month = cursorDate.getMonth();
				var day = cursorDate.getDate();
				var sup = "";
				if (day == 1 || day == 21 || day ==31){
				   sup = "st";
				}
				else if (day == 2 || day == 22){
				   sup = "nd";
				}
				else if (day == 3 || day == 23){
				   sup = "rd";
				}
				else{
				   sup = "th";
				}
				var label = m_names[month] + ' ' + day + sup; 
				var dataitem = [cursorDate.toGMTString(), 0, label];
				for (var j=0; j < timeline.length; j++) {
					var timelineDate = new Date(timeline[j].day);
					if (cursorDate.toGMTString() === timelineDate.toGMTString()) {
						dataitem[1] = parseInt(timeline[j].count);
						break;
					}
				}
				data.push(dataitem);
			}
		}
		return data;
	},
	
	generateDayData : function(timeline) {
		var thisCtrl = GeoAnnotator.TimelinePanelCtrl;
		var data = [];
		if (thisCtrl.startDate) {
			var cursorDate = new Date(thisCtrl.startDate.getFullYear(), thisCtrl.startDate.getMonth(), thisCtrl.startDate.getDate(), thisCtrl.startDate.getHours());
			for (var i=0; i < 24; i++) {
				cursorDate.setHours(cursorDate.getHours()+1);
				var month = cursorDate.getMonth();
				var day = cursorDate.getDate();
				var hour = cursorDate.getHours();
				var day_sup = "";
				if (day == 1 || day == 21 || day ==31){
				   day_sup = "st";
				}
				else if (day == 2 || day == 22){
				   day_sup = "nd";
				}
				else if (day == 3 || day == 23){
				   day_sup = "rd";
				}
				else{
				   day_sup = "th";
				}
				var hour_sup = "";
				if (hour == 0) {
					hour = 12;
					hour_sup = "AM";
				}
				else if (hour > 0 && hour < 12) {
					hour_sup = "AM";
				}
				else if (hour == 12) {
					hour_sup = "PM";
				}
				else {
					hour = hour - 12;
					hour_sup = "PM";
				}
				var label = "";
				if (i == 0 || (hour == 12 && hour_sup == "AM")) {
					label = (month+1) + '/' + day + ' ' + hour + ' ' + hour_sup; 
				}
				else {
					label = hour + ' ' + hour_sup; 
				}
				//var label = (month+1) + '/' + day + ' ' + hour + ' ' + hour_sup; 
				var dataitem = [cursorDate.toGMTString(), 0, label];
				for (var j=0; j < timeline.length; j++) {
					var timelineDate = new Date(timeline[j].hour);
					if (cursorDate.toGMTString() === timelineDate.toGMTString()) {
						dataitem[1] = parseInt(timeline[j].count);
						break;
					}
				}
				data.push(dataitem);
			}
		}
		return data;
	},
	

	moveToEarliest : function() {
		var thisCtrl = GeoAnnotator.TimelinePanelCtrl;
		if (thisCtrl.earliestDate !== null) {
			thisCtrl.startDate = new Date(thisCtrl.earliestDate);
			thisCtrl.calcEndDate();	
			thisCtrl.update();
		}
		thisCtrl.update();		
	},
	
	moveToPrev : function() {
		var thisCtrl = GeoAnnotator.TimelinePanelCtrl;
		thisCtrl.endDate = new Date(thisCtrl.startDate);
		thisCtrl.calcStartDate();
		thisCtrl.update();		
	},
	
	moveToNext : function() {
		var thisCtrl = GeoAnnotator.TimelinePanelCtrl;
		thisCtrl.startDate = new Date(thisCtrl.endDate);
		thisCtrl.calcEndDate();
		thisCtrl.update();
	},
	
	moveToLatest : function() {
		var thisCtrl = GeoAnnotator.TimelinePanelCtrl;
		if (thisCtrl.latestDate !== null) {
			thisCtrl.endDate = new Date(thisCtrl.latestDate);
			thisCtrl.calcStartDate();
			thisCtrl.update();
		}
	},
	
	moveToNow : function() {
		var thisCtrl = GeoAnnotator.TimelinePanelCtrl;
		thisCtrl.endDate = new Date();
		thisCtrl.calcStartDate();	
		thisCtrl.update();
	},
	
	calcStartDate : function() {
		var thisCtrl = GeoAnnotator.TimelinePanelCtrl;
		if (thisCtrl.endDate !== null) {
			thisCtrl.startDate = new Date(thisCtrl.endDate);
			switch (thisCtrl.mode) {
			case 'year':
				thisCtrl.unit = 'month';
				thisCtrl.startDate.setFullYear(thisCtrl.endDate.getFullYear()-1);
				break;
			case 'month':
				thisCtrl.unit = 'day';
				thisCtrl.startDate.setMonth(thisCtrl.endDate.getMonth()-1);
				break;
			case 'week':
				thisCtrl.unit = 'day';
				thisCtrl.startDate.setDate(thisCtrl.endDate.getDate()-7);
				break;
			case 'day':
				thisCtrl.unit = 'hour';
				thisCtrl.startDate.setDate(thisCtrl.endDate.getDate()-1);
				break;
			default:
				alert('not supported display mode!');
			}
			
		}
	},

	calcEndDate : function() {
		var thisCtrl = GeoAnnotator.TimelinePanelCtrl;
		if (thisCtrl.startDate !== null) {
			thisCtrl.endDate = new Date(thisCtrl.startDate);
			switch (thisCtrl.mode) {
			case 'year':
				thisCtrl.unit = 'month';
				thisCtrl.endDate.setFullYear(thisCtrl.startDate.getFullYear()+1);
				//thisCtrl.endDate.setMonth(thisCtrl.startDate.getMonth()+1);
				break;
			case 'month':
				thisCtrl.unit = 'day';
				thisCtrl.endDate.setMonth(thisCtrl.startDate.getMonth()+1);
				//thisCtrl.endDate.setDate(thisCtrl.startDate.getDate()+1);
				break;
			case 'week':
				thisCtrl.unit = 'day';
				thisCtrl.endDate.setDate(thisCtrl.startDate.getDate()+7);
				break;
			case 'day':
				thisCtrl.unit = 'hour';
				thisCtrl.endDate.setDate(thisCtrl.startDate.getDate()+1);
				//thisCtrl.endDate.setHours(thisCtrl.startDate.getHours()+1);
				break;
			default:
				alert('not supported display mode!');
			}
			
		}
	},
	
	update : function() {
		var thisCtrl = GeoAnnotator.TimelinePanelCtrl;
		if (GeoAnnotator.currForumId === '0') {
			return;
		}
		if (thisCtrl.startDate === null || thisCtrl.endDate === null) {
			thisCtrl.moveToNow();
		}
		else {
//			Ext.Ajax.request({
//	   			url: GeoAnnotator.baseUrl + 'timeline/',
//	   			success: thisCtrl.onLoadTimelineInfoSuccess,
//	   			failure: function() {
//					alert('failed to load timeline info!');
//				},
//	   			params: {'userId':GeoAnnotator.currUserId, 'forumId': GeoAnnotator.currForumId, 'unit': thisCtrl.unit, 'startDate': thisCtrl.startDate.toGMTString(), 'endDate': thisCtrl.endDate.toGMTString()}
//			});
		}		
	},
	
	onLoadTimelineInfoSuccess : function(xhr) {
		var thisCtrl = GeoAnnotator.TimelinePanelCtrl;
		var timelineInfo = Ext.util.JSON.decode(xhr.responseText);
		// load the meta data
		if (timelineInfo.earliestDate) {
			thisCtrl.earliestDate = new Date(timelineInfo.earliestDate);
		}
		if (timelineInfo.latestDate) {
			thisCtrl.latestDate = new Date(timelineInfo.latestDate);
		}
		if (timelineInfo.totalCount) {
			thisCtrl.totalCount = parseInt(timelineInfo.totalCount);
		}
		// load the timeline data
		if (timelineInfo.timeline) {
			thisCtrl.loadTimelineData(timelineInfo.timeline);
		}
		// set the button status
		var tbar = thisCtrl.timelinePanel.getTopToolbar();
		if (thisCtrl.startDate && thisCtrl.earliestDate && thisCtrl.startDate > thisCtrl.earliestDate) {
			tbar.items.get('timeline-earliest-btn').enable();
			tbar.items.get('timeline-previous-btn').enable();
		}
		else {
			tbar.items.get('timeline-earliest-btn').disable();
			tbar.items.get('timeline-previous-btn').disable();
		}
		if (thisCtrl.endDate && thisCtrl.latestDate && thisCtrl.endDate < thisCtrl.latestDate) {
			tbar.items.get('timeline-latest-btn').enable();
			tbar.items.get('timeline-next-btn').enable();
		}
		else {
			tbar.items.get('timeline-latest-btn').disable();
			tbar.items.get('timeline-next-btn').disable();
		}
	},
	
	showAnnotationListWindow : function () {
		var thisCtrl = GeoAnnotator.TimelinePanelCtrl;
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
	            	url: GeoAnnotator.baseUrl + 'Annotations/'
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
	
	onAnnotationListItemClick : function (dataView, index, node, e) {
		// change the states
		var id = dataView.getRecord(node).get('id');
		var type = dataView.getRecord(node).get('type');
		
		GeoAnnotator.currAnnotationId = id;
		GeoAnnotator.AnnotationInfoPanelCtrl.update();		
		//GeoAnnotator.MapPanelCtrl.update();
	},
	
	onTimelineItemClick : function(o) {
		// create the annotation list window if not open
		var thisCtrl = GeoAnnotator.TimelinePanelCtrl;				
		thisCtrl.showAnnotationListWindow();
        var record = thisCtrl.timelineData.getAt(o.index);
		var start_date = new Date(record.get('date'));
		var end_date = new Date(start_date);
		
		if (thisCtrl.unit === 'day') {
			end_date.setDate(start_date.getDate()+1);
		}
        else if (thisCtrl.unit === 'month') {
			end_date.setMonth(start_date.getMonth()+1);
		}
		else if (thisCtrl.unit === 'hour') {
			end_date.setHours(start_date.getHours()+1);
		}

		thisCtrl.annotationListStore.removeAll();
		thisCtrl.annotationListStore.baseParams = {userId: GeoAnnotator.currUserId, forumId: GeoAnnotator.currForumId, startDate: start_date.toGMTString(), endDate: end_date.toGMTString()};
		thisCtrl.annotationListStore.load({params:{start:0, limit:10}});
		
	}
}

GeoAnnotator.AnnotationInfoPanelCtrl = {
	// containerPanel
	containerPanel: null,
	annotationInfoDisplayPanel : null,
	referenceSpaceTreePanel : null,
	annotationInfoWrapper : null,
	spaceTree : null,
	contextMenu : null,
	// quick comment window
	//commentWindow : null,
	referenceSpaceTreeWindow : null,
	spaceTreeContainer : 'reference-spaceTree',
	threadOrientation : 'left',
	currAnnotationInfo : {},
	// spaceTree styles
	node_height : 30,
	node_width : 100,
	min_spacing : 10.0,	
	currentNodeStyle : {
		"default" : {
			fill: "#0F4BFF", 
			stroke: "#003DF5", 
			"fill-opacity": 0.6, 
			"stroke-width": 2
		},
		"hover" : {
			fill: "#0F4BFF", 
			stroke: "#003DF5", 
			"fill-opacity": 0.8, 
			"stroke-width": 3
		},
		"text" : {
			stroke:"#fff",
			fill: "#fff"
		},
		"blanket" : {stroke: "none", fill: "#fff", "opacity": 0.0}
	},
		
	parentNodeStyle : {
		"default" : {
			fill: "#0F4BFF", 
			stroke: "#003DF5", 
			"fill-opacity": 0.6, 
			"stroke-width": 2
		},
		"hover" : {
			fill: "#0F4BFF", 
			stroke: "#003DF5", 
			"fill-opacity": 0.8, 
			"stroke-width": 3
		},
		"text" : {
			stroke:"#fff",
			fill: "#fff"
		},
		"blanket" : {stroke: "none", fill: "#fff", "opacity": 0.0}
	},

	childNodeStyle : {
		"default" : {
			fill: "#0F4BFF", 
			stroke: "#003DF5", 
			"fill-opacity": 0.6, 
			"stroke-width": 2
		},
		"hover" : {
			fill: "#0F4BFF", 
			stroke: "#003DF5", 
			"fill-opacity": 0.8, 
			"stroke-width": 3
		},
		"text" : {
			stroke:"#fff",
			fill: "#fff"
		},
		"blanket" : {stroke: "none", fill: "#fff", "opacity": 0.0}
	},
	
	register : function (containerPanel) {
		this.containerPanel = containerPanel;
	},
	
	init : function () {
		var thisCtrl = GeoAnnotator.AnnotationInfoPanelCtrl;
		thisCtrl.currAnnotationInfo = {};
		commentWindow = null;
		thisCtrl.spaceTreeContainer = 'reference-spaceTree';
		thisCtrl.threadOrientation = 'left';
		if (thisCtrl.containerPanel.items) {
			thisCtrl.containerPanel.removeAll(true);
		}
		
		var html = "<div class='default-info'> Some instructions here</div>";
		
		// The annotation information panels
		thisCtrl.annotationInfoDisplayPanel = new Ext.Panel({
			id: 'annotationInfo-display-panel',
			//title: 'General Info',
			bodyStyle: 'padding:0px; border: 0px',
			//autoWidth: true,
			html: html,
			region:'center',
			//height: 150,
			//autoHeight: true,
			autoScroll: true,
		});	
				
		// 2. add the toolbar
		var tbar = new Ext.Toolbar({
			id : 'annotation-info-tbar',
			 hidden : true, 
            	items: [
				/*{
					id: 'annotation-rpl-btn',
					iconCls: 'annotation-rpl-btn',
					iconAlign: 'top',
					handler: thisCtrl.onCommentClick,
					text: 'Comment',
					tooltip: {title:'Comment', text: 'Make a quick comment on the current annotation.'}
				},
				'-',
*/				{
					id: 'annotation-bkm-btn',
					iconCls: 'annotation-bkm-btn',
					iconAlign: 'top',
					handler: thisCtrl.onBookmarkClick,
					text: 'Bookmark',
					tooltip: {title:'Bookmark It', text: 'Save the current annotation for further reference.'}
				},
				'-',
				{
					id: 'reference-display-btn',
            		text:'Threads',
            		tooltip: {title:'Threads',text:'Show issues/annotaions as references or follow-ups of the current annotation.'},
            		iconCls: (thisCtrl.threadOrientation == 'right'? 'reference-display-backward' : 'reference-display-forward'),
					iconAlign: 'top',
					handler: thisCtrl.onThreadClick
				},
				'-',
				{
					id: 'annotation-edit-btn',
            		text:'Edit',
            		tooltip: {title:'Edit',text:'Modify the current annotation.'},
            		iconCls: 'annotation-edit-icon',
					iconAlign: 'top',
					disabled: true,
					handler: thisCtrl.onEditClick
				},
				'-',
				{
					id: 'annotation-delete-btn',
            		text:'Delete',
            		tooltip: {title:'Delete',text:'Delete the current annotation.'},
            		iconCls: 'annotation-delete-icon',
					iconAlign: 'top',
					disabled: true,
					handler: thisCtrl.onDeleteClick
				}
				]
        });
		
		thisCtrl.annotationInfoWrapper = new Ext.Panel({
			id: 'annotationInfo-wrapper-panel',
			bodyStyle: 'padding:0px; border: 0px',
			//autoWidth: true,
			//autoHeight: true,
			layout: 'border',
			tbar: tbar,
			//anchor: '100%',
			//autoScroll: true,
			items: [thisCtrl.annotationInfoDisplayPanel]//, thisCtrl.referenceSpaceTreePanel]
		})
		
		
		thisCtrl.containerPanel.add(thisCtrl.annotationInfoWrapper);
		
		thisCtrl.containerPanel.getEl().on('contextmenu', function(evt, div) {
			var thisCtrl = GeoAnnotator.AnnotationInfoPanelCtrl; 
			if(!thisCtrl.contextMenu){ // create context menu on first right click
            	thisCtrl.contextMenu = new Ext.menu.Menu({
                	id:'annotation-panel-ctx',
                	items: []
            	});
        	}
			thisCtrl.contextMenu.removeAll();
			if (thisCtrl.currAnnotationInfo && thisCtrl.currAnnotationInfo.id) {
				var editingAnnotationId = GeoAnnotator.ContributePanelCtrl.contributeFormPanel.getForm().findField('newAnnotationId').getValue();

				if (editingAnnotationId && thisCtrl.currAnnotationInfo.id != editingAnnotationId 
					&& GeoAnnotator.ContributePanelCtrl.containerPanel.collapsed === false) {
					thisCtrl.contextMenu.add({
						id: 'annotation-ref-ctx',
						iconCls: 'annotation-ref-btn',
						handler: thisCtrl.addAnnotationToReference,
						text: 'Add to Reference'
					});
				}
				if (GeoAnnotator.ContributePanelCtrl.containerPanel.collapsed === true) {
					thisCtrl.contextMenu.add({
						id: 'annotation-rpl-ctx',
						iconCls: 'annotation-rpl-btn',
						handler: thisCtrl.onCommentClick,
						text: 'Quick Reply'
					});
				}
				thisCtrl.contextMenu.add({
					id: 'annotation-bkm-ctx',
					iconCls: 'annotation-bkm-btn',
					handler: thisCtrl.onBookmarkClick,
					text: 'Bookmark It'
				});
				thisCtrl.contextMenu.add({
					id: 'reference-display-ctx',
            		text:'Threads',
            		iconCls: 'reference-display-icon',
					handler: thisCtrl.onThreadClick
				});
				if (thisCtrl.currAnnotationInfo.userId == GeoAnnotator.currUserId 
			&& parseInt(thisCtrl.currAnnotationInfo.replies) <= 0) {
					thisCtrl.contextMenu.add({
						id: 'annotation-edit-ctx',
	            		text:'Edit',
	            		iconCls: 'annotation-edit-icon',
						handler: thisCtrl.onEditClick
					});
					thisCtrl.contextMenu.add({
						id: 'annotation-delete-ctx',
	            		text:'Delete',
	            		iconCls: 'annotation-delete-icon',
						handler: thisCtrl.onDeleteClick
					});
				}
				thisCtrl.contextMenu.showAt(evt.getXY());
				evt.preventDefault();
			}
			
		});
		thisCtrl.containerPanel.doLayout();
		/*
		if (thisCtrl.containerPanel.body != null){
			var html = '<div class="default-info">Here will show the details when you choose an annotation.</div>';	
			thisCtrl.containerPanel.body.update(html);
		}*/
	},
	
	update : function () {
		var thisCtrl = GeoAnnotator.AnnotationInfoPanelCtrl;
		var html = '<div><p class="default-info">Loading Annotation Information...</p></div>';
		//thisCtrl.containerPanel.body.update(html);
		thisCtrl.annotationInfoDisplayPanel.body.update(html);
		
		// request the annotation information
		Ext.Ajax.request({
   			url: GeoAnnotator.baseUrl + 'annotation/',
   			success: thisCtrl.onLoadAnnotationInfoSuccess,
   			failure: thisCtrl.onLoadAnnotationInfoFailure,
   			params: {'annotationId':GeoAnnotator.currAnnotationId, 'userId':GeoAnnotator.currUserId, 'forumId': GeoAnnotator.currForumId}
		});
	},
	
	updateAnnotationInfoDisplayPanel : function(){
		var thisCtrl = GeoAnnotator.AnnotationInfoPanelCtrl;
		var html = '';
		html +='<div id="annotationInfoHeader">On ' + thisCtrl.currAnnotationInfo.timeCreated + ', <b>' + thisCtrl.currAnnotationInfo.userName + '</b> says:</div>';		
		var new_content = thisCtrl.parseAnnotationContent(thisCtrl.currAnnotationInfo.content);

		html += '<div id="annotationInfoContent">' + new_content + '</div>';
		thisCtrl.annotationInfoDisplayPanel.body.update(html);
		ref_links = Ext.query('.ref-link');
		for (var i=0; i < ref_links.length; i++) {
			var ele = Ext.get(ref_links[i]);
			if (ele.id.indexOf('ref-fp') === 0) {
				ele.on('click', function(evt, target) {
					var thisCtrl = GeoAnnotator.AnnotationInfoPanelCtrl;
					var featureId = target.id.substring(6);
					for (var i=0; i < thisCtrl.currAnnotationInfo.footprints.length; i++) {
						var footprint = thisCtrl.currAnnotationInfo.footprints[i];
						if (footprint.id == featureId) {
							
							GeoAnnotator.currFootprintId = footprint.id;
							GeoAnnotator.MapPanelCtrl.moveToFeature(featureId);
							
							return;
						};
					};
				});
			}
			else if (ele.id.indexOf('ref-an') === 0) {
				var annotationId = ele.id.substring(6);
				thisCtrl.addAnnotationTip(annotationId, ele);
				ele.on('click', function(evt, target) {
					var annotationId = target.id.substring(6);
					GeoAnnotator.AnnotationInfoPanelCtrl.loadAnnotationInfo(annotationId);
				});
			}
		};
	},
	
	loadAnnotationInfo: function(annotationId) {
		var thisCtrl = GeoAnnotator.AnnotationInfoPanelCtrl;
		// request the annotation information
		Ext.Ajax.request({
   			url: GeoAnnotator.baseUrl + 'annotation/',
   			success: function(xhr, options) {
				var annotationInfo = Ext.util.JSON.decode(xhr.responseText);
				if (annotationInfo != null) {
					GeoAnnotator.currAnnotationId = annotationInfo.id;
					GeoAnnotator.AnnotationInfoPanelCtrl.update();		
					//GeoAnnotator.MapPanelCtrl.update();
				}
			},
   			failure: function() {
				alert('failed to load annotation info!');
			},
   			params: {'annotationId':annotationId, 'userId':GeoAnnotator.currUserId, 'forumId': GeoAnnotator.currForumId},
		});
	},
	
	addAnnotationTip : function(annotationId, target) {
		var thisCtrl = GeoAnnotator.AnnotationInfoPanelCtrl;
				// request the annotation information
		Ext.Ajax.request({
   			url: GeoAnnotator.baseUrl + 'annotation/',
   			success: function(xhr, options) {
				var thisCtrl = GeoAnnotator.AnnotationInfoPanelCtrl;
				var annotationInfo = Ext.util.JSON.decode(xhr.responseText);
				if (annotationInfo != null) {
					new Ext.ToolTip({
						//closable: true,
						//autoHide: false,
						width: 200,
        				target: options.target,
        				html: '<i>'+annotationInfo.userName + '</i> says: <br>' + annotationInfo.excerpt
    				});
					
					//alert(annotationInfo.content);
				}
			},
   			failure: function() {
				alert('failed to load annotation info!');
			},
   			params: {'annotationId':annotationId, 'userId':GeoAnnotator.currUserId, 'forumId': GeoAnnotator.currForumId},
			target: target
		});

	},
	
	parseAnnotationContent : function(content) {
		var regex = /\[\[[a-z,0-9,|,_,\s]+\]\]/gi;
		var match = null;
		if(regex.test(content)) {
  			var matches = content.match(regex);
			for (var i=0; i < matches.length; i++) {
				match = matches[i];
				var extracted = match.substring(2, match.length-2);
				var name = extracted.split('|')[0];
				var id = extracted.split('|')[1];
				var new_content = '<a href="#" class="ref-link" id="ref-' + id + '">' + name + '</a>';
				content = content.replace(match, new_content);
			};
		}
		return content; 
	},
	
	updateReferenceSpaceTreePanel : function() {
		var thisCtrl = GeoAnnotator.AnnotationInfoPanelCtrl;
		if (thisCtrl.spaceTree) {
			thisCtrl.spaceTree.clear();
		}
		var html = '<div id="' + thisCtrl.spaceTreeContainer + '"></div>';
		if (thisCtrl.referenceSpaceTreePanel.body) {
			thisCtrl.referenceSpaceTreePanel.body.update(html);	
		}
	},
	
	buildReferenceSpaceTree : function (){
		var thisCtrl = GeoAnnotator.AnnotationInfoPanelCtrl;
		var w = thisCtrl.referenceSpaceTreePanel.getInnerWidth();
		var h = thisCtrl.referenceSpaceTreePanel.getInnerHeight();
	 	
		thisCtrl.spaceTree = Raphael(thisCtrl.spaceTreeContainer, w, h);
		
		// request the annotation information
		Ext.Ajax.request({
   			url: GeoAnnotator.baseUrl + 'threads/',
   			success: thisCtrl.onLoadThreadsInfoSuccess,
   			failure: function() {
				alert('failed to load annotation info!');
			},
   			params: {'annotationId':thisCtrl.currAnnotationInfo.id, 'userId':GeoAnnotator.currUserId, 'forumId': GeoAnnotator.currForumId},
		});
	},
	
	onLoadThreadsInfoSuccess : function(xhr) {
		var threadsInfo = Ext.util.JSON.decode(xhr.responseText);
		var thisCtrl = GeoAnnotator.AnnotationInfoPanelCtrl;
		var w = thisCtrl.referenceSpaceTreePanel.getInnerWidth();
		var h = thisCtrl.referenceSpaceTreePanel.getInnerHeight();
	 	if (thisCtrl.spaceTree) {
			thisCtrl.spaceTree.clear();
		}
		else {
			thisCtrl.spaceTree = Raphael(thisCtrl.spaceTreeContainer, w, h);
		}
		var height = thisCtrl.node_height;
		var width = thisCtrl.node_width;
		var min_spacing = thisCtrl.min_spacing;
		var spacing, offset_x, offset_y;
		
		// draw current node
		var current_node = thisCtrl.drawThreadNode(threadsInfo, w * 0.5, h * 0.5, width, height, thisCtrl.currentNodeStyle);
		// draw parents
		if (threadsInfo.parents.length > 0) {
			spacing = (1.0 * h - threadsInfo.parents.length * height) / (threadsInfo.parents.length + 1);
			if (spacing < min_spacing) {
				spacing = min_spacing;
			}
			offset_x = w * 0.2;
			offset_y = 0.5 * h - 0.5 * (height + spacing) * (threadsInfo.parents.length - 1);		
			var parent_node;
			for (var i=0; i < threadsInfo.parents.length; i++) {
				parent_node = thisCtrl.drawThreadNode(threadsInfo.parents[i], offset_x, offset_y, width, height, thisCtrl.parentNodeStyle);
				thisCtrl.drawThreadLink(parent_node, current_node);
				offset_y = offset_y + spacing + height;
			}
		}
		
		// draw children
		if (threadsInfo.children.length) {
			spacing = (1.0 * h - threadsInfo.children.length * height) / (threadsInfo.children.length + 1);
			if (spacing < min_spacing) {
				spacing = min_spacing;
			}
			offset_x = w * 0.8;
			offset_y = 0.5 * h - 0.5 * (height + spacing) * (threadsInfo.children.length - 1);		
			var child_node;
			for (var i=0; i < threadsInfo.children.length; i++) {
				child_node = thisCtrl.drawThreadNode(threadsInfo.children[i], offset_x, offset_y, width, height, thisCtrl.childNodeStyle);
				thisCtrl.drawThreadLink(current_node, child_node);
				offset_y = offset_y + spacing + height;
			}
		}
	},
	
	drawThreadNode : function(threadNodeInfo, x, y, width, height, style) {
		var thisCtrl = GeoAnnotator.AnnotationInfoPanelCtrl;
		var top = y - 0.5 * height;
		var left = x - 0.5 * width;
		var thread_node = {}
		var box = thisCtrl.spaceTree.rect(left, top, width, height).attr(style["default"]);
		var label = thisCtrl.spaceTree.text(x, y, threadNodeInfo.userName + ":\n" + threadNodeInfo.excerpt.substring(0, 20)).attr(style["text"]);
		var blanket = thisCtrl.spaceTree.rect(left, top, width, height).attr(style["blanket"]);
		thread_node.id = threadNodeInfo.id;
		thread_node.box = box;
		thread_node.label = label;
		thread_node.blanket = blanket;
		
		box.thread_node = thread_node;
		label.thread_node = thread_node;
		blanket.thread_node = thread_node;
		blanket.hover(
			function (event) {
    			this.thread_node.box.attr(style["hover"]);
			}, 
			function (event) {
    			this.thread_node.box.attr(style["default"]);
			}
		);
		blanket.click(
			function (event) {
				var thisCtrl = GeoAnnotator.AnnotationInfoPanelCtrl;
				thisCtrl.loadAnnotationInfo(this.thread_node.id);
			}
		);
		return thread_node;
	},
	
	drawThreadLink : function(from_node, to_node) {
		var thisCtrl = GeoAnnotator.AnnotationInfoPanelCtrl;
		var from_x = from_node.blanket.getBBox().x + from_node.blanket.getBBox().width;
		var from_y = Math.round(from_node.blanket.getBBox().y + from_node.blanket.getBBox().height * 0.5);
		var to_x = to_node.blanket.getBBox().x;
		var to_y = Math.round(to_node.blanket.getBBox().y + to_node.blanket.getBBox().height * 0.5);
		var mid_x = (from_x + to_x) * 0.5;
		var pathString = "M" + from_x + "," + from_y + "H" + mid_x + " V" + to_y + "H" + to_x + "l-5,5 M" + to_x + "," + to_y + "l-5,-5";
		
		thisCtrl.spaceTree.path(pathString);
	},
	
	updatePanelContent: function(){
		var thisCtrl = GeoAnnotator.AnnotationInfoPanelCtrl;
		// 0. clear current panel content
		if (thisCtrl.containerPanel.body != null){
			//thisCtrl.containerPanel.body.update("");
		}
		
		// 1. the annotation info display panel
		thisCtrl.updateAnnotationInfoDisplayPanel();
		
		var tbar = thisCtrl.annotationInfoWrapper.getTopToolbar();
		if (thisCtrl.currAnnotationInfo.userId == GeoAnnotator.currUserId 
			&& parseInt(thisCtrl.currAnnotationInfo.replies) <= 0) {
			tbar.items.get('annotation-edit-btn').enable();
			tbar.items.get('annotation-delete-btn').enable();		
		}
		else {
			tbar.items.get('annotation-edit-btn').disable();
			tbar.items.get('annotation-delete-btn').disable();		
		}
		tbar.show();
		
		if (thisCtrl.referenceSpaceTreeWindow && thisCtrl.referenceSpaceTreeWindow.hidden == false) {
			thisCtrl.buildReferenceSpaceTree();
		};

	},
	
	switchThreadOrientation : function (m, pressed){
		var thisCtrl = GeoAnnotator.AnnotationInfoPanelCtrl;
        if(!m){ // cycle if not a menu item click
        	var referenceDisplayMenu = Ext.menu.MenuMgr.get('reference-display-menu');
            referenceDisplayMenu.render();
            var items = referenceDisplayMenu.items.items;
            var f = items[0], b = items[1];
            if(f.checked){
                b.setChecked(true);
            }else if(b.checked){
                f.setChecked(true);
            }
            return;
        }
        if(pressed){
			var btn = thisCtrl.annotationInfoWrapper.getTopToolbar().items.get('reference-display-btn');
            switch(m.text){
                case 'References':
					btn.setIconClass('reference-display-backward');
					thisCtrl.threadOrientation = 'right';
                    break;
                case 'Follow-ups':
                    btn.setIconClass('reference-display-forward');
					thisCtrl.threadOrientation = 'left';
                    break;
            }
			thisCtrl.update();
        }
    },
	
	onLoadAnnotationInfoSuccess : function (xhr) {
		var thisCtrl = GeoAnnotator.AnnotationInfoPanelCtrl;
		thisCtrl.currAnnotationInfo = Ext.util.JSON.decode(xhr.responseText);
		if (thisCtrl.currAnnotationInfo != null) {
			// update panel
			thisCtrl.updatePanelContent();	
			
			// add to history
			var item = {};
			item.id = thisCtrl.currAnnotationInfo.id;
			item.type = thisCtrl.currAnnotationInfo.type;
			item.userName = thisCtrl.currAnnotationInfo.userName;
			item.timeCreated = thisCtrl.currAnnotationInfo.timeCreated;
			item.excerpt = thisCtrl.currAnnotationInfo.excerpt;
			GeoAnnotator.AnnotationHistoryWindowCtrl.add(item);
			
			GeoAnnotator.currFootprintId = '0';				
			if (thisCtrl.currAnnotationInfo.forumId != GeoAnnotator.currForumId) {
				GeoAnnotator.currForumId = thisCtrl.currAnnotationInfo.forumId;
				var idx = GeoAnnotator.ContainerTBCtrl.forumList.getStore().find('id', GeoAnnotator.currForumId);
				if (idx >= 0) {
					var record = GeoAnnotator.ContainerTBCtrl.forumList.getStore().getAt(idx);
					GeoAnnotator.ContainerTBCtrl.forumList.setValue(record.get('name'));
					GeoAnnotator.ContainerTBCtrl.forumList.fireEvent('select', GeoAnnotator.ContainerTBCtrl.forumList, record, idx);
				}
			}
			else {
				GeoAnnotator.MapPanelCtrl.update();
			}
		}
	},
	
	onLoadAnnotationInfoFailure : function () {
		// do nothing
		alert("Failed to load annotation information!");
	},
	
	onSpaceTreeNodeClick : function (id) {
		var thisCtrl = GeoAnnotator.AnnotationInfoPanelCtrl;
		// change status
		// request the annotation information
		Ext.Ajax.request({
   			url: GeoAnnotator.baseUrl + 'Annotation/',
   			success: thisCtrl.onLoadSTAnnotationInfoSuccess,
   			failure: thisCtrl.onLoadSTAnnotationInfoFailure,
   			params: {'annotationId':id, 'userId':GeoAnnotator.currUserId, 'forumId': GeoAnnotator.currForumId}
		});
	},
	
	onLoadSTAnnotationInfoSuccess : function (xhr) {
		var thisCtrl = GeoAnnotator.AnnotationInfoPanelCtrl;
		thisCtrl.currAnnotationInfo = Ext.util.JSON.decode(xhr.responseText);
		if (thisCtrl.currAnnotationInfo != null) {
			// change the states
			GeoAnnotator.currAnnotationId = thisCtrl.currAnnotationInfo.id;			
			GeoAnnotator.currFootprintId = '0';
			
			// update controls	
			if (thisCtrl.currAnnotationInfo.forumId != GeoAnnotator.currForumId) {
				GeoAnnotator.currForumId = thisCtrl.currAnnotationInfo.forumId;
				var idx = GeoAnnotator.ContainerTBCtrl.forumList.getStore().find('id', GeoAnnotator.currForumId);
				if (idx >= 0) {
					var record = GeoAnnotator.ContainerTBCtrl.forumList.getStore().getAt(idx);
					GeoAnnotator.ContainerTBCtrl.forumList.setValue(record.get('name'));
					GeoAnnotator.ContainerTBCtrl.forumList.fireEvent('select', GeoAnnotator.ContainerTBCtrl.forumList, record, idx);
				}
			}
			else {
				GeoAnnotator.MapPanelCtrl.update();
			}
			
			// update the display panel
			thisCtrl.updatePanelContent();
			//thisCtrl.updateAnnotationInfoDisplayPanel();
			//var html = '<div id="annotationInfoContent">' + thisCtrl.currAnnotationInfo.content + '</div>';
			//thisCtrl.annotationInfoDisplayPanel.body.update(html);	
			
			// add to history
			var item = {};
			item.id = thisCtrl.currAnnotationInfo.id;
			item.type = thisCtrl.currAnnotationInfo.type;
			item.userName = thisCtrl.currAnnotationInfo.userName;
			item.timeCreated = thisCtrl.currAnnotationInfo.timeCreated;
			item.excerpt = thisCtrl.currAnnotationInfo.excerpt;
			GeoAnnotator.AnnotationHistoryWindowCtrl.add(item);
		}
	},
	
	onLoadSTAnnotationInfoFailure : function () {
		// do nothing
		alert("Failed to load annotation information!");
	},
	
	onCommentClick : function() {
		var thisCtrl = GeoAnnotator.AnnotationInfoPanelCtrl;
		var toolbox_group = GeoAnnotator.MapPanelCtrl.containerPanel.getTopToolbar().items.get('toolbox-group');
		if (toolbox_group) {
			toolbox_group.items.get('contribute-btn').toggle(true);
		}
		thisCtrl.addAnnotationToReference();
		GeoAnnotator.ContributePanelCtrl.contributeFormPanel.get('newAnnotationContent').focus();
	},
	
	onBookmarkClick : function() {
		GeoAnnotator.AnnotationBookmarkWindowCtrl.add(GeoAnnotator.AnnotationInfoPanelCtrl.currAnnotationInfo);
	},
	
	onThreadClick: function(){
		var thisCtrl = GeoAnnotator.AnnotationInfoPanelCtrl;
		if (thisCtrl.referenceSpaceTreeWindow === null) {
			thisCtrl.referenceSpaceTreePanel = new Ext.Panel({
				id: 'reference-spaceTree-panel',
    			//height:300,
				bodyStyle: 'padding:0px;border-left:none;border-right:none;',
				html : '<div id="' + thisCtrl.spaceTreeContainer + '"></div>'	
			});

			thisCtrl.referenceSpaceTreeWindow = new Ext.Window({
  					layout      : 'fit',
         				width       : 600,
         				height      : 480,
         				closeAction :'hide',
         				plain       : true,
				modal		: false,
				items : [thisCtrl.referenceSpaceTreePanel]
 					});
		}
		else {
			thisCtrl.updateReferenceSpaceTreePanel();
		}
		thisCtrl.referenceSpaceTreeWindow.show();
		thisCtrl.buildReferenceSpaceTree();
	},
	
	onEditClick: function() {
		GeoAnnotator.ManageWindowCtrl.onAnnotationEditClick();
	},

	onDeleteClick: function() {
		GeoAnnotator.ManageWindowCtrl.onAnnotationDeleteClick();
	}, 
	
	addAnnotationToReference: function(){
		var thisCtrl = GeoAnnotator.AnnotationInfoPanelCtrl;
		if (thisCtrl.currAnnotationInfo && thisCtrl.currAnnotationInfo.id) {
			var name = '[AN' + thisCtrl.currAnnotationInfo.id + ']';
			GeoAnnotator.ContributePanelCtrl.addAnnotationToReference(thisCtrl.currAnnotationInfo.id, name);
		}
	},

	displayRouteSummary : function(routes) {
	    var thisCtrl = GeoAnnotator.AnnotationInfoPanelCtrl;
	    var url = 'route/summary?routesId=' + routes.attributes.id; // default transport: walk
	    var html = "<div id='route_summary_frame' style='height:800px;'> \
			    <iframe id='frame_viewport' style='height:100%;' name='iframe_viewport' frameborder='0' scrolling='auto'  src=" + url + "> \
				    &lt;p&gt;Your browser does not support iframes.&lt;/p&gt; \
			    </iframe> \
			</div> ";
            html += $('#legend').clone().css('display', '').html();
	    thisCtrl.annotationInfoDisplayPanel.body.update(html);
//	    $.get(url, {}, function(res) {
//		var html = "<div id='route_summary_frame' style='width:100%;height=100%'> \
//				<iframe id='frame_viewport' name='iframe_viewport' frameborder='0' scrolling='auto'  src=" + url + "> \
//					&lt;p&gt;Your browser does not support iframes.&lt;/p&gt; \
//				</iframe> \
//			    </div> ";
//		if (res.success) {
//		    if (routes.length > 1) {
//			html = '';
//		    } 
//		    var markersSummary = res.markersSummary;
//		    for (var type in markersSummary) {
//			var newTable = document.createElement('table');
//			var newRow = document.createElement('tr');
//			var newCell1 = document.createElement('td');
//			var newCell2 = document.createElement('td');
//			var newCheckbox = document.createElement('input');
//			newCheckbox.type = 'checkbox';
//			newCheckbox.value = type;
//			var newImg = document.createElement('img');
//			newImg.src = '../static/images/' + type + '.png';
//			var newText = document.createElement('label');
//			newText.text = type;
//			var newLabel = document.createElement('label');
//			newLabel.text  = markersSummary.type;
//			newCell1.appendChild(newCheckbox);
//			newCell1.appendChild(newImg);
//			newCell1.appendChild(newText);
//			newCell2.appendChild(newLabel);
//			newRow.appendChild(newCell1);
//			newRow.appendChild(newCell2);
//			newTable.appendChild(newRow);
//			html += document.getElementById('markerInfo').appendChild(newTable).innerHTML;
//		    }
//		    thisCtrl.annotationInfoDisplayPanel.body.update(html);
//		}
//		else {
//		    html = res.error;
//		}
//	    });

	},

	displayQuestions : function (route) {
	    var thisCtrl = GeoAnnotator.AnnotationInfoPanelCtrl;
	    var url = 'questions/' + route.attributes.id + '/0'; // default transport: walk
	    var html = "<div id='question_frame'> \
			    <iframe id='frame_viewport' name='iframe_viewport' frameborder='0' scrolling='auto'  src=" + url + "> \
				    &lt;p&gt;Your browser does not support iframes.&lt;/p&gt; \
			    </iframe> \
			</div> ";

	    thisCtrl.annotationInfoDisplayPanel.body.update(html);
	},

//	displayQuestions: function(step) {
//	    var thisCtrl = GeoAnnotator.AnnotationInfoPanelCtrl;
//	    var html = '';
//	    switch (step) {
//		case 0: 
//		    html = "<p>1. Do you usually walk or bike on the route you just drew?</p> \
//		       <input type='radio' name='q1' value='walk'> Walk<br> \
//		       <input type='radio' name='q1' value='bike'> Bike<br> \
//		       <input type='button' value='Back' hide='true'>&nbsp;&nbsp;&nbsp;<input type='button' value='Next' onclick='GeoAnnotator.AnnotationInfoPanelCtrl.onQuestionFinished()'>";
//		    break;
//	    }
//	    thisCtrl.annotationInfoDisplayPanel.body.update(html);
//	},

	onQuestionFinished : function() {
	    // enable marker tool buttons
	    Ext.getCmp('Markers-group').enable();
	}
};

GeoAnnotator.ManageWindowCtrl = {
	// containerPanel
	containerWindow: null,
	containerPanel : null,
	manageGridPanel: null,

	register : function (containerWindow) {
		this.containerWindow = containerWindow;
		this.containerPanel = this.containerWindow.get('manage-panel');
	},
	
	init : function () {
		var thisCtrl = GeoAnnotator.ManageWindowCtrl; 
		thisCtrl.createManagePanel();
	},
	
	createManagePanel: function() {
    	var thisCtrl = GeoAnnotator.ManageWindowCtrl;
        // create the Data Store
        var manageListStore = new Ext.data.JsonStore({
            root: 'annotations',
            totalProperty: 'totalCount',
            idProperty: 'id',
            fields: [
            'id', 'userName', 'shareLevel', 'replies',
            {
                name: 'timeCreated',
                type: 'date'
            },
            'excerpt', 'type'],
            proxy: new Ext.data.HttpProxy({
                url: GeoAnnotator.baseUrl + 'annotations/'
            }),
            baseParams: {
                userId: GeoAnnotator.currUserId,
                forumId: GeoAnnotator.currForumId,
                ownerOnly: 'True'
            }
        });
        //var selModel = new Ext.grid.CheckboxSelectionModel();
        thisCtrl.manageGridPanel = new Ext.grid.GridPanel({
            //title:'Manage',
            autoWidth: true,
            autoScroll: true,
            autoHeight: true,
            id: 'manage-grid-panel',
            //tabTip: 'Manage the annotations in the group',
            store: manageListStore,
            loadMask: true,
            // grid columns
            columns: [
            //selModel,
            {
                header: 'Share Level',
                dataIndex: 'shareLevel',
                //width: 100,
                renderer: function(value) {
                    if (parseInt(value) == 3) {
                        return 'Private';
                    }
                    else
                    return 'Public';
                },
                sortable: true
            },
            {
                header: "Type",
                dataIndex: 'type',
                //width: 100,
                //hidden: true,
                sortable: true
            },
            {
                header: "Replies",
                dataIndex: 'replies',
                //width: 100,
                sortable: true
            },
            {
                header: "Date",
                dataIndex: 'timeCreated',
                renderer: Ext.util.Format.dateRenderer('m/d/Y'),
                //width: 70,
                //align: 'right',
                sortable: true
            }
            ],

            // customize view config
            viewConfig: {
                forceFit: true,
                enableRowBody: true,
                showPreview: true,
                getRowClass: function(record, rowIndex, p, store) {
                    if (this.showPreview) {
                        p.body = '<p><i>' + record.data.excerpt + '</i></p>';
                        return 'x-grid3-row-expanded';
                    }
                    return 'x-grid3-row-collapsed';
                }
            },
            //selModel  : selModel,
            tbar: new Ext.Toolbar({
                id: 'manage-grid-tbar',
                items: [{
                    pressed: true,
                    enableToggle: true,
                    text: 'Show Preview',
                    //cls: 'x-btn-text-icon details',
                    toggleHandler: function(btn, pressed) {
                        var view = thisCtrl.manageGridPanel.getView();
                        view.showPreview = pressed;
                        view.refresh();
                    }
                },
                {
                    xtype: 'tbseparator'
                },
                {
                    text: 'Edit',
                    id: 'manage-annotation-edit-btn',
					iconCls: 'annotation-edit-icon',
                    disabled: true,
                    handler: thisCtrl.onAnnotationEditClick
                },
                {
                    text: 'Delete',
                    id: 'manage-annotation-delete-btn',
					iconCls: 'annotation-delete-icon',
                    disabled: true,
                    handler: thisCtrl.onAnnotationDeleteClick
                }]
            }),

            // paging bar on the bottom
            bbar: new Ext.PagingToolbar({
                store: manageListStore,
                pageSize: 10,
                displayInfo: true,
                displayMsg: 'Annotations {0} - {1} of {2}',
                emptyMsg: 'No Annotations to display'
            })
        });

        thisCtrl.manageGridPanel.on('rowclick', thisCtrl.onManageGridPanelRowClick);

        // trigger the data store load
        manageListStore.load({
            params: {
                start: 0,
                limit: 10
            }
        });

		if (thisCtrl.containerPanel.items) {
			thisCtrl.containerPanel.removeAll();
		}
		thisCtrl.containerPanel.add(thisCtrl.manageGridPanel);
		thisCtrl.containerPanel.doLayout();	
		thisCtrl.containerWindow.on('hide', function(){
			var toolbox_group = GeoAnnotator.MapPanelCtrl.containerPanel.getTopToolbar().items.get('toolbox-group');
			if (toolbox_group) {
				toolbox_group.items.get('manage-btn').toggle(false);
			}	

		});
    },


    update: function() {
        var thisCtrl = GeoAnnotator.ManageWindowCtrl; 
		thisCtrl.createManagePanel();
    },


    onManageGridPanelRowClick: function(grid, index, e) {
        var thisCtrl = GeoAnnotator.ManageWindowCtrl;
        var record = grid.getStore().getAt(index);
        // change the states
		GeoAnnotator.currAnnotationId = record.get('id');
        GeoAnnotator.currFootprintId = '0';

        // update controls		
        //GeoAnnotator.TimelinePanelCtrl.update();
        GeoAnnotator.AnnotationInfoPanelCtrl.update();
        //GeoAnnotator.AnnotationHistoryPanelCtrl.update();
        //GeoAnnotator.MapPanelCtrl.update();

        if (parseInt(record.get('shareLevel')) >= 3 || parseInt(record.get('replies')) <= 0) {
            thisCtrl.manageGridPanel.getTopToolbar().items.get('manage-annotation-edit-btn').setDisabled(false);
            thisCtrl.manageGridPanel.getTopToolbar().items.get('manage-annotation-delete-btn').setDisabled(false);
        }
        else {
            thisCtrl.manageGridPanel.getTopToolbar().items.get('manage-annotation-edit-btn').setDisabled(true);
            thisCtrl.manageGridPanel.getTopToolbar().items.get('manage-annotation-delete-btn').setDisabled(true);
        }
    },

    onAnnotationEditClick: function() {
        var thisCtrl = GeoAnnotator.ManageWindowCtrl;
        var contributeFormPanel = GeoAnnotator.ContributePanelCtrl.contributeFormPanel;
		contributePanel.expand(false);
		
        var currAnnotationInfo = GeoAnnotator.AnnotationInfoPanelCtrl.currAnnotationInfo;
        // 0. id
        contributeFormPanel.getForm().findField('newAnnotationId').setValue(currAnnotationInfo.id);
        // 1. content
        contributeFormPanel.getForm().findField('newAnnotationContent').setValue(currAnnotationInfo.content);
        // 2. shareLevel
        var shareLevelGroup = contributeFormPanel.getForm().findField('shareLevelGroup').items;
        for (var i = 0; i < shareLevelGroup.items.length; i++) {
            if (shareLevelGroup.items[i].inputValue == currAnnotationInfo.shareLevel) {
                shareLevelGroup.items[i].setValue(true);
            }
            else {
                shareLevelGroup.items[i].setValue(false);
            }
        };


        contributeFormPanel.get('newAnnotationContent').focus();
    },

    onAnnotationDeleteClick: function() {
        Ext.Msg.confirm('Delete the annotation?', 'Are you sure that you want to delete the current annotation?',
        function(btn, text) {
            if (btn == 'yes') {
                var thisCtrl = GeoAnnotator.ManageWindowCtrl;
                // request the deletion
                Ext.Ajax.request({
                    url: GeoAnnotator.baseUrl + 'annotation/',
                    success: thisCtrl.onDeleteAnnotationSuccess,
                    failure: thisCtrl.onDeleteAnnotationFailure,
                    params: {
                        'delete': GeoAnnotator.AnnotationInfoPanelCtrl.currAnnotationInfo.id,
                        'userId': GeoAnnotator.currUserId,
                        'forumId': GeoAnnotator.currForumId
                    }
                });
            }
        }
        );
    },

    onDeleteAnnotationSuccess: function(xhr) {
        var thisCtrl = GeoAnnotator.ManageWindowCtrl;

        GeoAnnotator.currAnnotationId = '0';
        GeoAnnotator.currFootprintId = '0';

        // initialize controls
        GeoAnnotator.AnnotationInfoPanelCtrl.init();

        // update controls		
        GeoAnnotator.ContributePanelCtrl.update();
		thisCtrl.update();
        GeoAnnotator.TimelinePanelCtrl.update();
        GeoAnnotator.MapPanelCtrl.update();
    },

    onDeleteAnnotationFailoure: function () {
		alert('failed to delete annotation');	
	}


};

GeoAnnotator.AnnotationHistoryWindowCtrl = {
	// containerPanel
	containerWindow: null,
	containerPanel : null,
	historyStore : null,
	historyList:null,
	historyLength : 20,
	register : function (containerWindow) {
		this.containerWindow = containerWindow;
		this.containerPanel = this.containerWindow.get('annotation-history-panel');
	},
	
	init : function () {
		var thisCtrl = GeoAnnotator.AnnotationHistoryWindowCtrl; 
		thisCtrl.historyLength = 20;
		var historyTpl = new Ext.XTemplate(
        	'<tpl for=".">',
        	'<div class="list-item">',
            '<h3><span>{timeCreated:date("M d, Y")}</span>',
            '{userName} says:</h3>',
            '<p>{excerpt}</p>',
        	'</div></tpl>'
    	);
		
		// the data store of references
		thisCtrl.historyStore = new Ext.data.SimpleStore({
  			fields: ['id', 'type', 'userName', {name: 'timeCreated', type: 'date'}, 'excerpt'],
  			data : []
		});
		// the data list of references
		thisCtrl.historyList = new Ext.DataView({
            tpl: historyTpl,
        	store: thisCtrl.historyStore,
        	itemSelector: 'div.list-item',
			multiSelect: true,
			selectedClass: 'list-item-selected', 
			overClass:'list-item-over',
			emptyText : 'No History'
    	});
	
		thisCtrl.historyList.on('click', thisCtrl.onHistoryItemClick);
		thisCtrl.historyList.on('contextmenu', thisCtrl.onHistoryContextMenu);
		
		if (thisCtrl.containerPanel.items) {
			thisCtrl.containerPanel.removeAll();
		}
		thisCtrl.containerPanel.add(thisCtrl.historyList);	
		thisCtrl.containerWindow.on('hide', function(){GeoAnnotator.ContainerTBCtrl.containerTB.get('annotation-history-btn').toggle(false);});
	
	},
	
	onHistoryItemClick : function (dataView, index, node, e) {
		
		// change the states
		var id = dataView.getRecord(node).get('id');
		var type = dataView.getRecord(node).get('type');
		
		GeoAnnotator.currAnnotationId = id;
		GeoAnnotator.currFootprintId = '0';
			
		// do nothing
		// GeoAnnotator.UserInfoPanelCtrl;
		// GeoAnnotator.GroupInfoPanelCtrl;
		// GeoAnnotator.AnnotationBookmarkPanelCtrl;
		// GeoAnnotator.AnnotationSearchPanelCtrl;
			
		// update controls		
		//GeoAnnotator.TimelinePanelCtrl.update();
		GeoAnnotator.AnnotationInfoPanelCtrl.update();
		
		//GeoAnnotator.MapPanelCtrl.update();
		
	},
	
	onHistoryContextMenu : function (dataView, index, node, e) {
		var thisCtrl = GeoAnnotator.AnnotationHistoryWindowCtrl; 
		thisCtrl.ctxArguments = arguments;
		thisCtrl.ctxNodeIndex = index;
		if(!thisCtrl.contextMenu){ // create context menu on first right click
            thisCtrl.contextMenu = new Ext.menu.Menu({
                id:'history-ctx',
                items: [{
                    id:'quick-reply',
                    iconCls:'quick-reply-icon',
                    text:'Quick Reply',
                    scope: thisCtrl,
                    handler:function(){
						var thisCtrl = GeoAnnotator.AnnotationHistoryWindowCtrl;
						// show as the current annotation
						thisCtrl.ctxArguments[0].fireEvent('click', thisCtrl.ctxArguments[0], thisCtrl.ctxArguments[1], thisCtrl.ctxArguments[2], thisCtrl.ctxArguments[3]);
						// pop up the quick reply window
						GeoAnnotator.AnnotationHistoryWindowCtrl.onCommentClick();
                    }
                },{
                    iconCls:'add-reference-icon',
                    text:'Add to References',
                    scope: thisCtrl,
					handler:function(){
						/*
							TODO change to new contribute panel
						*/
						
						var record = thisCtrl.historyStore.getAt(thisCtrl.ctxNodeIndex);
						var id = record.get('id');
						var name = '[AN' + id + ']';
						GeoAnnotator.ContributePanelCtrl.addAnnotationToReference(id, name);
						/*
						var groupCtrl = GeoAnnotator.ContributePanelCtrl; 
						var records = groupCtrl.referenceStore.query('id',record.get('id'));
						for (var i = 0; i < records.length; i++){
							groupCtrl.referenceStore.remove(records.get(i));
						}
						groupCtrl.referenceStore.insert(0,record);
						*/
                    }
                },'-',{
                    text:'Remove',
                    iconCls:'remove-icon',
                    scope: thisCtrl,
                    handler:function(){
						GeoAnnotator.AnnotationHistoryWindowCtrl.historyStore.removeAt(thisCtrl.ctxNodeIndex);
                    }
                }]
            });
        }
        
        //this.ctxNode.ui.addClass('x-node-ctx');
		e.preventDefault();
        thisCtrl.contextMenu.showAt(e.getXY());
        	
	},
	
	add : function (item) {
		var thisCtrl = GeoAnnotator.AnnotationHistoryWindowCtrl; 
		var records = thisCtrl.historyStore.query('id',item.id);
		for (var i = 0; i < records.length; i++){
			thisCtrl.historyStore.remove(records.get(i));
		}
		var totalCount = thisCtrl.historyStore.getTotalCount();
		if (totalCount >= thisCtrl.historyLength){
			thisCtrl.historyStore.removeAt(totalCount - 1);
		}
		thisCtrl.historyStore.insert(0,new Ext.data.Record(item));
	},
	
	clear : function () {
		var thisCtrl = GeoAnnotator.AnnotationHistoryWindowCtrl; 
		thisCtrl.historyStore.removeAll();
	}
};

GeoAnnotator.AnnotationBookmarkWindowCtrl = {
	// containerPanel
	containerPanel: null,
	containerWindow: null,
	bookmarkStore : null,
	bookmarkList : null,
	bookmarkPanel : null,
	contextMenu : null,
	register : function (containerWindow) {
		this.containerWindow = containerWindow;
		this.containerPanel = this.containerWindow.get('annotation-bookmark-panel');
	},
	
	init : function () {
		var thisCtrl = GeoAnnotator.AnnotationBookmarkWindowCtrl; 
		var bookmarkTpl = new Ext.XTemplate(
        	'<tpl for=".">',
        	'<div class="list-item">',
            '<h3><span>{timeCreated:date("M d, Y")}</span>',
            '{userName} says:</h3>',
            '<p>{excerpt}</p>',
        	'</div></tpl>'
    	);
		
		// the data store of references
		thisCtrl.bookmarkStore = new Ext.data.SimpleStore({
  			fields: ['id', 'type', 'userName', {name: 'timeCreated', type: 'date'}, 'excerpt'],
  			data : []
		});
		// the data list of references
		thisCtrl.bookmarkList = new Ext.DataView({
            tpl: bookmarkTpl,
        	store: thisCtrl.bookmarkStore,
        	itemSelector: 'div.list-item',
			multiSelect: true,
			selectedClass: 'list-item-selected', 
			overClass:'list-item-over',
			emptyText : 'No Bookmarks'
    	});
		thisCtrl.bookmarkList.on('click', thisCtrl.onBookmarkItemClick);
		thisCtrl.bookmarkList.on('contextmenu', thisCtrl.onBookmarkContextMenu);
		
		if (thisCtrl.containerPanel.items) {
			thisCtrl.containerPanel.removeAll();
		}
		thisCtrl.containerPanel.add(thisCtrl.bookmarkList);		
		thisCtrl.containerWindow.on('hide', function(){GeoAnnotator.ContainerTBCtrl.containerTB.get('annotation-bookmark-btn').toggle(false);});

	},
	
	onBookmarkItemClick : function (dataView, index, node, e) {
		// change the states
		var id = dataView.getRecord(node).get('id');
		var type = dataView.getRecord(node).get('type');
		
		GeoAnnotator.currAnnotationId = id;
		GeoAnnotator.currFootprintId = '0';
			
			
		// update controls		
		//GeoAnnotator.TimelinePanelCtrl.update();
		GeoAnnotator.AnnotationInfoPanelCtrl.update();
		
		//GeoAnnotator.MapPanelCtrl.update();
		
	},
	
	onBookmarkContextMenu : function (dataView, index, node, e) {
		var thisCtrl = GeoAnnotator.AnnotationBookmarkWindowCtrl; 
		thisCtrl.ctxArguments = arguments;
		thisCtrl.ctxNodeIndex = index;
		if(!thisCtrl.contextMenu){ // create context menu on first right click
            thisCtrl.contextMenu = new Ext.menu.Menu({
                id:'bookmark-ctx',
                items: [{
                    id:'quick-reply',
                    iconCls:'quick-reply-icon',
                    text:'Quick Reply',
                    scope: thisCtrl,
                    handler:function(){
						// show as the current annotation
						var thisCtrl = GeoAnnotator.AnnotationBookmarkWindowCtrl;
						thisCtrl.ctxArguments[0].fireEvent('click', thisCtrl.ctxArguments[0], thisCtrl.ctxArguments[1], thisCtrl.ctxArguments[2], thisCtrl.ctxArguments[3]);
						// pop up the quick reply window
						GeoAnnotator.AnnotationInfoPanelCtrl.onCommentClick();
                    }
                },{
                    iconCls:'add-reference-icon',
                    text:'Add to References',
                    scope: thisCtrl,
					handler:function(){
						/*
							TODO change to new contribute panel
						*/
						var record = thisCtrl.bookmarkStore.getAt(thisCtrl.ctxNodeIndex);
						var id = record.get('id');
						var name = '[AN' + id + ']';
						GeoAnnotator.ContributePanelCtrl.addAnnotationToReference(id, name);
						
						/*
						var groupCtrl = GeoAnnotator.ContributePanelCtrl; 
						var records = groupCtrl.referenceStore.query('id',record.get('id'));
						for (var i = 0; i < records.length; i++){
							groupCtrl.referenceStore.remove(records.get(i));
						}
						groupCtrl.referenceStore.insert(0,record);
						*/
                    }
                },'-',{
                    text:'Remove',
                    iconCls:'remove-icon',
                    scope: thisCtrl,
                    handler:function(){
						GeoAnnotator.AnnotationBookmarkWindowCtrl.bookmarkStore.removeAt(thisCtrl.ctxNodeIndex);
                    }
                }]
            });
        }
        
        //this.ctxNode.ui.addClass('x-node-ctx');
		e.preventDefault();
        thisCtrl.contextMenu.showAt(e.getXY());
        	
	},
	
	add : function (item) {
		var thisCtrl = GeoAnnotator.AnnotationBookmarkWindowCtrl; 
		var records = thisCtrl.bookmarkStore.query('id',item.id);
		for (var i = 0; i < records.length; i++){
			thisCtrl.bookmarkStore.remove(records.get(i));
		}
		
		thisCtrl.bookmarkStore.insert(0,new Ext.data.Record(item));
	},
	
	
	clear : function () {
		var thisCtrl = GeoAnnotator.AnnotationBookmarkWindowCtrl; 
		thisCtrl.bookmarkStore.removeAll();
	},
	
	removeAt : function (index) {
		var thisCtrl = GeoAnnotator.AnnotationBookmarkWindowCtrl; 
		thisCtrl.bookmarkStore.removeAt(index);
	},
	
	update : function () {
		
	}
};


GeoAnnotator.Util = {
	/**
 	* Parse the XML document contained in the string argument and return 
 	* a Document object that represents it.
 	*/
	parseXML: function(text){
		
		  
		 if (typeof DOMParser != "ftp://ftp.") {
			// Mozilla, Firefox, and related browsers
			return (new DOMParser()).parseFromString(text, "application/xml");
		}
		else 
			if (typeof ActiveXObject != "undefined") {
				// Internet Explorer.
				var doc = XML.newDocument(); // Create an empty document
				doc.loadXML(text); // Parse text into it
				return doc; // Return it
			}
			else {
		
				// As a last resort, try loading the document from a data: URL
				// This is supposed to work in Safari.  Thanks to Manos Batsis and
				// his Sarissa library (sarissa.sourceforge.net) for this technique.
				var url = "data:text/xml;charset=utf-8," + encodeURIComponent(text);
				var request = new XMLHttpRequest();
				request.open("GET", url, false);
				request.send(null);
				return request.responseXML;
			}
	}
};


