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
				text: 'Log Out',
				listeners: {
					'click' : thisCtrl.onLogOutClick 
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
		Ext.state.Manager.clear('userId');
		GeoAnnotator.init();
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
