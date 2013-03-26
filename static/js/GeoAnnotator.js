/**
 * @author byu
 */


/**
 * Function: getScriptLocation
 * Return the path to this script.
 *
 * Returns:
 * {String} Path to this script
 */
function getScriptLocation () {
    var scriptLocation = "";
    var scriptName = "GeoAnnotator.js";
 
    var scripts = document.getElementsByTagName('script');
    for (var i=0, len=scripts.length; i<len; i++) {
	var src = scripts[i].getAttribute('src');
	if (src) {
	    var index = src.lastIndexOf(scriptName); 
	    // set path length for src up to a query string
	    var pathLength = src.lastIndexOf('?');
	    if (pathLength < 0) {
		pathLength = src.length;
	    }
	    // is it found, at the end of the URL?
	    if ((index > -1) && (index + scriptName.length == pathLength)) {
		scriptLocation = src.slice(0, pathLength - scriptName.length);
		break;
	    }
	}
    }
    return scriptLocation;
};

function loadJSFiles () {
    var jsfiles = new Array (
	"AnnotationBookmarkWindowCtrl.js",
	"AnnotationHistoryWindowCtrl.js",
	"AnnotationInfoPanelCtrl.js",
	"ContainerTBCtrl.js",
	"ContributePanelCtrl.js",
	"ManageWindowCtrl.js",
	"MapPanelCtrl.js",
	"TimelinePanelCtrl.js",
	"Util.js"
    );

    var agent = navigator.userAgent;
    var docWrite = (agent.match("MSIE") || agent.match("Safari"));
    if(docWrite) {
	var allScriptTags = new Array(jsfiles.length);
    }
    var host = getScriptLocation() + "GeoAnnotator/";    
    for (var i=0, len=jsfiles.length; i<len; i++) {
	if (docWrite) {
	    allScriptTags[i] = "<script src='" + host + jsfiles[i] +
			       "'></script>"; 
	} else {
	    var s = document.createElement("script");
	    s.src = host + jsfiles[i];
	    var h = document.getElementsByTagName("head").length ? 
		       document.getElementsByTagName("head")[0] : 
		       document.body;
	    h.appendChild(s);
	}
    }
    if (docWrite) {
	document.write(allScriptTags.join(""));
    }
};


var GeoAnnotator = {
	currUserId : '0',
	currForumId : '0',
	currAnnotationId : '0',
	currFootprintId : '0',
			
	//var baseUrl = "http://130.203.158.62/geoannotator/";
	//baseUrl : "../GeoAnnotatorService/",
	baseUrl : "api/",
	
	init : function (){
		this.currUserId = '0';
		this.currForumId = '0';
		this.currAnnotationId = '0';
		this.currFootprintId = '0';
						
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
		this.currUserId = Ext.state.Manager.get('userId', '0'); 
		
		// check the url params
		var params = Ext.urlDecode(location.search.substring(1));
		this.currUserId = params['userId'] || this.currUserId;
		this.currForumId = params['forumId'] || this.currForumId;
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


function registerComponents () {
	//GeoAnnotator.UserInfoPanelCtrl.register(userInfoPanel);
	//GeoAnnotator.GroupInfoPanelCtrl.register(groupInfoPanel);
	GeoAnnotator.ContainerTBCtrl.register(containerTB);
	GeoAnnotator.MapPanelCtrl.register(mapPanel);
	GeoAnnotator.TimelinePanelCtrl.register(timelinePanel);
	GeoAnnotator.AnnotationInfoPanelCtrl.register(annotationInfoPanel);
	GeoAnnotator.AnnotationHistoryWindowCtrl.register(annotationHistoryWindow);
	GeoAnnotator.AnnotationBookmarkWindowCtrl.register(annotationBookmarkWindow);
	GeoAnnotator.ContributePanelCtrl.register(contributePanel);
	GeoAnnotator.ManageWindowCtrl.register(manageWindow);
};

Ext.onReady(function(){
    loadJSFiles();

    Ext.QuickTips.init();
	    
    var viewport = new Ext.Viewport({
        layout: 'border',
        items: [headerPanel, containerPanel, footerPanel]
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
