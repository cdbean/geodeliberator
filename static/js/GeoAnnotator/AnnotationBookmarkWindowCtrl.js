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

