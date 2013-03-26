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
	    		url: './static/lib/ext-3.2.1/resources/charts.swf',
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
			Ext.Ajax.request({
	   			url: GeoAnnotator.baseUrl + 'timeline/',
	   			success: thisCtrl.onLoadTimelineInfoSuccess,
	   			failure: function() {
					alert('failed to load timeline info!');
				},
	   			params: {'userId':GeoAnnotator.currUserId, 'forumId': GeoAnnotator.currForumId, 'unit': thisCtrl.unit, 'startDate': thisCtrl.startDate.toGMTString(), 'endDate': thisCtrl.endDate.toGMTString()}
			});
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
};

