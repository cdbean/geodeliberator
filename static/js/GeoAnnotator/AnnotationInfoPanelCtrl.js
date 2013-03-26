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
	}
};

