/**
 * @author byu
 */

var GeoAnnotator = {
	currUserId : '0',
	currForumId : '0',
	currAnnotationId : '0',
	currPlanId : '0',
	isAdmin : false,
	isOwner	: false,
	isResearchModeOn : false,
	//var baseUrl = "http://130.203.158.62/geoannotator/";
	//baseUrl : "../GeoAnnotatorService/",
	baseUrl : "api/",
	
	init : function (){
		this.currUserId = $('#userId').val();
		this.currForumId = '0';
		this.currAnnotationId = '0';
		this.currPlanId = '0';
						
		GeoAnnotator.ContainerTBCtrl.init();
		
		GeoAnnotator.MapPanelCtrl.init();
		// GeoAnnotator.TimelinePanelCtrl.init();
	
		GeoAnnotator.AnnotationInfoPanelCtrl.init();
		GeoAnnotator.ContributePanelCtrl.init();
		GeoAnnotator.ManageWindowCtrl.init();
		
		GeoAnnotator.AnnotationBookmarkWindowCtrl.init();
		GeoAnnotator.AnnotationHistoryWindowCtrl.init();
		GeoAnnotator.PostClaimWindowCtrl.init();
		// 	check whether the user is stored in cookie
		//	var userId = Ext.state.Manager.get('userId', '0');
		//	this.currUserId = Ext.state.Manager.get('userId', '0'); 	
		// 	check the url params
		//	var params = Ext.urlDecode(location.search.substring(1));
		//	this.currUserId = params['userId'] || this.currUserId;
		//	this.currForumId = params['forumId'] || this.currForumId;
		GeoAnnotator.ContainerTBCtrl.update();
		if (this.currUserId !== '0') {
			GeoAnnotator.ManageWindowCtrl.update();
		}
		if (this.currForumId !== '0') {
			this.currAnnotationId = params['annotationId'] || this.currAnnotationId;
			if (this.currAnnotationId !== '0') {
				GeoAnnotator.AnnotationInfoPanelCtrl.update();	
			};
			// GeoAnnotator.TimelinePanelCtrl.update();
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
	forumEditWindow : null,

	forumList : null,
	admin_user_list: null,
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
			fields: ['id', 'name','role']
		});
		var forumUserStore = new Ext.data.JsonStore({
			autoDestroy: true,
			autoLoad: true,
			url: GeoAnnotator.baseUrl + 'userlist/',
			baseParams: {'userId':GeoAnnotator.currUserId,'forumId': GeoAnnotator.currForumId},
			root: 'user_list',
			idProperty: 'id',
			fields: ['id', 'name','role']
		});
		thisCtrl.forumList = new Ext.form.ComboBox({store: forumListStore, 
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
		thisCtrl.admin_user_list = new Ext.form.ComboBox({
			store: forumUserStore, 
			displayField:'name',
			typeAhead: true,
			mode: 'local',
			disabled : true,
			id: 'forum-user-select',
			width: 120,
			triggerAction: 'all',
			emptyText:'Select a user',
			
			selectOnFocus:true,
			listeners:{
				'select': thisCtrl.onUserListSelect
			}
		});
		
		thisCtrl.containerTB.add({xtype: 'tbtext', text: 'Current Forum: '});
		thisCtrl.containerTB.add(thisCtrl.forumList);
		thisCtrl.containerTB.add('-');
		thisCtrl.containerTB.add({id: 'forum-id-btn',
			text: 'Forum Info',
			
			iconCls: 'detail-icon',
			disabled : true,
			listeners:{
				'click': thisCtrl.onForumDetailClick
			}
		});
		thisCtrl.containerTB.add({id: 'forum-edit-btn',
			text: 'Edit Forum Info',
			iconCls: 'foruminfo-edit-icon',
			disabled : true,
			listeners:{
				'click': thisCtrl.onForumEditClick
			}
		});
	
		thisCtrl.containerTB.add(' ');
		// 2. toggle History and bookmark windows
		// thisCtrl.containerTB.add({
		// 	id: 'timeline-btn',
		// 	iconCls: 'timeline-icon',
		// 	disabled : true,
		// 	pressed: false,
		// 	enableToggle: true,
		// 	toggleHandler: function(button, pressed){
		// 		if(pressed){
		// 			// GeoAnnotator.TimelinePanelCtrl.containerPanel.expand(false);
		// 		}
		// 		else{
		// 			// GeoAnnotator.TimelinePanelCtrl.containerPanel.collapse(false);
		// 		}
		// 	},
		// 	text: 'Timeline',
		// 	tooltip: {
		// 		title: 'Timeline',
		// 		text: 'Show the timeline'
		// 	}
		// });
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
			thisCtrl.containerTB.add({
				xtype: 'tbtext', 
				text: 'Welcome, ' + thisCtrl.currUserInfo.userName + '!'
				});
			
			thisCtrl.containerTB.add('-');
			thisCtrl.containerTB.add(thisCtrl.admin_user_list);
			if(!GeoAnnotator.isAdmin)	thisCtrl.admin_user_list.setVisible(false);
			thisCtrl.containerTB.add({
				itemId: 'logoutLink',
				xtype: 'box',
				autoEl: {
				tag: 'a',
				href: "{% url 'users.views.logout_user' %}",
				html: 'Log out hahah   '
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
								GeoAnnotator.currPlanId = '0';
		
								GeoAnnotator.ContainerTBCtrl.init();
								GeoAnnotator.MapPanelCtrl.init();
								// GeoAnnotator.TimelinePanelCtrl.init();
			
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
		//Ext.state.Manager.clear('userId');
		//GeoAnnotator.init();
		$.get('geodeliberator/usr/logout');
	},
	
	onLoadUserInfoSuccess : function (xhr) {
		thisCtrl = GeoAnnotator.ContainerTBCtrl;
		thisCtrl.currUserInfo = Ext.util.JSON.decode(xhr.responseText);
		//alert(thisCtrl.currUserInfo.role);
		if(thisCtrl.currUserInfo.role=="admin")
			{
				GeoAnnotator.isAdmin= true;
				thisCtrl.containerTB.getComponent('forum-user-select').setVisible(true);
				//alert("This user is an admin!");
			}
		/*if(thisCtrl.currUserInfo.role=="owner")
			{
				GeoAnnotator.isOwner= true;
				alert("This user is current forum's owner!");
			}	
			else
			{
				GeoAnnotator.isOwner= false;
				alert("This user's role is: "+thisCtrl.currUserInfo.role);
			}	
		*/
		if (thisCtrl.currUserInfo != null) {
			// update panel
			thisCtrl.updatePanelContent();
			
			if (GeoAnnotator.currUserId != '0') 
			{
				var storedUserId = Ext.state.Manager.get('userId', '0');
				
				if (GeoAnnotator.currUserId != storedUserId) {
					// set cookie
					Ext.state.Manager.set('userId', GeoAnnotator.currUserId);
				}
				else {
						if (Ext.state.Manager.get('forumId', '0') != '0')
						{
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
		//alert('onforumlist select, role is: '+record.get('role'));
		if(record.get('role')=='owner')
		{
			GeoAnnotator.isOwner=true;
		}
		else
		{
			GeoAnnotator.isOwner=false;
		}
		var thisCtrl = GeoAnnotator.ContainerTBCtrl;
		if (id && GeoAnnotator.currForumId != id) {
			// reset the new plans array
			GeoAnnotator.currForumId = id;
			thisCtrl.containerTB.getComponent('forum-id-btn').enable();
			thisCtrl.containerTB.getComponent('forum-edit-btn').setVisible(false);
			if(GeoAnnotator.isAdmin||GeoAnnotator.isOwner)
			{
				thisCtrl.containerTB.getComponent('forum-edit-btn').enable();
				thisCtrl.containerTB.getComponent('forum-edit-btn').setVisible(true);
			}
			//thisCtrl.containerTB.getComponent('timeline-btn').enable();
			thisCtrl.containerTB.getComponent('annotation-history-btn').enable();
			thisCtrl.containerTB.getComponent('annotation-bookmark-btn').enable();
			if(GeoAnnotator.isAdmin)	thisCtrl.containerTB.getComponent('forum-user-select').enable();
			if(!GeoAnnotator.isAdmin)	thisCtrl.containerTB.getComponent('forum-user-select').setVisible(false);		
		}		
		// update controls		
		var currParams = {};
		if (GeoAnnotator.currUserId != '0'){
			currParams.userId = GeoAnnotator.currUserId;	
		} 
		if (GeoAnnotator.currForumId != '0'){
			currParams.forumId = GeoAnnotator.currForumId;
			//alert("current forum id has changed to: "+GeoAnnotator.currForumId);
		}
		GeoAnnotator.MapPanelCtrl.update(currParams);
		//GeoAnnotator.TimelinePanelCtrl.update();
		GeoAnnotator.ManageWindowCtrl.update();
		
		//GeoAnnotator.ContainerTBCtrl.admin_user_list.store.baseParams.forumId=GeoAnnotator.currForumId;
		GeoAnnotator.ContainerTBCtrl.admin_user_list.store.setBaseParam('forumId',GeoAnnotator.currForumId);
		GeoAnnotator.ContainerTBCtrl.admin_user_list.store.load();
	},
	
	onUserListSelect : function(combo, record, index) {
		//alert(record.get('id'));
		var id = record.get('id');
		GeoAnnotator.currUserId=id;
		//alert(GeoAnnotator.currUserId);
		var thisCtrl = GeoAnnotator.ContainerTBCtrl;
		if (id && GeoAnnotator.currForumId != id) {
			// reset the new plans array
			//GeoAnnotator.currForumId = id;
			thisCtrl.containerTB.getComponent('forum-id-btn').enable();
			thisCtrl.containerTB.getComponent('forum-edit-btn').enable();// this need to be modified.
			//thisCtrl.containerTB.getComponent('timeline-btn').enable();
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
		// GeoAnnotator.TimelinePanelCtrl.update();
		GeoAnnotator.ManageWindowCtrl.update();
	},

	onForumDetailClick : function() {
		var thisCtrl = GeoAnnotator.ContainerTBCtrl;
		// request the forum information
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
	
	onForumEditClick : function() {
		var thisCtrl = GeoAnnotator.ContainerTBCtrl;
		// request the forum information
		Ext.Ajax.request({
			url: GeoAnnotator.baseUrl + 'forum/',
			success: thisCtrl.onEditForumInfoSuccess,	// 	if we load the info success we can edit it. 
			failure: thisCtrl.onLoadForumInfoFailure,	//	otherwise we just consider it as a load failure
			params: {
				'userId': GeoAnnotator.currUserId,
				'forumId': GeoAnnotator.currForumId
			}
		});
	},
	
	onLoadForumInfoSuccess: function(xhr) {
	   var thisCtrl = GeoAnnotator.ContainerTBCtrl;
	   thisCtrl.currForumInfo = Ext.util.JSON.decode(xhr.responseText);
	   //alert("thisCtrl.currForumInfo is: "+thisCtrl.currForumInfo.name);
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
	
	onEditForumInfoSuccess: function(xhr) {
	   var thisCtrl = GeoAnnotator.ContainerTBCtrl;
	   thisCtrl.currForumInfo = Ext.util.JSON.decode(xhr.responseText);
	   if (thisCtrl.currForumInfo != null) 
	   {
		   // show the forum detail
		   thisCtrl.editForumInfo();
		   // set cookies	//added by FZ, not sure if these are useful. will come back latter.
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
		var regex = /^.*<div id=\"forumGeneralInfo\">.*$/gi;	// this regex will check if the forum description contains the div tag.
		if(regex.test(thisCtrl.currForumInfo.description))
		{
			html = thisCtrl.currForumInfo.description;
		}
		else
		{
			html = '<div id="forumGeneralInfo">' + thisCtrl.currForumInfo.description + '</div>';
			// if not, we add the div tag to the description.
		}	

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
				title		: 'Forum Information of '+thisCtrl.currForumInfo.name
			});
			thisCtrl.forumInfoWindow.on('hide', function(){GeoAnnotator.ContainerTBCtrl.forumInfoWindow.body.update('');});
		}
		else {
			thisCtrl.forumInfoWindow.body.update(html);
		}
		thisCtrl.forumInfoWindow.show();
		thisCtrl.forumInfoWindow.alignTo(thisCtrl.containerTB.getComponent('forum-id-btn').el, 'tl-tl');
	},
	editForumInfo : function() {
		var thisCtrl = GeoAnnotator.ContainerTBCtrl;
		var regex = /^.*<div id=\"forumGeneralInfo\">.*$/gi;	//	refer back to the showForumInfo function for more explanation
		if(regex.test(thisCtrl.currForumInfo.description))
		{
			html = thisCtrl.currForumInfo.description;
		}
		else
		{
			html = '<div id="forumGeneralInfo">' + thisCtrl.currForumInfo.description + '</div>';
		}	
		
		var edit = new Ext.FormPanel({
			id: 'forum-info-edit-form',
			labelAlign: 'top',
			frame: true,
			autoHeight: true,
			bodyStyle: 'padding: 5 5 5 5;',
			items : 
			[{
				xtype: 'htmleditor',
				id: 'newForumInfo',
				name: 'newForumInfo',
				fieldLabel: 'Forum Information Editor',
				enableFont: true,
				enableLists: true,
				enableAlignments: true,
				height: 450,
				width: 450,
				autoScroll: true,
				anchor: '100%',
				value	: html
				
			}],
			buttons: [{
					text: 'Submit',
					handler: thisCtrl.onForumEditSubmit
			}]
		}); 
		//alert(html);
		if(!thisCtrl.forumEditWindow){
			//alert("!thisCtrl.forumEditWindow");
			thisCtrl.forumEditWindow = new Ext.Window({
				layout      : 'fit',
				width       : 500,	// gives wider and taller panel for neat display purpos.
				height      : 600,
				autoScroll	: true,
				closeAction :'hide',
				plain       : true,
				modal		: 	false,
				items		:	edit,
				title	: 'Forum Information of '+thisCtrl.currForumInfo.name
			});}
			//thisCtrl.forumEditWindow.on('hide', function(){GeoAnnotator.ContainerTBCtrl.forumEditWindow.body.update('');});
			// added by FZ 0610. This line cause error, will fix it latter.
		
		thisCtrl.forumEditWindow.show();
		thisCtrl.forumEditWindow.alignTo(thisCtrl.containerTB.getComponent('forum-edit-btn').el, 'tl-tl');
	},
	onForumEditSubmit : function(){
		var html_info = thisCtrl.forumEditWindow.getComponent('forum-info-edit-form').getForm().findField('newForumInfo').getValue();	
		//added by FZ 0610. need more explain latter.	
		thisCtrl.submitEditFormData(html_info);
	},
	submitEditFormData: function(html_info){
		var thisCtrl = GeoAnnotator.ContainerTBCtrl;
		// request the user information
		Ext.Ajax.request({
			url: GeoAnnotator.baseUrl + 'foruminfo/',
			success: thisCtrl.onSubmitEditInfoSuccess,
			failure: thisCtrl.onSubmitEditInfoFail,
			params: {
				'userId': GeoAnnotator.currUserId,
				'forumId': GeoAnnotator.currForumId,
				'newinfo': html_info
			}
		});
	},
	onSubmitEditInfoFail: function(xhr) {
		alert('failed to edit Forum info!');
	},
	onSubmitEditInfoSuccess: function(xhr) {
		var submitState = Ext.util.JSON.decode(xhr.responseText);
		if (submitState.success == true) 
		{
			alert('You have successfully edit the forum information!');
			// here we may try to turn off the window.
		}
		else
			alert('Edit submission failed!');
	}
};

GeoAnnotator.ContributePanelCtrl = {
	containerPanel: null,
	contributeFormPanel: null,
	// new created plans array
	newPlans : [],

	register: function(containerPanel) {
		GeoAnnotator.ContributePanelCtrl.containerPanel = containerPanel;
	},

	init: function() {
		var thisCtrl = GeoAnnotator.ContributePanelCtrl;
		thisCtrl.newPlans = [];

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
			//added by FZ on 0529, temporary change, delete this section when possible
			{
				xtype: 'datefield',
				format : 'Y-m-d',
				fieldLabel : 'Pick a date', 
				id : 'newAnnotationDate',
				submitFormat: 'Y-m-d H:i:s',
				name : 'newAnnotationDate',
				//value: new Date()
				anchor : 0,
					value : new Date(),
					allowBlank : false
			},
			{
				//adde by FZ 0529
				xtype: 'timefield',
				//format : 'Y-m-d',
				fieldLabel : 'Then define a Time', 
				id : 'newAnnotationTime',
				//submitFormat: 'Y-m-d H:i:s',
				name : 'newAnnotationTime',
				//value: new Date()
				anchor : 0,
				allowBlank : false,
				increment: 1,
				format     : 'H:i'
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

	addPlanToReference: function(fpId, name) {
		var thisCtrl = GeoAnnotator.ContributePanelCtrl;
		var htmleditor = thisCtrl.contributeFormPanel.getForm().findField('newAnnotationContent');
		htmleditor.focus();
		//htmleditor.insertAtCursor ('[[' + name + '|fp' + id + ']]');
		//htmleditor.setValue(htmleditor.getValue() + '[[' + name + '|fp' + id + ']]');
		var link_html = '<a href="#" class="ref-link" id="ref-PLAN' + fpId + '">' + name + '</a>';
		htmleditor.setValue(htmleditor.getValue() + link_html);
	},
	
	removePlanFromReference: function(fpId){
		var thisCtrl = GeoAnnotator.ContributePanelCtrl;
		var htmleditor = thisCtrl.contributeFormPanel.getForm().findField('newAnnotationContent');
		var content = htmleditor.getValue();
		
		var regex = /<a href=\"#\" class=\"ref-link\" id=\"ref-([POST,PLAN]+-?[0-9]+)\">([a-z,0-9,_,\s,\-,\[,\]]+)<\/a>/gi; 
		var input = content;
		if(regex.test(input)) {
			regex.lastIndex = 0;
			var matches = [];
			var match;
			while((match = regex.exec(input)) !== null) {
				if(match[0] === "") { 
					regex.lastIndex += 1 ;
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
		var link_html = '<a href="#" class="ref-link" id="ref-POST' + anId + '">' + name + '</a>';
		htmleditor.setValue(htmleditor.getValue() + link_html);		
	},
	
	removeAnnotationFromReference: function(anId){
		var thisCtrl = GeoAnnotator.ContributePanelCtrl;
		var htmleditor = thisCtrl.contributeFormPanel.getForm().findField('newAnnotationContent');
		var content = htmleditor.getValue();
		
		var regex = /<a href=\"#\" class=\"ref-link\" id=\"ref-([PLAN,POST]+-?[0-9]+)\">([a-z,0-9,_,\s,\-,\[,\]]+)<\/a>/gi; 
		var input = content;
		if(regex.test(input)) {
			regex.lastIndex = 0;
			var matches = [];
			var match;
			while((match = regex.exec(input)) !== null) {
				if(match[0] === "") { 
					regex.lastIndex += 1 ;
				}
				else {
					matches.push({result: match, lastIndex: regex.lastIndex});
				}
			}
			for (var i=0; i < matches.length; i++) {
				var match = matches[i].result;
				var id = match[1];
				var name = match[2];
				if (id === 'POST'+fpId) {
					content = content.replace(match[0], '');
				};
			}
		}
		htmleditor.setValue(content);
	},	
	
	onContributeSubmit: function() {
		var thisCtrl = GeoAnnotator.ContributePanelCtrl;
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
		//added by FZ 0530, delete when possible.
		newAnnotation.timeCreated = 
		thisCtrl.contributeFormPanel.getForm().findField('newAnnotationDate').getValue().format('Y-m-d').trim()
		+
		' '
		+ thisCtrl.contributeFormPanel.getForm().findField('newAnnotationTime').getValue();
		// above
		
		//newAnnotation.timeCreated = new Date().toGMTString();
		//above is the original line.
		
		
		// 7. contextMap
		// newAnnotation.contextMap = thisCtrl.getContextMap();
		
		// 8. references
		newAnnotation.planref = [];
		newAnnotation.issueref = [];
		newAnnotation.optionref = [];
		newAnnotation.postref = [];
		var regex = /<a href=\"#\" class=\"ref-link\" id=\"ref-([PLAN,OPT,ISSUE,POST]+-?[0-9]+)\">([a-z,0-9,_,\s,\-,\[,\]]+)<\/a>/gi; 
		var input = newAnnotation.content;
		if(regex.test(input)) {
			regex.lastIndex = 0;
			var matches = [];
			var match;
			while((match = regex.exec(input)) !== null) {
				if(match[0] === "") { 
					regex.lastIndex += 1 ;
				}
				else {
					matches.push({result: match, lastIndex: regex.lastIndex});
				}
			}
			for (var i=0; i < matches.length; i++) {
				var match = matches[i].result;
				var id = match[1];
				var name = match[2];
				
				if (id.indexOf('PLAN') === 0) {
					var exists = false;
					for (var j=0; j < newAnnotation.planref.length; j++) {
						if (newAnnotation.planref[j].id === id.substring(4)) {
							exists = true;
							break;
						}
					};
					if (!exists) {
						var plan = {};
						plan.alias = name;
						plan.id = id.substring(4);		
						if (id.indexOf('PLAN-') === 0) {
							// new plan
							for (var j = 0; j < thisCtrl.newPlans.length; j++) {
								var feature = thisCtrl.newPlans[j];
								if (plan.id == feature.attributes.id) {
									var projWords = GeoAnnotator.MapPanelCtrl.map.projection.getCode().split(":");
									plan.srid = projWords[projWords.length - 1];
									plan.shape = new OpenLayers.Format.WKT().write(feature);
									newAnnotation.planref.push(plan);
									break;
								}
							}
						}
						else {
							// existing plan
							// allow annotation from other group/manuscript
							newAnnotation.planref.push(plan);
						}
					}
				}
				else if (id.indexOf('POST') === 0) {
					// reference
					var exists = false;
					for (var j=0; j < newAnnotation.postref.length; j++) {
						if (newAnnotation.postref[j] === id.substring(4)) {
							exists = true;
							break;
						}
					};
					if (!exists) {				
						newAnnotation.postref.push(id.substring(4));
					// below
						var currAnnotationInfo = GeoAnnotator.AnnotationInfoPanelCtrl.currAnnotationInfo;
						for (var k = 0; k < currAnnotationInfo.planref.length; k++) {
							var plan = currAnnotationInfo.planref[k];
							var exists = false;
							for (var j = 0; j < newAnnotation.planref.length; j++) {
								if (newAnnotation.planref[j].id == plan.id)
								exists = true;
								break; 
							}
							if (!exists) {
								newAnnotation.planref.push(plan);
							}
						
							
						}
						// above
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

		// 5. plans
		//thisCtrl.planStore.removeAll();

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
			// reset the new plans array
			
			thisCtrl.newPlans = [];
			GeoAnnotator.currPlanId = '0';

			GeoAnnotator.currAnnotationId = submitState.data.id;

			// update controls		
			//GeoAnnotator.TimelinePanelCtrl.update();
			GeoAnnotator.AnnotationInfoPanelCtrl.update();
			GeoAnnotator.ContributePanelCtrl.update();
			var currParams = {};
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
	newPlanVectors : null,
	annotationDistVectors : null,
	// styles
	planStyle : null,
	newplanStyle: null,
	// controls
	navigationControl : null,
	modifyNewPlanControl : null,
	selectPlanControl: null,
	drawPlanControl : null,
	
	// feature when hovering
	hoverFeature : null,
	// map context menu
	contextMenu : null,

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

		if (thisCtrl.postClaimWindow) {
			thisCtrl.postClaimWindow.close();
			thisCtrl.postClaimWindow = null;
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
							id:'add-plan-ctx',
							iconCls:'add-plan-icon',
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
							id:'delete-plan-ctx',
							iconCls:'delete-plan-icon',
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
							id:'modify-plan-ctx',
							iconCls:'modify-plan-icon',
							text:'Modify',
							scope: thisCtrl,
							handler:function(){
								var thisCtrl = GeoAnnotator.MapPanelCtrl;
								if (thisCtrl.hoverFeature !== null) {
									thisCtrl.setModifyMode();
									thisCtrl.modifyNewPlanControl.selectControl.select(thisCtrl.hoverFeature);
								}
							}
						});
					}; 
				
				}
				else {
					thisCtrl.contextMenu.add({
					id:'draw-polygon-ctx',
					iconCls:'draw-plan-icon',
					text:'Draw polygon',
					scope: thisCtrl,
					handler:function(){
						var thisCtrl = GeoAnnotator.MapPanelCtrl;
						thisCtrl.setDrawMode('polygon');
					}
					});
					thisCtrl.contextMenu.add({
					id:'draw-line-ctx',
					iconCls:'draw-plan-icon',
					text:'Draw line',
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
		
		thisCtrl.planStyle = new OpenLayers.StyleMap({
			'default': new OpenLayers.Style({
				strokeColor: "#EE4F44",
				strokeOpacity: 1,
				strokeWidth: 2,
				fillColor: "#EE4F44",
				fillOpacity: 0
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
				//strokeColor: 'blue',
				//strokeOpacity: 0,
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
		default_style.fillOpacity = 1.0;
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
		
		thisCtrl.newplanStyle = new OpenLayers.StyleMap({
			'default': default_style,
			'select': select_style,
			'hover': hover_style
		});
		thisCtrl.loadToolbar();
	}, 
	
	update: function(params) {
		var thisCtrl = GeoAnnotator.MapPanelCtrl;
		var currParams = {};
		if (params && params !== null && params !== {}) {
			currParams = params;
		}
		else {
			if (GeoAnnotator.currUserId != '0'){
				currParams.userId = GeoAnnotator.currUserId;	
			} 
			// if (GeoAnnotator.currAnnotationId != '0') {
			// 	currParams.annotationId = GeoAnnotator.currAnnotationId;
			// }			
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
				thisCtrl.loadPlans();
				thisCtrl.loadControls();
				thisCtrl.updateMap();
				//if (GeoAnnotator.currAnnotationId != '0') {
				//	thisCtrl.update();
				//}
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
		// highlight plans
		if (GeoAnnotator.currPlanId != '0') {
			thisCtrl.moveToFeature(GeoAnnotator.currPlanId);
		}
		else if (thisCtrl.currMapInfo.plans != null) {
			for (var i = 0; i < thisCtrl.currMapInfo.plans.length; i++) {
				var plan = thisCtrl.currMapInfo.plans[i];
				for (var i=0; i < thisCtrl.annotationVectors.features.length; i++) {
					var feature = thisCtrl.annotationVectors.features[i];
					if (feature.attributes.id === plan.id) {
						thisCtrl.selectPlanControl.highlight(feature);						
					}
					else {
						thisCtrl.selectPlanControl.unhighlight(feature);
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
	
	loadPlans : function () {
		var thisCtrl = GeoAnnotator.MapPanelCtrl;
		//OpenLayers.Feature.Vector.style['default']['strokeWidth'] = '2';
		var annotationVector = null;
		var wktParser = new OpenLayers.Format.WKT();
		
		thisCtrl.annotationVectors = new OpenLayers.Layer.Vector(
			'Annotation Plans', {styleMap: thisCtrl.planStyle, displayInLayerSwitcher: true}
		);		
		thisCtrl.map.addLayer(this.annotationVectors);
		
		// load plans
		if (thisCtrl.currMapInfo.plans != null) {
			for (var i = 0; i < thisCtrl.currMapInfo.plans.length; i++) {
				var plan = thisCtrl.currMapInfo.plans[i];
				
				var feature = wktParser.read(plan.shape);
				origin_prj = new OpenLayers.Projection("EPSG:" + plan.srid);
				feature.geometry.transform(origin_prj, thisCtrl.map.projection);
				feature.attributes = {};
				feature.attributes.id = plan.id;
				if (plan.refCount != null) {
					feature.attributes.pointRadius = plan.refCount * 5;
					feature.attributes.refCount = plan.refCount;
				}
				if (plan.alias != null) {
					feature.attributes.alias = plan.alias;
				}
				thisCtrl.annotationVectors.addFeatures([feature]);
			}	
		}
		
		
		thisCtrl.newPlanVectors = new OpenLayers.Layer.Vector('New Plans', {styleMap: thisCtrl.newplanStyle, displayInLayerSwitcher: false});
		thisCtrl.newPlanVectors.addFeatures(GeoAnnotator.ContributePanelCtrl.newPlans);
		thisCtrl.map.addLayer (this.newPlanVectors);
		
		
	},
	
	loadControls : function() {
		var thisCtrl = GeoAnnotator.MapPanelCtrl;
		thisCtrl.map.addControl(new OpenLayers.Control.PanZoomBar());
		thisCtrl.map.addControl(new OpenLayers.Control.LayerSwitcher());
		thisCtrl.map.addControl(new OpenLayers.Control.Attribution());
		
		thisCtrl.navigationControl = new OpenLayers.Control.Navigation();
		thisCtrl.map.addControl(thisCtrl.navigationControl);

		thisCtrl.selectPlanControl = new OpenLayers.Control.SelectFeature(
			[thisCtrl.annotationVectors,thisCtrl.newPlanVectors],
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
		thisCtrl.map.addControl(thisCtrl.selectPlanControl);
		
		thisCtrl.modifyNewPlanControl = new OpenLayers.Control.ModifyFeature(thisCtrl.newPlanVectors);
		thisCtrl.newPlanVectors.events.register("afterfeaturemodified", 
			thisCtrl.newPlanVectors, 
			thisCtrl.onModificationEnd
		);
		//thisCtrl.modifyNewPlanControl.onDeletingStart = thisCtrl.onFeatureDeleted;
		thisCtrl.map.addControl(thisCtrl.modifyNewPlanControl);
				
		thisCtrl.drawPlanControl = {
			polygon: new OpenLayers.Control.DrawFeature(
			thisCtrl.newPlanVectors, 
			OpenLayers.Handler.Polygon, 
			{
				featureAdded:function(feature) { 
				feature.state = OpenLayers.State.INSERT; 
				thisCtrl.onFeatureAdded(feature);
				}
			}
			),
			line: new OpenLayers.Control.DrawFeature(
			thisCtrl.newPlanVectors, 
			OpenLayers.Handler.Path, 
			{
				featureAdded:function(feature) { 
				feature.state = OpenLayers.State.INSERT; 
				thisCtrl.onFeatureAdded(feature);
				}
			}
			)
		};
		for (var key in thisCtrl.drawPlanControl) {
			thisCtrl.map.addControl(thisCtrl.drawPlanControl[key]);    	
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
		}; 


		tbar.doLayout();
	},
	
	getGMapType : function(type) {
		var newGMapType;
		switch(type){
//		case 'G_NORMAL_MAP':
//			newGMapType = G_NORMAL_MAP;
//			newGMapType.toString = function () {return 'G_NORMAL_MAP';};
//			break;
//		case 'G_SATELLITE_MAP':
//			newGMapType = G_SATELLITE_MAP;
//			newGMapType.toString = function () {return 'G_SATELLITE_MAP';};
//			break;
//		case 'G_HYBRID_MAP':
//			newGMapType = G_HYBRID_MAP;
//			newGMapType.toString = function () {return 'G_HYBRID_MAP';};
//			break;
//		case 'G_PHYSICAL_MAP':
//			newGMapType = G_PHYSICAL_MAP;
//			newGMapType.toString = function () {return 'G_PHYSICAL_MAP';};
//			break;
//		case 'G_CUSTOM_CENTREIMAGERY_MAP':
//			var tileCentreImagery= new GTileLayer(new GCopyrightCollection(""),0,19, {
//				tileUrlTemplate: 'http://www.apps.geovista.psu.edu/tilecache/tilecache.py/1.0.0/centreimageryjpeg/{Z}/{X}/{Y}.jpg?type=google',
//				isPng:false});
//			newGMapType = new GMapType([tileCentreImagery,G_HYBRID_MAP.getTileLayers()[1]], new GMercatorProjection(20), "Centre Imagery with Google Labels", {shortName:"CIL"});
//			newGMapType.toString = function () {return 'G_CUSTOM_CENTREIMAGERY_MAP';};
//			break;
//		default:
//			newGMapType = G_NORMAL_MAP;
//			newGMapType.toString = function () {return 'G_NORMAL_MAP';};
//			break;
		case 'G_NORMAL_MAP':
			newGMapType = google.maps.MapTypeId.ROADMAP;
			break;
		case 'G_SATELLITE_MAP':
			newGMapType = google.maps.MapTypeId.SATELLITE;
			break;
		case 'G_HYBRID_MAP':
			newGMapType = google.maps.MapTypeId.HYBRID;
			break;
		case 'G_PHYSICAL_MAP':
			newGMapType = google.maps.MapTypeId.TERRAIN;
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
		if (thisCtrl.selectPlanControl) {
			thisCtrl.selectPlanControl.activate();
		}
		if (thisCtrl.drawPlanControl) {
			for (var key in thisCtrl.drawPlanControl) {
			thisCtrl.drawPlanControl[key].deactivate();
			}
		}
		if (thisCtrl.modifyNewPlanControl) {
			thisCtrl.modifyNewPlanControl.deactivate();					
		}
	},

	setDrawMode : function(mode) {
		var thisCtrl = GeoAnnotator.MapPanelCtrl;
		if (thisCtrl.navigationControl) {
			thisCtrl.navigationControl.deactivate();	
		}
		if (thisCtrl.selectPlanControl) {
			thisCtrl.selectPlanControl.deactivate();
		}
		if (thisCtrl.drawPlanControl) {
			for (var key in thisCtrl.drawPlanControl) {
			if (mode == key) {
				thisCtrl.drawPlanControl[key].activate();
			}
			}
		}
		if (thisCtrl.modifyNewPlanControl) {
			thisCtrl.modifyNewPlanControl.deactivate();					
		}		
	},
	
	setModifyMode : function() {
		var thisCtrl = GeoAnnotator.MapPanelCtrl;
		if (thisCtrl.navigationControl) {
			thisCtrl.navigationControl.activate();	
		}
		if (thisCtrl.selectPlanControl) {
			thisCtrl.selectPlanControl.deactivate();
		}
		if (thisCtrl.drawPlanControl) {
			for (var key in thisCtrl.drawPlanControl) {
			thisCtrl.drawPlanControl[key].deactivate();
			}
		}
		if (thisCtrl.modifyNewPlanControl) {
			thisCtrl.modifyNewPlanControl.activate();					
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
		var name = '[PLAN' + feature.attributes.id + ']';
		var id = feature.attributes.id;		
		GeoAnnotator.ContributePanelCtrl.addPlanToReference(id, name);
				
		/*
		var records = GeoAnnotator.ContributePanelCtrl.planStore.query('id',id);
		for (var i = 0; i < records.length; i++){
			GeoAnnotator.ContributePanelCtrl.planStore.remove(records.get(i));
		}
	
		GeoAnnotator.ContributePanelCtrl.planStore.insert(0,new Ext.data.Record({id: id, type: type, name: name}));
		*/
	},
	
	removeFeatureFromReference : function(feature) {
		/*
		var records = GeoAnnotator.ContributePanelCtrl.planStore.query('id',feature.attributes.id);
		for (var i = 0; i < records.length; i++){
			GeoAnnotator.ContributePanelCtrl.planStore.remove(records.get(i));
		}
		*/
		GeoAnnotator.ContributePanelCtrl.removePlanFromReference(feature.attributes.id);
	},
	
	deleteFeature : function (feature){
		var thisCtrl = GeoAnnotator.MapPanelCtrl;
		for (var i = 0; i < GeoAnnotator.ContributePanelCtrl.newPlans.length; i++){
			if (GeoAnnotator.ContributePanelCtrl.newPlans[i].attributes.id == feature.attributes.id){
				GeoAnnotator.ContributePanelCtrl.removePlanFromReference(feature.attributes.id);
				GeoAnnotator.ContributePanelCtrl.newPlans.splice(i,1);
				thisCtrl.newPlanVectors.destroyFeatures([feature], {silent: true});
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

	moveToFeature : function (featureId) {
		var thisCtrl = GeoAnnotator.MapPanelCtrl;
		for (var i=0; i < thisCtrl.annotationVectors.features.length; i++) {
			var feature = thisCtrl.annotationVectors.features[i];
			if (feature.attributes.id === featureId) {
				var lon = feature.geometry.getCentroid().x;
				var lat = feature.geometry.getCentroid().y;
				thisCtrl.map.panTo(new OpenLayers.LonLat(lon, lat));
				thisCtrl.selectPlanControl.unselectAll();
				thisCtrl.selectPlanControl.select(feature);
				return;
			};
		};
	},
	
	onFeatureAdded : function (feature){
		var thisCtrl = GeoAnnotator.MapPanelCtrl;
		// use minus to distinguish new plans with existing ones
		feature.attributes.id = '-'+GeoAnnotator.ContributePanelCtrl.newPlans.length;
		feature.attributes.alias = 'new plan';
		GeoAnnotator.ContributePanelCtrl.newPlans.push(feature);
		if (GeoAnnotator.ContributePanelCtrl.containerPanel.collapsed === false) {
			thisCtrl.addFeatureToReference(feature);
		}
		/*
		var tbar = GeoAnnotator.ContributePanelCtrl.containerPanel.getTopToolbar();
		tbar.items.get('contribute-toolbox-group').items.get('drawPlan-btn').toggle(false);
		*/
		thisCtrl.setNavigationMode();		
	},
					
	onClickFeature : function (feature){
		if (feature){
			var thisCtrl = GeoAnnotator.MapPanelCtrl;
			// get the annotatios based on the plan id
			if (feature.attributes.id.indexOf('-') === 0) {
				return;
			}; 
			GeoAnnotator.currPlanId = feature.attributes.id;
			
			if (parseInt(feature.attributes.refCount) === 1) {
				Ext.Ajax.request({
					url: GeoAnnotator.baseUrl + 'annotations/',
					//method: 'GET',
					params: { userId: GeoAnnotator.currUserId, forumId: GeoAnnotator.currForumId, planId: GeoAnnotator.currPlanId, start:0, limit:1},
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
				GeoAnnotator.PostClaimWindowCtrl.showWindow();
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
};

GeoAnnotator.PostClaimWindowCtrl = 
{
	postClaimWindow: null,
	annotationListStore: null,
	annotationListDataView: null,
	claimListPanel: null,
	claimListStore: null,
	claimPanelToolBar: null,
	newClaimPanel: null,

	// register : function (postClaimWindow) {
	// 	this.postClaimWindow = postClaimWindow;
	// 	this.postListPanel = this.postClaimWindow.get('post-panel');
	// 	this.claimListPanel = this.postClaimWindow.get('claim-panel');
	// },
	init: function() {
		var thisCtrl = GeoAnnotator.PostClaimWindowCtrl;
		// create the annotation list window if not open
		thisCtrl.annotationListStore = new Ext.data.JsonStore({
			root: 'annotations',
			totalProperty: 'totalCount',
			idProperty: 'id',
			fields: [
			'id', 'userName', 'timeCreated',
			'excerpt'],
			proxy: new Ext.data.HttpProxy ({
				url: GeoAnnotator.baseUrl + 'annotations/'
			}),
			baseParams: {userId: GeoAnnotator.currUserId, forumId: GeoAnnotator.currForumId, start:0, limit:10}
		});

		thisCtrl.annotationListDataView =  new Ext.DataView({
			tpl: new Ext.XTemplate(
				'<tpl for=".">',
				'<div class="list-item">',
				'<b>Post {id}</b>: {excerpt}<br>',
				'by <b>{userName}</b> on {timeCreated:date("m/d/Y")} at {timeCreated:date("g:i:s A")}',
				'</div></tpl>'
			),
			store: thisCtrl.annotationListStore,
			itemSelector: 'div.list-item',
			multiSelect: true,
			selectedClass: 'list-item-selected', 
			overClass:'list-item-over',
			emptyText : 'No Annotations'
			//plugins: new Ext.DataView.DragSelector({dragSafe:false})
		});
		thisCtrl.annotationListDataView.on('click',thisCtrl.onAnnotationListItemClick);
		thisCtrl.annotationListDataView.on('contextmenu', thisCtrl.onAnnotationListContextMenu);

		thisCtrl.claimListStore = new Ext.data.JsonStore({
			root: 'claims',
			totalProperty: 'totalCount',
			idProperty: 'id',
			fields: [
			'id', 'userName', 'excerpt',
			{name: 'timeCreated', type: 'date'},
			'content'],
			proxy: new Ext.data.HttpProxy ({
				url: GeoAnnotator.baseUrl + 'claims/'
			}),
			baseParams: {userId: GeoAnnotator.currUserId, forumId: GeoAnnotator.currForumId}
		});

		thisCtrl.claimListPanel = new Ext.Panel({
			id: 'claim-list-panel',
    		bodyStyle: 'padding: 0 1 0 1;',
    		layout : 'accordion',
    		layoutConfig : {
		        titleCollapse: true,
		        animate: false,
		        fill : false,
		        hideCollapseTool: true,
		    },
    	});

		thisCtrl.claimPanelToolBar = new Ext.Toolbar({
			id: 'claim-panel-toolbar',
        	items: [{
        		text: 'New Claim',
        		id: 'new-claim-btn',
        		handler: thisCtrl.onNewClaimClick
        	},{
        		text: 'Refresh',
        		id: 'refresh-claim-btn',
        		handler: function() {
    				thisCtrl.claimListPanel.removeAll();
					thisCtrl.claimListStore.load({params:{userId: GeoAnnotator.currUserId, forumId: GeoAnnotator.currForumId}, callback: thisCtrl.onClaimLoadSuccess});
					thisCtrl.claimPanelToolBar.getComponent('new-claim-btn').enable();
        		}
        	}]
		});

		thisCtrl.postClaimWindow = new Ext.Window({
		    renderTo: document.body,
		    width: 700,
		    height: 500,
		    title: 'Posts and Claims',
		    layout: 'column',
		    // autoScroll: true,
		    closeAction : 'hide',
		    items: [{
		        // xtype: 'panel' implied by default
		        columnWidth: .5,
		        id: 'post-panel',
		        items : [new Ext.PagingToolbar({
						store: thisCtrl.annotationListStore,
						pageSize: 10,
						displayInfo: true,
						displayMsg: 'Posts {0} - {1} of {2}',
						emptyMsg: "No posts to display"
					}),
					thisCtrl.annotationListDataView
				],
		        unstyled : true
		    },{
		        columnWidth: .5,
		        id: 'claim-panel',
		        unstyled : false,
		        autoScroll: true,
		        items : [thisCtrl.claimPanelToolBar, thisCtrl.claimListPanel]
		    }]
		});

		thisCtrl.claimPanelToolBar.getComponent('new-claim-btn').enable();
	},

	showWindow : function() {
		var thisCtrl = GeoAnnotator.PostClaimWindowCtrl;
		thisCtrl.annotationListStore.removeAll();
		thisCtrl.annotationListStore.load({params:{userId: GeoAnnotator.currUserId, forumId: GeoAnnotator.currForumId, planId: GeoAnnotator.currPlanId, start:0, limit:10}});
		thisCtrl.claimListStore.removeAll();
		thisCtrl.claimListPanel.removeAll();
		thisCtrl.claimListStore.load({params:{userId: GeoAnnotator.currUserId, forumId: GeoAnnotator.currForumId}, callback: thisCtrl.onClaimLoadSuccess});
		thisCtrl.postClaimWindow.show();
	},

	onClaimLoadSuccess : function() {
		var thisCtrl = GeoAnnotator.PostClaimWindowCtrl;
		for (var i = 0; i < thisCtrl.claimListStore.getTotalCount(); i++) {
			var data = thisCtrl.claimListStore.getAt(i);
			var content = data.get('content');
			var claimId = data.get('id');
			var excerpt = data.get('excerpt');
			var timeCreated = data.get('timeCreated');
			var userName = data.get('userName');
			var currFormPanel = new Ext.FormPanel({
				labelAlign: 'top',
				border: false,
				autoScroll: true,
				autoHeight: true,
				id: 'claimPanel' + claimId,
				items : [{
        			xtype: 'htmleditor',
        			id : 'claimContent' + claimId,
        			name: 'claimContent' + claimId,
        			enableFont: false,
        			enableLists: false,
        			enableAlignments: false,
        			height: 150,
        			autoWidth: true,
        			anchor: '100%',
        			value : content
        		}],
        		buttons: [
        		{
        			text : 'Delete',
	    			id: 'claim' + claimId + '-delete-btn',
	    			handler: function() {
	    				var me = this;
	    				Ext.Msg.confirm('Confirm', 'Do you want to delete this claim?', function (btn, text) {
	    					if (btn == 'yes') {
			    				var buttonId = me.id;
			    				var claimId;
			    				var regex = /^claim([0-9]+)-delete-btn$/;
			    				if (regex.test(buttonId)) {
			    					claimId = regex.exec(buttonId)[1];
			    				}
	    						Ext.Ajax.request({
									url: GeoAnnotator.baseUrl + 'claim/',
									success: function() {
					    				// refresh claim panel
					    				thisCtrl = GeoAnnotator.PostClaimWindowCtrl;
					    				thisCtrl.claimListPanel.removeAll();
										thisCtrl.claimListStore.load({params:{userId: GeoAnnotator.currUserId, forumId: GeoAnnotator.currForumId}, callback: thisCtrl.onClaimLoadSuccess});
									},
									failure: function() {
										alert('fail to delete claim!');
									},
									params: {
										'id': claimId,
										'content': ''
									}
								});
	    					}
	    				});
	    			}
        		},{
        			text : 'Save',
        			id: 'claim' + claimId + '-save-btn',
        			handler: thisCtrl.onClaimEdit
        		}]
			})
			// add this panel to the accordion
			thisCtrl.claimListPanel.add({
				title: '<b>Claim ' + claimId + ':</b> ' + excerpt + '<br>' + 'by <b>' + userName + '</b> on ' + Ext.util.Format.date(timeCreated) + ' at ' + Ext.util.Format.date(timeCreated, 'g:i:s A'),
				items: [currFormPanel]
			});
		}
		thisCtrl.claimListPanel.doLayout();
	},

	onNewClaimClick : function() {
		var thisCtrl = GeoAnnotator.PostClaimWindowCtrl;
		// temporarily disable the 'new claim' button
		thisCtrl.claimPanelToolBar.getComponent('new-claim-btn').disable();
		// get the post references through the dataview list selection
		var selectedAnnotations = thisCtrl.annotationListDataView.getSelectedRecords();
		var postref = '&nbsp;';
		for (var i = 0; i < selectedAnnotations.length; i++) {
			postref += '[POST' + selectedAnnotations[i].id + ']'
		}
		thisCtrl.newClaimPanel = new Ext.FormPanel({
			labelAlign: 'top',
			border: false,
			autoScroll: true,
			autoHeight: true,
			id: 'new-claim-panel',
			items : [{
    			xtype: 'htmleditor',
    			id : 'newClaimContent',
    			name: 'newClaimContent',
    			enableFont: false,
    			enableLists: false,
    			enableAlignments: false,
    			height: 150,
    			autoWidth: true,
    			anchor: '100%',
    			value: postref
    		}],
    		buttons: [
    		{
    			text : 'Discard',
    			id: 'new-claim-delete-btn',
    			handler: function() {
    				Ext.Msg.confirm('Confirm', 'Do you want to discard the new claim?', function (btn, text) {
    					if (btn == 'yes') {
		    				// re-enable the 'new claim' button
		    				var thisCtrl = GeoAnnotator.PostClaimWindowCtrl;
		    				thisCtrl.claimPanelToolBar.getComponent('new-claim-btn').enable();
		    				// refresh claim panel
		    				thisCtrl.claimListPanel.removeAll();
							thisCtrl.claimListStore.load({params:{userId: GeoAnnotator.currUserId, forumId: GeoAnnotator.currForumId}, callback: thisCtrl.onClaimLoadSuccess});
    					}
    				});
    			}
    		},{
    			text : 'Submit',
    			id: 'new-claim-save-btn',
    			handler: thisCtrl.onClaimSubmit
    		}]
		});

		thisCtrl.claimListPanel.add({
			title: '<b>New Claim</b>',
			id: 'new-claim',
			items: [thisCtrl.newClaimPanel]
		});
		thisCtrl.claimListPanel.doLayout();
		thisCtrl.claimListPanel.getComponent('new-claim').expand();
		// thisCtrl.claimListPanel.getComponent('new-claim').getComponent('new-claim-panel').getComponent('newClaimContent').focus();
	},

	onClaimSubmit : function() {
		var thisCtrl = GeoAnnotator.PostClaimWindowCtrl;
		// add a new claim
		var newClaim = {};
		newClaim.id = -1;
		newClaim.content = thisCtrl.newClaimPanel.getForm().findField('newClaimContent').getValue();
		if (newClaim.content.length == 0) {
			Ext.Msg.alert('Error', 'The content of the claim cannot be empty');
			return;
		}
		newClaim.userId = GeoAnnotator.currUserId;
		newClaim.forumId = GeoAnnotator.currForumId;
		newClaim.timeCreated = new Date().toGMTString();
		// newClaim.value = ?
		newClaim.postref = [];
		newClaim.claimref = [];
		newClaim.planref = [];
		newClaim.optionref = [];
		newClaim.issueref = [];

		// parse all the references
		var regex = /\[([POST,CLAIM,PLAN,OPTION,ISSUE]+)([0-9]+)\]/gi; 
		var input = newClaim.content;
		if(regex.test(input)) {
			regex.lastIndex = 0;
			var matches = [];
			var match;
			while((match = regex.exec(input)) !== null) {
				if(match[0] === "") { 
					regex.lastIndex += 1 ;
				}
				else {
					matches.push({result: match, lastIndex: regex.lastIndex});
				}
			}
			for (var i=0; i < matches.length; i++) {
				var type = matches[i].result[1];
				var itemId = matches[i].result[2];
				switch (type) {
					case 'POST':
						newClaim.postref.push(itemId);
						break;
					case 'CLAIM':
						newClaim.claimref.push(itemId);
						break;
					case 'PLAN':
						newClaim.planref.push(itemId);
						break;
					case 'OPTION':
						newClaim.optionref.push(itemId);
						break;
					case 'ISSUE':
						newClaim.issueref.push(itemId);
						break;
					default:
						alert('failed to add claim: invalid reference type: ' + type);
						return;
				}
			}
			// retain unique values
			newClaim.postref = GeoAnnotator.Util.unique(newClaim.postref);
			newClaim.claimref = GeoAnnotator.Util.unique(newClaim.claimref);
			newClaim.planref = GeoAnnotator.Util.unique(newClaim.planref);
			newClaim.optionref = GeoAnnotator.Util.unique(newClaim.optionref);
			newClaim.issueref = GeoAnnotator.Util.unique(newClaim.issueref);
		}

		Ext.Ajax.request({
			url: GeoAnnotator.baseUrl + 'claim/',
			success: function() {
				// refresh the claim panel
			    thisCtrl.claimListPanel.removeAll();
				thisCtrl.claimListStore.load({params:{userId: GeoAnnotator.currUserId, forumId: GeoAnnotator.currForumId}, callback: function() {
						thisCtrl.onClaimLoadSuccess();
						// expand the claim just added
						var currClaimCnt = thisCtrl.claimListStore.getCount();
						thisCtrl.claimListPanel.getComponent(currClaimCnt - 1).expand();
						// re-enable the new claim button
						thisCtrl.claimPanelToolBar.enable();
					}
				});
				// expand the last one
				//thisCtrl.claimListPanel.getComponent('new-claim').expand();
			},
			failure: function() {
				alert('Failed to add new claim!');
			},
			params: newClaim
		});
	},

	onClaimEdit: function() {
		var thisCtrl = GeoAnnotator.PostClaimWindowCtrl;
		// edit a claim
		var buttonId = this.id;
		var claimId;
		var regex = /^claim([0-9]+)-save-btn$/;
		if (regex.test(buttonId)) {
			claimId = regex.exec(buttonId)[1];
		}
		var currFormPanel = thisCtrl.claimListPanel.find('id', 'claimPanel' + claimId)[0];
		var content = currFormPanel.getForm().findField('claimContent' + claimId).getValue();

		var newClaim = {};
		newClaim.id = claimId;
		newClaim.content = content;
		if (newClaim.content.length == 0) {
			Ext.Msg.alert('Error', 'The content of the claim cannot be empty');
			return;
		}
		newClaim.userId = GeoAnnotator.currUserId;
		newClaim.forumId = GeoAnnotator.currForumId;
		newClaim.timeCreated = new Date().toGMTString();
		// newClaim.value = ?
		newClaim.postref = [];
		newClaim.claimref = [];
		newClaim.planref = [];
		newClaim.optionref = [];
		newClaim.issueref = [];

		// parse all the references
		var regex = /\[([POST,CLAIM,PLAN,OPTION,ISSUE]+)([0-9]+)\]/gi; 
		var input = newClaim.content;
		if(regex.test(input)) {
			regex.lastIndex = 0;
			var matches = [];
			var match;
			while((match = regex.exec(input)) !== null) {
				if(match[0] === "") { 
					regex.lastIndex += 1 ;
				}
				else {
					matches.push({result: match, lastIndex: regex.lastIndex});
				}
			}
			for (var i=0; i < matches.length; i++) {
				var type = matches[i].result[1];
				var itemId = matches[i].result[2];
				switch (type) {
					case 'POST':
						newClaim.postref.push(itemId);
						break;
					case 'CLAIM':
						newClaim.claimref.push(itemId);
						break;
					case 'PLAN':
						newClaim.planref.push(itemId);
						break;
					case 'OPTION':
						newClaim.optionref.push(itemId);
						break;
					case 'ISSUE':
						newClaim.issueref.push(itemId);
						break;
					default:
						alert('failed to add claim: invalid reference type: ' + type);
						return;
				}
			}
			// retain unique values
			newClaim.postref = GeoAnnotator.Util.unique(newClaim.postref);
			newClaim.claimref = GeoAnnotator.Util.unique(newClaim.claimref);
			newClaim.planref = GeoAnnotator.Util.unique(newClaim.planref);
			newClaim.optionref = GeoAnnotator.Util.unique(newClaim.optionref);
			newClaim.issueref = GeoAnnotator.Util.unique(newClaim.issueref);
		}

		Ext.Ajax.request({
			url: GeoAnnotator.baseUrl + 'claim/',
			success: function() {
				// refresh the claim panel
			    thisCtrl.claimListPanel.removeAll();
				thisCtrl.claimListStore.load({params:{userId: GeoAnnotator.currUserId, forumId: GeoAnnotator.currForumId}, callback: function() {
						thisCtrl.onClaimLoadSuccess();
						// expand the claim just added
						//var currClaimCnt = thisCtrl.claimListStore.getCount();
						//thisCtrl.claimListPanel.getComponent(currClaimCnt - 1).expand();
						// re-enable the new claim button
						//thisCtrl.postClaimWindow.getComponent('claim-panel').getComponent('claim-panel-toolbar').getComponent('new-claim-btn').enable();
					}
				});
				// expand the last one
				//thisCtrl.claimListPanel.getComponent('new-claim').expand();
			},
			failure: function() {
				alert('Failed to edit claim!');
			},
			params: newClaim
		});
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

	onAnnotationListContextMenu: function(dataView, index, node, e) {
		var thisCtrl = GeoAnnotator.PostClaimWindowCtrl;
		if (!thisCtrl.postContextMenu) {
			thisCtrl.postContextMenu = new Ext.menu.Menu({
				id: 'post-list-ctx',
				items: [{
					id: 'post-list-add-reference',
					text: 'Add to reference',
					handler: function() {
						var thisCtrl = GeoAnnotator.PostClaimWindowCtrl;
					}
				}]
			});
		}
	}
};

GeoAnnotator.AnnotationInfoPanelCtrl = 
{
	//containerPanel
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
	currCode : {},
	// code window
	codeWindow : null,
	codePanel : null,
	//codeSchemeStore : null,

	// spaceTree styles
	node_height : 30,
	node_width : 100,
	min_spacing : 10.0,	
	
	currentNodeStyle : {
		"default" : {
			fill: "#00BFFF", 
			stroke: "#99CCFF", 
			"fill-opacity": 0.6, 
			"stroke-width": 2
		},
		"hover" : {
			fill: "#00BFFF", 
			stroke: "#0E2038", 
			"fill-opacity": 0.8, 
			"stroke-width": 3
		},
		"text" : {
			stroke:"#003300",
			fill: "#003300",
			"font-size": 10,
			"font-family": "Arial, Helvetica, sans-serif"
			
		},
		"blanket" : {stroke: "none", fill: "#fff", "opacity": 0.0}
	},
		
	parentNodeStyle : {
		"default" : {
			fill: "#00BFFF", 
			stroke: "#1C3F70", 
			"fill-opacity": 0.6, 
			"stroke-width": 2
		},
		"hover" : {
			fill: "#00BFFF", 
			stroke: "#0E2038", 
			"fill-opacity": 0.8, 
			"stroke-width": 3
		},
		"text" : {
			stroke:"#003300",
			fill: "#003300",
			"font-size": 10,
			"font-family": "Arial, Helvetica, sans-serif"
		},
		"blanket" : {stroke: "none", fill: "#fff", "opacity": 0.0}
	},

	childNodeStyle : {
		"default" : {
			fill: "#00BFFF", 
			stroke: "#3B7565", 
			"fill-opacity": 0.6, 
			"stroke-width": 2
		},
		"hover" : {
			fill: "#00BFFF", 
			stroke: "#0E2038", 
			"fill-opacity": 0.8, 
			"stroke-width": 3
		},
		"text" : {
			stroke:"#003300",
			fill: "#003300",
			"font-size": 10,
			"font-family": "Arial, Helvetica, sans-serif"
		},
		"blanket" : {stroke: "none", fill: "#fff", "opacity": 0.0}
	},
	
	facilitator_currentNodeStyle : {
		"default" : {
			fill: "#DC143C", 
			stroke: "#CCCC99", 
			"fill-opacity": 0.6, 
			"stroke-width": 2
		},
		"hover" : {
			fill: "#DC143C", 
			stroke: "#003DF5", 
			"fill-opacity": 0.8, 
			"stroke-width": 3
		},
		"text" : {
			stroke:"#000",
			fill: "#000",
			"font-size": 10,
			"font-family": "Arial, Helvetica, sans-serif"
			
		},
		"blanket" : {stroke: "none", fill: "#fff", "opacity": 0.0}
	},
		
	facilitator_parentNodeStyle : {
		"default" : {
			fill: "#DC143C", 
			stroke: "#003DF5", 
			"fill-opacity": 0.6, 
			"stroke-width": 2
		},
		"hover" : {
			fill: "#DC143C", 
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

	facilitator_childNodeStyle : {
		"default" : {
			fill: "#DC143C", 
			stroke: "#003DF5", 
			"fill-opacity": 0.6, 
			"stroke-width": 2
		},
		"hover" : {
			fill: "#DC143C", 
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
		
		var html = '<div class="default-info">Here will show the details when you choose an annotation.</div>';	
		
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
			autoScroll: true
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
				'-',*/
				{
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
				},
				'-',
				{
					id: 'code-display-btn',
					text: 'Code',
					tooltip: {title:'Code',text:'Add code to the annotation.'},
					handler: thisCtrl.onCodeClick
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
		}),
		
		
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
				thisCtrl.contextMenu.add({
					id: 'code-display-ctx',
					text: 'Code',
					handler: thisCtrl.onCodeClick
				});
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
		Ext.Ajax.request({
			url: GeoAnnotator.baseUrl + 'code/',
			success: thisCtrl.onLoadCodeSuccess,
			failure: function() {
				alert('failed to get code info!');
			},
			params: {'annotationId': GeoAnnotator.currAnnotationId}
		});
	},
	
	updateAnnotationInfoDisplayPanel : function(){
		//alert("trigger");
		var thisCtrl = GeoAnnotator.AnnotationInfoPanelCtrl;
		var html = '';
		html +='<div id="annotationInfoHeader">On ' + thisCtrl.currAnnotationInfo.timeCreated + ', <b>' + thisCtrl.currAnnotationInfo.userName + '</b> says:</div>';		
		var new_content = thisCtrl.parseAnnotationContent(thisCtrl.currAnnotationInfo.content);
		//var code_content = thisCtrl.parseCodeContent(thisCtrl.currCode.content);
		html += '<div id="annotationInfoContent">' + new_content + '</div>';
		html += '<div id="annotationInfoHeader">Code:</div>'
		html += '<div id="codeContent">';
		if (thisCtrl.currCode.classification == undefined) {
			html += 'No code added.<br>'
		} else {
			html += '<b>Classification: </b>' + thisCtrl.currCode.classification + '<br>';
			html += '<b>Description: </b>' + thisCtrl.currCode.description + '<br>';
			html += '<b>Comment: </b>' + thisCtrl.currCode.comment + '<br>';
		}
		html += '</div>';

		thisCtrl.annotationInfoDisplayPanel.body.update(html);
		ref_links = Ext.query('.ref-link');
		for (var i=0; i < ref_links.length; i++) {
			var ele = Ext.get(ref_links[i]);
			if (ele.id.indexOf('ref-PLAN') === 0) {
				ele.on('click', function(evt, target) {
					var thisCtrl = GeoAnnotator.AnnotationInfoPanelCtrl;
					var featureId = target.id.substring(8);
					for (var i=0; i < thisCtrl.currAnnotationInfo.plans.length; i++) {
						var plan = thisCtrl.currAnnotationInfo.plans[i];
						if (plan.id == featureId) {
							
							GeoAnnotator.currPlanId = plan.id;
							GeoAnnotator.MapPanelCtrl.moveToFeature(featureId);
							
							return;
						};
					};
				});
			}
			else if (ele.id.indexOf('ref-POST') === 0) {
				var annotationId = ele.id.substring(8);
				thisCtrl.addAnnotationTip(annotationId, ele);
				ele.on('click', function(evt, target) {
					var annotationId = target.id.substring(8);
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
			params: {'annotationId':annotationId, 'userId':GeoAnnotator.currUserId, 'forumId': GeoAnnotator.currForumId}
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
	
	updateCodePanel : function() {
		var thisCtrl = GeoAnnotator.AnnotationInfoPanelCtrl;
		if (thisCtrl.currCode.classification == undefined) { // no code available
			thisCtrl.codePanel.getComponent('codeClassification').setValue('None');
			thisCtrl.codePanel.getComponent('codeDescription').setValue('');
			thisCtrl.codePanel.getComponent('codeComment').setValue('');
			thisCtrl.codePanel.getFooterToolbar().getComponent("codeDeleteBtn").setDisabled(true);
			thisCtrl.codePanel.getFooterToolbar().getComponent("codeSubmitBtn").setText("Submit");
		} else { // retrive current code
			thisCtrl.codePanel.getComponent('codeClassification').setValue(thisCtrl.currCode.classification);
			thisCtrl.codePanel.getComponent('codeDescription').setValue(thisCtrl.currCode.description);
			thisCtrl.codePanel.getComponent('codeComment').setValue(thisCtrl.currCode.comment);
			thisCtrl.codePanel.getFooterToolbar().getComponent("codeDeleteBtn").setDisabled(false);
			thisCtrl.codePanel.getFooterToolbar().getComponent("codeSubmitBtn").setText("Update");
		}
	},

	updateReferenceSpaceTreePanel : function() {
	//alert("updateReferenceSpaceTreePanel called");
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
			//alert("buildReferenceSpaceTree");
		thisCtrl.spaceTree = Raphael(thisCtrl.spaceTreeContainer, w, h);
		
		Ext.Ajax.request({
			url: GeoAnnotator.baseUrl + 'threads/',
			success: thisCtrl.onLoadThreadsInfoSuccess,
			failure: function() {
				alert('failed to load tree annotation info!');
			},
			params: {'annotationId':thisCtrl.currAnnotationInfo.id, 'userId':GeoAnnotator.currUserId, 'forumId': GeoAnnotator.currForumId}
		});
	},
	/*
	  params: {
				'userId': GeoAnnotator.currUserId,
				'forumId': GeoAnnotator.currForumId
			}
	*/
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
		//var current_node = thisCtrl.drawThreadNode(threadsInfo, w * 0.5, h * 0.5, width, height, thisCtrl.currentNodeStyle);
		//alert(threadsInfo.current_role);
		var current_node = thisCtrl.drawThreadNode(threadsInfo, w * 0.5, h * 0.5, width, height,
		((threadsInfo.current_role=="member")? thisCtrl.currentNodeStyle:thisCtrl.facilitator_currentNodeStyle),((threadsInfo.current_role=="member")? true:false));
		
		
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
				//parent_node = thisCtrl.drawThreadNode(threadsInfo.parents[i], offset_x, offset_y, width, height, thisCtrl.parentNodeStyle,((threadsInfo.parents[i].parents_role=="member")? true:false));
				
				parent_node = thisCtrl.drawThreadNode(threadsInfo.parents[i], offset_x, offset_y, width, height, ((threadsInfo.parents[i].
				parents_role=="member")? thisCtrl.currentNodeStyle:thisCtrl.facilitator_parentNodeStyle),((threadsInfo.parents[i].
				parents_role=="member")? true:false));
				//alert("parent "+i+"th node is: "+threadsInfo.parents[i].parents_role);
				if(threadsInfo.parents[i].parents_role=="member"||(GeoAnnotator.isResearchModeOn==false&&threadsInfo.parents[i].parents_role!="member"))
				{thisCtrl.drawThreadLink(parent_node, current_node);}
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
				//child_node = thisCtrl.drawThreadNode(threadsInfo.children[i], offset_x, offset_y, width, height, thisCtrl.childNodeStyle,((threadsInfo.children[i].child_role=="member")? true:false));
				child_node = thisCtrl.drawThreadNode(threadsInfo.children[i], offset_x, offset_y, width, height,
				((threadsInfo.children[i].child_role=="member")? thisCtrl.currentNodeStyle:thisCtrl.facilitator_childNodeStyle),
				((threadsInfo.children[i].child_role=="member")? true:false));
				
				//alert("children "+i+"th node is: "+threadsInfo.children[i].child_role);
				if(threadsInfo.children[i].child_role=="member"||(GeoAnnotator.isResearchModeOn==false&&threadsInfo.children[i].child_role!="member"))
				{thisCtrl.drawThreadLink(current_node, child_node);}
				offset_y = offset_y + spacing + height;
			}
		}
	},
	
	drawThreadNode : function(threadNodeInfo, x, y, width, height, style,role) 
	{
		//if(role != true) return 0;
		var thisCtrl = GeoAnnotator.AnnotationInfoPanelCtrl;
		var top = y - 0.5 * height;
		var left = x - 0.5 * width;
		var thread_node = {};
		
		var box = thisCtrl.spaceTree.rect(left, top, width, height,(role? 0:10)).attr(style["default"]);
		var label = thisCtrl.spaceTree.text(x, y, threadNodeInfo.userName + ":\n" + threadNodeInfo.excerpt.substring(0, 20)).attr(style["text"]);
		if((role==false)&&(GeoAnnotator.isResearchModeOn==true))	//when role is not member and not in research mode the node will be hiden.
		{
			box.hide();
			label.hide();
		}
		
		var blanket = thisCtrl.spaceTree.rect(left, top, width, height).attr(style["blanket"]);
		thread_node.id = threadNodeInfo.id;
		thread_node.box = box;
		thread_node.label = label;
		thread_node.blanket = blanket;
		thread_node.role=threadNodeInfo.role;
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
	
	drawThreadLink : function(from_node, to_node) 
	{
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
	
	onLoadCodeSuccess : function(xhr) {
		var thisCtrl = GeoAnnotator.AnnotationInfoPanelCtrl;
		thisCtrl.currCode = Ext.util.JSON.decode(xhr.responseText);
		if (thisCtrl.currAnnotationInfo != null) {
			thisCtrl.updatePanelContent();
		}
		return;
	},
	
	onLoadAnnotationInfoSuccess : function (xhr) {
		var thisCtrl = GeoAnnotator.AnnotationInfoPanelCtrl;
		thisCtrl.currAnnotationInfo = Ext.util.JSON.decode(xhr.responseText);
		if (thisCtrl.currAnnotationInfo != null) {
			// update panel
			// postponed until code is loaded.
			// thisCtrl.updatePanelContent();	
			
			// add to history
			var item = {};
			item.id = thisCtrl.currAnnotationInfo.id;
			item.type = thisCtrl.currAnnotationInfo.type;
			item.userName = thisCtrl.currAnnotationInfo.userName;
			item.timeCreated = thisCtrl.currAnnotationInfo.timeCreated;
			item.excerpt = thisCtrl.currAnnotationInfo.excerpt;
			GeoAnnotator.AnnotationHistoryWindowCtrl.add(item);
			
			GeoAnnotator.currPlanId = '0';				
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
				// GeoAnnotator.MapPanelCtrl.update();
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
			GeoAnnotator.currPlanId = '0';
			
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
	on_researcher_switch_Click : function() {
		//GeoAnnotator.AnnotationBookmarkWindowCtrl.add(GeoAnnotator.AnnotationInfoPanelCtrl.currAnnotationInfo);
		GeoAnnotator.isResearchModeOn=!(GeoAnnotator.isResearchModeOn);
		GeoAnnotator.AnnotationInfoPanelCtrl.updateReferenceSpaceTreePanel();
		//alert(GeoAnnotator.isResearchModeOn);
		//refresh the thread view and draw nodes.
		GeoAnnotator.AnnotationInfoPanelCtrl.referenceSpaceTreeWindow.show();
		GeoAnnotator.AnnotationInfoPanelCtrl.buildReferenceSpaceTree();
	
	},
	
	onCodeClick: function(){
		var thisCtrl = GeoAnnotator.AnnotationInfoPanelCtrl;
		thisCtrl.codeSchemeStore = new Ext.data.JsonStore({
			autoDestroy: true,
			autoLoad: true,
			root: 'codescheme',
			url: GeoAnnotator.baseUrl + 'codescheme/',
			baseParams: {
				'userId' : GeoAnnotator.currUserId
			},
			fields: ['classification', 'description']
		});
		if (thisCtrl.codeWindow === null) {
			thisCtrl.codePanel = new Ext.FormPanel({
				id: 'code-form',
				autoHeight : true,
				autoWidth : true,
				bodyStyle: 'padding: 0 1 0 1;',
				items : [
				{
					xtype : 'hidden',
					id: 'codeId',
					name: 'codeId',
					value : '0'
				},
				{
					xtype: 'combo',
					id : 'codeClassification',
					name : 'codeClassification',
					width: 200,
					editable : false,
					fieldLabel : 'Classification',
					store: thisCtrl.codeSchemeStore, 
					displayField:'classification',
					typeAhead: true,
					mode: 'local',
					triggerAction: 'all',
					value:'None',
					selectOnFocus:true,
					listeners: {
						'select' : thisCtrl.onCodeSelect
					}
				},
				{
					xtype: 'textarea',
					id : 'codeDescription',
					name : 'codeDescription',
					width : 200,
					height: 100,
					autoScroll: true,
					fieldLabel : 'Description',
				},
				{
					xtype: 'textfield',
					id : 'codeComment',
					name : 'codeComment',
					width: 200,
					fieldLabel : 'Comment (optional)',
					value:'',
				}],

				buttons: [
				{
					text : 'Delete',
					id : 'codeDeleteBtn',
					handler: thisCtrl.onCodeDelete,
					disabled : true
				},
				{
					text : 'Submit',
					id : 'codeSubmitBtn',
					handler: thisCtrl.onCodeSubmit
				},
				{
					text : 'Cancel',
					handler: thisCtrl.onCodeCancel
				}]
			});

			thisCtrl.codeWindow = new Ext.Window({
						layout      : 'fit',
						//width       : 180,
						//height      : 300,
						closeAction :'hide',
						plain       : true,
						modal		: false,
						items : [thisCtrl.codePanel],
						title : 'Code view',
			});

			
		}
		
		thisCtrl.updateCodePanel();

		thisCtrl.codeWindow.show();
	},

	// load the 'descsription' when a code is selected from ComboBox
	onCodeSelect : function() {
		var thisCtrl = GeoAnnotator.AnnotationInfoPanelCtrl;
		var classification = thisCtrl.codePanel.getComponent('codeClassification').getValue();
		var desc = thisCtrl.codeSchemeStore.query('classification', classification).item(0).get('description');
		if (thisCtrl.codePanel != null) {
			thisCtrl.codePanel.getComponent('codeDescription').setValue(desc);
		}
	},

	onCodeSubmit : function(){
		var thisCtrl = GeoAnnotator.AnnotationInfoPanelCtrl;

		// get the current content in the form
		var newCode = {};
		newCode.id = thisCtrl.codePanel.getForm().findField('codeId').getValue();
		newCode.annotationId = GeoAnnotator.currAnnotationId;
		newCode.classification = thisCtrl.codePanel.getForm().findField('codeClassification').getValue();
		newCode.description = thisCtrl.codePanel.getForm().findField('codeDescription').getValue();
		newCode.comment = thisCtrl.codePanel.getForm().findField('codeComment').getValue();

		if (thisCtrl.currCode.id != undefined) { // if exist, delete the old code first
			Ext.Ajax.request({
				url: GeoAnnotator.baseUrl + 'code/',
				success: function() {
					thisCtrl.update();
					thisCtrl.codeWindow.hide();
				},
				failure: function() {
					alert('Failed to modify code!');
				},
				params: {
					'delete' : thisCtrl.currCode.id,
				}
			});
		}
		// then add the new code
		Ext.Ajax.request({
			url: GeoAnnotator.baseUrl + 'code/',
			success: function() {
				thisCtrl.update();
				thisCtrl.codeWindow.hide();
			},
			failure: function() {
				alert("failed!");
			},
			params: newCode
		});
	},

	onCodeCancel : function(){
		var thisCtrl = GeoAnnotator.AnnotationInfoPanelCtrl;
		thisCtrl.codeWindow.hide();
	},

	onCodeDelete : function() {
		var thisCtrl = GeoAnnotator.AnnotationInfoPanelCtrl;
		Ext.Msg.confirm('Confirm', 'Do you want to delete this code?', function(btn, text) {
			if (btn == 'yes') {
				Ext.Ajax.request({
					url: GeoAnnotator.baseUrl + 'code/',
					success: function() {
						thisCtrl.update();
						thisCtrl.codeWindow.hide();
					},
					failure: function() {
						alert('Failed to delete code!');
					},
					params: {
						'delete' : thisCtrl.currCode.id,
					}
				});
			}
		});
	},

	onAddNewAnnotationSuccess: function(xhr) {
		var thisCtrl = GeoAnnotator.ContributePanelCtrl;
		var submitState = Ext.util.JSON.decode(xhr.responseText);
		if (submitState.success == true) {
			// change the states
			//alert('successfuly added!');
			// reset the new plans array
			
			thisCtrl.newPlans = [];
			GeoAnnotator.currPlanId = '0';

			GeoAnnotator.currAnnotationId = submitState.data.id;

			// update controls		
			// GeoAnnotator.TimelinePanelCtrl.update();
			GeoAnnotator.AnnotationInfoPanelCtrl.update();
			GeoAnnotator.ContributePanelCtrl.update();
			var currParams = {};
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
						items : [thisCtrl.referenceSpaceTreePanel],
						title : 'Thread tree view',
						tbar: new Ext.Toolbar({
							id : 'thread-info-tbar',
							hidden : false, 
							items: [{
								id: 'thread-research-btn',
								iconCls: 'annotation-bkm-btn',
								iconAlign: 'top',
								handler: thisCtrl.on_researcher_switch_Click,
								text: 'Researcher\'s opinion',
								tooltip: {title:'Display the research nodes', text: 'Description of the this switch for researcher'}
							},
							'-',
							{
								id: 'thread-user-btn',
								iconCls: 'thread-user-btn',
								iconAlign: 'top',
								handler: thisCtrl.on_researcher_switch_Click,
								text: 'User\'s opinion',
								tooltip: {title:'Display the user\'s nodes'}
							}
							]
						})});
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
			var name = '[POST' + thisCtrl.currAnnotationInfo.id + ']';
			GeoAnnotator.ContributePanelCtrl.addAnnotationToReference(thisCtrl.currAnnotationInfo.id, name);
		}
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
		GeoAnnotator.currPlanId = '0';

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
		GeoAnnotator.currPlanId = '0';

		// initialize controls
		GeoAnnotator.AnnotationInfoPanelCtrl.init();

		// update controls		
		GeoAnnotator.ContributePanelCtrl.update();
		thisCtrl.update();
		// GeoAnnotator.TimelinePanelCtrl.update();
		GeoAnnotator.MapPanelCtrl.update();
	},

	onDeleteAnnotationFailure: function () {
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
		GeoAnnotator.currPlanId = '0';
			
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
						var name = '[POST' + id + ']';
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
		GeoAnnotator.currPlanId = '0';
			
			
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
						var name = '[POST' + id + ']';
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
	},

	unique: function(myArray) {
		uniqueArray = myArray.filter(function(elem, pos) {
		    return myArray.indexOf(elem) == pos;
		})
		return uniqueArray;
	}
};

