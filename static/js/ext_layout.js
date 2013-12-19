/**
 * Page Layout Definitions
 * @author byu
 */

Ext.BLANK_IMAGE_URL = 'static/lib/ext-3.2.1/resources/images/default/s.gif';


/*******Begin Header Definitions******/
// header
var headerPanel = new Ext.BoxComponent({
	el: 'header',
	region: 'north',
	//height: 30
	autoHeight: true
});

var footerPanel = new Ext.BoxComponent({
	el: 'footer',
	region: 'south'
});


/*******End Header Definitions******/
				
/*******Begin Centre Panels Definitions******/
// The map panel definition.
var mapPanel = new Ext.Panel({
	id: 'map-panel',
	//title: 'Manuscript',
	region: 'center',
	bodyStyle: 'padding:0px',
	//border: false,
	//slider: true,
	tbar: new Ext.Toolbar()
	//iconCls:'map-panel-header'
	//contentEl: 'default-map-panel'  // pull existing content from the page
});

// var timelinePanel = new Ext.Panel({
// 	id: 'timeline-panel',
// 	title: 'Timeline',
// 	region: 'south',
// 	bodyStyle: 'padding:0px',
// 	height: 200,
// 	collapsible: true
// 	//minSize: 200,
// 	//maxSize: 400
// 	//contentEl: 'default-annotation-view-panel'  // pull existing content from the page
// });

// center panel container	
var centerPanels = new Ext.Panel({
	layout: 'border',
	id: 'center-panels',
	region: 'center', 
	margins: '2 0 5 0',
	//border: false,
	//slider: true,
	defaults: {
    	//collapsible: true,
		border: false,
		//slider: true,
    	split: true,
    	//bodyStyle: 'padding:15px'
	},

	items: [mapPanel] //, timelinePanel]
});
/*******End Centre Panels Definitions******/
	
/*******Begin Right Panels Definitions******/
		
// The annotation info panel definition.
var annotationInfoPanel = new Ext.Panel({
	id: 'annotation-info-panel',
	title: 'Annotation Info',
	region: 'center',
	//height : 500,
	layout: 'fit',
	//border: false,
	//split:true,
	//autoScroll : true,
	//rowHeight: 1.0,
	bodyStyle: 'padding:0px',
	//contentEl: 'default-annotation-info-panel'  // pull existing content from the page
});

var contributePanel = new Ext.Panel({
    id: 'contribute-panel',
    title: 'Contribute',
    region: 'south',
	iconCls:'group-contribute-tab',
	autoHeight: true,	
	collapsible: true,
	//tbar: new Ext.Toolbar(),
	animCollapse: false
});
// right panel container
var rightPanels = new Ext.Panel({
	//layout: 'ux.row',
	layout : 'border',
	id: 'right-panels',
	region:'east',
	border: false,
	split:true,
	margins: '2 0 5 0',
	width: 300,
	minSize: 100,
	maxSize: 500,
	items: [annotationInfoPanel, contributePanel]
});

var annotationBookmarkPanel = new Ext.Panel({
	id: 'annotation-bookmark-panel',
	title: 'Bookmarks',
	bodyStyle: 'background-color: #fff;padding:0px;border: none; padding: 0px;',
	autoScroll: true,
	iconCls:'annotation-bookmark-tab'
});

var annotationBookmarkWindow = new Ext.Window({
   	layout      : 'fit',
    width       : 300,
    height      : 300,
	autoScroll	: true,
    closeAction :'hide',
    plain       : true,
	modal		: false,
	items		: [annotationBookmarkPanel]
});
	
var annotationHistoryPanel = new Ext.Panel({
	id: 'annotation-history-panel',
	title: 'History',
	bodyStyle: 'background-color: #fff;padding:0px;border: none; padding: 0px;',
	autoScroll: true,
	iconCls:'annotation-history-tab'
			
});

var annotationHistoryWindow = new Ext.Window({
   	layout      : 'fit',
    width       : 300,
    height      : 300,
	autoScroll	: true,
    closeAction :'hide',
    plain       : true,
	modal		: false,
	items		: [annotationHistoryPanel]
});

var managePanel = new Ext.Panel({
	id: 'manage-panel',
	title: 'Management',
	bodyStyle: 'background-color: #fff;padding:0px;border: none; padding: 0px;',
	autoScroll: true,
	iconCls:'group-manage-tab'
});

var manageWindow = new Ext.Window({
   	layout      : 'fit',
    width       : 500,
    height      : 300,
	autoScroll	: true,
    closeAction :'hide',
    plain       : true,
	modal		: false,
	items		: [managePanel]
});


var containerTB = new Ext.Toolbar({
	items: [{xtype: 'tbtext', text: 'loading user information...'}]
});

var containerPanel = new Ext.Panel({
	region: 'center',
	layout: 'border',
	tbar: containerTB,
	items: [centerPanels, rightPanels]
});
//
// This is the main layout definition.
//

Ext.onReady(function(){
	
	Ext.QuickTips.init();
		
	var viewport = new Ext.Viewport({
		layout: 'border',
		items: [headerPanel, containerPanel, footerPanel],
        //renderTo: Ext.getBody()
    });

	// register the components
	registerComponents();
	
	// initialize cookies
	Ext.state.Manager.setProvider(new Ext.state.CookieProvider());
	// example: set some cookies
	//Ext.state.Manager.set('userId','9');
	//Ext.state.Manager.clear('userId');
	Ext.state.Manager.clear('groupId');
	GeoAnnotator.init();
	//relevantAnnotationsTabsPanel.activate(0);
	//relevantAnnotationsTabsPanel.setActiveTab(0);
});

function registerComponents () {
	//GeoAnnotator.UserInfoPanelCtrl.register(userInfoPanel);
	//GeoAnnotator.GroupInfoPanelCtrl.register(groupInfoPanel);
	GeoAnnotator.ContainerTBCtrl.register(containerTB);
	GeoAnnotator.MapPanelCtrl.register(mapPanel);
	//GeoAnnotator.TimelinePanelCtrl.register(timelinePanel);
	GeoAnnotator.AnnotationInfoPanelCtrl.register(annotationInfoPanel);
	GeoAnnotator.AnnotationHistoryWindowCtrl.register(annotationHistoryWindow);
	GeoAnnotator.AnnotationBookmarkWindowCtrl.register(annotationBookmarkWindow);
	GeoAnnotator.ContributePanelCtrl.register(contributePanel);
	GeoAnnotator.ManageWindowCtrl.register(manageWindow);
};
