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

