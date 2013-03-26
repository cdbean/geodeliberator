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

