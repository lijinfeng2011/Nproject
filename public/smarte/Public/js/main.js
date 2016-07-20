// copyright by guoxin.org

String.prototype.trim = function()
{
	return this.replace(/^\s*|\s*$/g,"");
};
Array.prototype.remove = function(n)
{
	if (n < 0)
	{
		return this;
	}
	else
	{
		return this.slice(0, n).concat(this.slice(n + 1, this.length));
	}
};

var JKB = new Object();
var account_click = 0;
var nav_link_over = false;
var account_over = false;

JKB.cache = {
	index_pic: null,
	task_id_list: [],
	task_list_data: [],
	task_id:		0,
	ids:			'',
	host_id:		0,
	curr_period:	'',
	date_range:		'', // 时间范围的原始字符串
	task_comp_sum:	0,
	task_list_page:	'', // 监控项目列表视图
	page:			1,	// 页码
	display_cache:	{},
	ajax_tips:		{},	// ajax tips content
	ajax_layer_init:{},	// ajax layer counter
	addTaskId: function(id)
	{
		this.task_id_list.push(id);
	},
	setCurrPeriod: function(period)
	{
		this.curr_period = period;
	},
	url_add_period: function(a)
	{
		a.href += (a.href.indexOf('?') == -1 ? '?' : '&') + 'period=' + this.curr_period + '&range=' + this.date_range;
	}
};

JKB.loader = {
	loading_str:	'正在加载…',
	showAjaxLoader: function()
	{
		//jQuery('#mskDiv').show();
		var scrollTop = document.body.scrollTop;
		var top = ((document.documentElement.clientHeight / 2 - 50) + scrollTop) + 'px';
		var left = (document.documentElement.clientWidth / 2 - 50) + 'px';
		jQuery('#mskLoader').css('top', top);
		jQuery('#mskLoader').css('left', left);
		jQuery('#mskLoader').show();
	},
	hideAjaxLoader: function()
	{
		//jQuery('#mskDiv').hide();
		jQuery('#mskLoader').hide();
	},
	switchTasksOptList: function()
	{
		var obj = document.__form.task_comp;
		var checked_sum = 0;
		if (obj.length)
		{
			for (var i = 0, length = obj.length; i < length; ++i)
			{
				if (obj[i].checked)
				{
					checked_sum++;
					jQuery('#__task_' + obj[i].value).css('backgroundColor', '#E4F3D6');
				}
				else
				{
					jQuery('#__task_' + obj[i].value).css('backgroundColor', '#fafafa');
				}
			}
		}
		else
		{
			if (obj.checked)
			{
				checked_sum++;
				jQuery('#__task_' + obj.value).css('backgroundColor', '#E4F3D6');
				jQuery('#__task_' + obj.value).css('backgroundColor', '#fafafa');
			}
		}
		if (checked_sum == 0)
		{
			jQuery('#__tasks_opt_list').fadeOut();
		}
		else
		{
			jQuery('#__tasks_opt_list').fadeIn();
		}
	},
	switchTaskListTab: function(tab, content)
	{
		jQuery('#' + JKB.cache.task_list_tab).removeClass();
		jQuery('#' + tab).addClass('selected');
		JKB.cache.task_list_tab = tab;
		JKB.cache.task_list_page = content;
		this.loadTaskListPage();
	},
	switchTaskListPage: function(page)
	{
		JKB.cache.page = page;
		this.loadTaskListPage();
	},
	loadTaskListPage: function(m_page)
	{
		this.showAjaxLoader();
		ajax_url = getAjaxWrapper('get_task_list_page', {type: JKB.cache.task_list_type, owner: JKB.cache.task_list_owner, priority: JKB.cache.task_list_priority, class_id:JKB.cache.task_list_class_id, status:JKB.cache.task_list_status, temp: JKB.cache.task_list_page, page: JKB.cache.page, s:encodeURIComponent(JKB.cache.s), domain_id:JKB.cache.task_list_domain, period:JKB.cache.curr_period, range:JKB.cache.date_range, m_page:m_page});

		jQuery('#__div_task_list').load(getRandomUrl(ajax_url), function()
		{
			JKB.loader.hideAjaxLoader();
			JKB.loader.loadTips(['__TIPS_TASK_FREQUENCY']);
		});
	},
	
	show_site_list: function(div_id, to_user_id)
	{
		this.showAjaxLoader();
		ajax_url = getAjaxWrapper('get_task_list_select', {to_user_id: to_user_id});
		jQuery('#' + div_id).load(getRandomUrl(ajax_url), function()
		{
			JKB.loader.hideAjaxLoader();
			jQuery('#' + div_id).slideDown('slow');
		});
	},
	
	show_mw_task_list: function(action, mw_id, page_id)
	{
		this.showAjaxLoader();
		if(page_id)
		{
			ajax_url = getAjaxWrapper('get_mw_task_list_select', {action: action, mw_id: mw_id, page:page_id});
		}
		else
		{
			ajax_url = getAjaxWrapper('get_mw_task_list_select', {action: action, mw_id: mw_id});
		}
		jQuery('#mw_edit_task_list').load(getRandomUrl(ajax_url), function()
		{
			JKB.loader.hideAjaxLoader();
			jQuery('#mw_task_list').hide();
			jQuery('#mw_edit_task_list').slideDown('slow');
		});
	},
	
	hide_site_list: function(div_id)
	{
		jQuery('#' + div_id).slideUp('slow');
	},
	
	loadPublicStatusList: function(op)
	{
		this.showAjaxLoader();
		if(!JKB.cache.range)
		{
			range_date = 0;
		}
		else
		{
			range_date = JKB.cache.range;
		}
		
		ajax_url = getAjaxWrapper('get_public_status_list', {task_ids: JKB.cache.task_ids, range: range_date, op: op});
		jQuery('#__div_public_status_list').load(getRandomUrl(ajax_url), function()
		{
			//jQuery('#__div_public_status_list').hide();
			JKB.loader.hideAjaxLoader();	
			//jQuery('#__div_public_status_list').show('blind');
		});
	},	
	loadFaultContent: function(display_id, uprate_str, fault_time_str)
	{
		var text_inner = '<p class="public_uptime"><span class="public_uptime_title">可用率:</span> ';
		text_inner += uprate_str;
		if(fault_time_str){
			text_inner += ' （故障时长：' + fault_time_str + '）';	
		}
		text_inner += '</p><div class="public_faults" id="__tips_inner_' + display_id + '">';
		text_inner += '</div>';
		
		jQuery('#__tips_fault_history_' + display_id).qtip({
						content:{
							text: text_inner
						},
						position: {
							corner: {
								target: 'topLeft',
								tooltip: 'bottomRight'
							}
						},
						style: {
							 name: 'blue',
							 padding: '7px 13px',
							 width: {
								max: 260,
								min: 0
							 },
							 tip: true,
							 classes: { content: 'public_detail_tips'}
						},
						show: {
							solo: true,
							when: 'focus'
						},
						hide:['unfocus', 'onMouseOut']
					});
		//jQuery('#__tips_fault_history_' + display_id).addClass('text_tips3');
		jQuery('#__tips_fault_history_' + display_id).focus();
	},		
	
	loadTaskListData: function(period)
	{
		this.switchDateRangeSelected(period);
		this.hideDateSelecter();
		JKB.cache.setCurrPeriod(period);
		jQuery('#__period').html(JKB.loader.loading_str).removeClass().addClass('task_data_loading');
		
		switch (JKB.cache.task_list_page)
		{
			case 'task_list_main':
				JKB.loader.switchTaskListTab('__tab_main', 'task_list_main');
				break;
			case 'task_list_avai':
				JKB.loader.switchTaskListTab('__tab_avai', 'task_list_avai');
				break;
			case 'task_list_resptime':
				JKB.loader.switchTaskListTab('__tab_resptime', 'task_list_resptime');
				break;
			case 'task_list_last_resp':
				JKB.loader.switchTaskListTab('__tab_last_resp', 'task_list_last_resp');
				break;
		}
	},
	switchDateRangeSelected: function(period)
	{
		if (period != '')
		{
			jQuery.each(jQuery('#__daterange_control').children(), function(k, v)
			{
				jQuery(v).removeClass();
				if (jQuery(v).attr('id') == '__dr_' + period)
				{
					jQuery(v).addClass('selected');
				}
			});
		}
	},
	fillPeriod: function(str)
	{
		jQuery('#__period').html(str).removeClass().addClass('time_period');
	},
	loadTaskReportSummary: function(period)
	{
		url = '/task/' + JKB.cache.task_id + '/report/summary?period=' + period + '&range=' + JKB.cache.date_range;
		window.location = url;
	},
	loadTaskReportAvaillability: function(period)
	{
		url = '/task_report_availability.php?task_id=' + JKB.cache.task_id + '&period=' + period + '&range=' + JKB.cache.date_range;
		window.location = url;
	},
	loadTaskReportResptimeLevel: function(period)
	{
		url = '/task_report_resptime_level.php?task_id=' + JKB.cache.task_id + '&period=' + period + '&range=' + JKB.cache.date_range;
		window.location = url;
	},
	loadTaskReportFaultCount: function(period)
	{
		url = '/task_report_fault.php?task_id=' + JKB.cache.task_id + '&period=' + period + '&range=' + JKB.cache.date_range;
		window.location = url;
	},
	loadTaskReportResptimeIsp: function(period)
	{
		url = '/task_report_resptime_isp.php?task_id=' + JKB.cache.task_id + '&period=' + period + '&range=' + JKB.cache.date_range;
		window.location = url;
	},
	loadTaskComp: function(period)
	{
		url = '/task_comp.php?ids=' + JKB.cache.ids + '&period=' + period + '&range=' + JKB.cache.date_range;
		window.location = url;
	},
	loadHostReportProvince: function(period)
	{
		url = '/exp_host_report_province.php?host_id=' + JKB.cache.host_id + '&period=' + period + '&range=' + JKB.cache.date_range;
		window.location = url;
	},
	loadHostReportIsp: function(period)
	{
		url = '/exp_host_report_isp.php?host_id=' + JKB.cache.host_id + '&period=' + period + '&range=' + JKB.cache.date_range;
		window.location = url;
	},
	loadHostReportCity: function(period)
	{
		url = '/exp_host_report_city.php?host_id=' + JKB.cache.host_id + '&period=' + period + '&range=' + JKB.cache.date_range;
		window.location = url;
	},
	loadHostListAvg: function(period)
	{
		url = '/exp_host_list_avg.php?period=' + period + '&range=' + JKB.cache.date_range;
		window.location = url;
	},
	loadHostListProvince: function(period)
	{
		url = '/exp_host_list_province.php?period=' + period + '&range=' + JKB.cache.date_range;
		window.location = url;
	},
	loadHostListCity: function(period)
	{
		url = '/exp_host_list_city.php?period=' + period + '&range=' + JKB.cache.date_range;
		window.location = url;
	},
	loadHostListIsp: function(period)
	{
		url = '/exp_host_list_isp.php?period=' + period + '&range=' + JKB.cache.date_range;
		window.location = url;
	},
	loadServerNetIO: function(period)
	{
		url = '/server_task_report_detail_netio.php?task_id=' + JKB.cache.server_task_id + '&period=' + period + '&range=' + JKB.cache.date_range + '&unit=' + JKB.cache.unit;
		window.location = url;
	},
	loadServerNetIOPkt: function(period)
	{
		url = '/server_task_report_detail_netiopkt.php?task_id=' + JKB.cache.server_task_id + '&period=' + period + '&range=' + JKB.cache.date_range;
		window.location = url;
	},
	loadServerDiskIO: function(period)
	{
		url = '/server_task_report_detail_diskio.php?task_id=' + JKB.cache.server_task_id + '&period=' + period + '&range=' + JKB.cache.date_range;
		window.location = url;
	},
	loadServerDiskIOSum: function(period)
	{
		url = '/server_task_report_detail_diskiosum.php?task_id=' + JKB.cache.server_task_id + '&period=' + period + '&range=' + JKB.cache.date_range;
		window.location = url;
	},
	loadServerLoad: function(period)
	{
		url = '/server_task_report_detail_load.php?task_id=' + JKB.cache.server_task_id + '&period=' + period + '&range=' + JKB.cache.date_range;
		window.location = url;
	},
	loadServerMem: function(period)
	{
		url = '/server_task_report_detail_mem.php?task_id=' + JKB.cache.server_task_id + '&period=' + period + '&range=' + JKB.cache.date_range;
		window.location = url;
	},
	loadServerMemWindows: function(period)
	{
		url = '/server_task_report_detail_mem_windows.php?task_id=' + JKB.cache.server_task_id + '&period=' + period + '&range=' + JKB.cache.date_range;
		window.location = url;
	},
	loadServerCPU: function(period)
	{
		url = '/server_task_report_detail_cpu.php?task_id=' + JKB.cache.server_task_id + '&period=' + period + '&range=' + JKB.cache.date_range;
		window.location = url;
	},
	loadServerCPUWindows: function(period)
	{
		url = '/server_task_report_detail_cpu_windows.php?task_id=' + JKB.cache.server_task_id + '&period=' + period + '&range=' + JKB.cache.date_range;
		window.location = url;
	},
	loadServerProcsum: function(period)
	{
		url = '/server_task_report_detail_procsum.php?task_id=' + JKB.cache.server_task_id + '&period=' + period + '&range=' + JKB.cache.date_range;
		window.location = url;
	},
	loadServerDiskStore: function(period)
	{
		url = '/server_task_report_detail_diskstore.php?task_id=' + JKB.cache.server_task_id + '&period=' + period + '&range=' + JKB.cache.date_range;
		window.location = url;
	},
	loadServiceTask: function(period)
	{
		url = '/service_task_report_summary.php?task_id=' + JKB.cache.service_task_id + '&period=' + period + '&range=' + JKB.cache.date_range + '&mode=' + JKB.cache.service_task_mode;
		window.location = url;
	},
	loadAnalyseOverlay: function(period)
	{
		url = '/analyse_overlay.php?overlay=' + JKB.cache.task_overlay + '&period=' + period + '&range=' + JKB.cache.date_range;
		window.location = url;
	},
	showDateSelecter: function()
	{
		jQuery('#date_selecter').fadeIn();
	},
	hideDateSelecter: function()
	{
		jQuery('#date_selecter').fadeOut();
	},
	submitDateRange: function(range)
	{
		tmp = range.split('|');
		JKB.loader.setDateRange(tmp[0], tmp[1]);
	},
	setDateRange: function(start, end)
	{
		jQuery('#__date_start').val(start);
		jQuery('#__date_end').val(end);
		JKB.cache.date_range = start + ',' + end;
	},
	switchDateTimeSelecter: function()
	{
		if (!datatime_display)
		{
			jQuery('#datetime_range').fadeIn();
		}
		else
		{
			jQuery('#datetime_range').fadeOut();
		}
		datatime_display = !datatime_display;
		return false;
	},
	submitDateTimeRange: function(start_id, end_id)
	{
		var datetime_s = document.getElementById(start_id).value;
		var datetime_e = document.getElementById(end_id).value;
		if (datetime_s == '' || datetime_e == '')
		{
			showSuccMsg('请输入开始时间和结束时间。', '', '', {});
			return;
		}
		var url = window.location.href;
		if (url.indexOf('range=') != -1)
		{
			url = url.replace(/range=[ %:0-9a-z\,\-]*/g, 'range=' + datetime_s + ',' + datetime_e);
		}
		else
		{
			if (url.indexOf('?') != -1)
			{
				url = url + "&";
			}
			else
			{
				url = url + "?";
			}
			url = url + 'range=' + datetime_s + ',' + datetime_e;
		}
		// 处理需要重置的参数，要重置的参数用 {p1:v1,p2:v2} 的形式传递进来
		if (arguments.length==3)
		{
			var args_reset = arguments[2];
			for (key in args_reset)
			{
				if (url.indexOf(key+'=') != -1)
				{
					var patt=new RegExp(key+'=[^&]*', 'g');
					url = url.replace(patt, key + '=' + args_reset[key]);
				}
			}
		}
		submitLoading('btn_submit', 'loading_submit');
		window.location = url;
	},
	onChangeDateRange: function(period)
	{
		if (period == 'custom')
		{
			if (JKB.cache.date_range == '')
			{
				var start = jQuery('#__date_start').val();
				var end = jQuery('#__date_end').val();
				JKB.cache.date_range = start + ',' + end;
			}
		}
		var url = window.location.href;
		if (url.indexOf('period=') != -1)
		{
			url = url.replace(/period=[0-9a-z]+/g, 'period=' + period);
			url = url.replace(/range=[0-9a-z\,\-]*/g, 'range=' + JKB.cache.date_range);
		}
		else
		{
			if (url.indexOf('?') != -1)
			{
				url = url + "&";
			}
			else
			{
				url = url + "?";
			}
			url = url + "period=" + period + "&range=" + JKB.cache.date_range;
		}
		
		window.location = url;
	},
	onChangeScaleDateRange: function(period, scale)
	{
		if (period == 'custom')
		{
			if (JKB.cache.date_range == '')
			{
				var start = jQuery('#__date_start').val();
				var end = jQuery('#__date_end').val();
				JKB.cache.date_range = start + ',' + end;
			}
		}
		var url = window.location.href;
		if (url.indexOf('period=') != -1)
		{
			url = url.replace(/period=[0-9a-z]+/g, 'period=' + period);
			url = url.replace(/range=[0-9a-z\,\-]*/g, 'range=' + JKB.cache.date_range);
		}
		else
		{
			if (url.indexOf('?') != -1)
			{
				url = url + "&";
			}
			else
			{
				url = url + "?";
			}
			url = url + "period=" + period + "&range=" + JKB.cache.date_range;
		}
		
		if (url.indexOf('scale=') != -1)
		{
			url = url.replace(/scale=[0-9a-z]*/g, 'scale=' + scale);
		}
		else
		{
			url += "&scale=" + scale;
		}
		window.location = url;
	},	
	onChangeTask: function(elem)
	{
		var task_id = elem.options[elem.selectedIndex].value;
		var task_type = elem.options[elem.selectedIndex].getAttribute('type');
		var url = window.location.href;
		if (url.search(/task\/[a-z]+\/[0-9]+/g) != -1)
		{
			url = url.replace(/task\/[a-z]+\/[0-9]+/g, 'task/' + task_type + '/' + task_id);
		}
		window.location = url;
	},
	onChangeExpHost: function(elem)
	{
		value = elem.options[elem.selectedIndex].value;
		var url = window.location.href;
		if (url.indexOf('host_id=') != -1)
		{
			url = url.replace(/host_id=[0-9]+/g, 'host_id=' + value);
		}
		window.location = url;
	},
	onChangeServer: function(elem)
	{
		var value = elem.options[elem.selectedIndex].value;
		var url = '/server/' + value;
		window.location = url;
	},
	onChangeServiceTask: function(elem)
	{
		var task_id = elem.options[elem.selectedIndex].value;
		var task_type = elem.options[elem.selectedIndex].getAttribute('type');
		var url = window.location.href;
		if (url.search(/task\/[a-z]+\/[0-9]+/g) != -1)
		{
			url = url.replace(/task\/[a-z]+\/[0-9]+/g, 'task/' + task_type + '/' + task_id);
		}
		window.location = url;
	},
	onChangeSTaskThres: function(elem)
	{
		var value = elem.options[elem.selectedIndex].value;
		var task_type = elem.options[elem.selectedIndex].getAttribute('type');
		var url = '/task/' + task_type + '/' + value + '/alert/threshold/settings';
		window.location = url;
	},
	onChangeHost: function(elem)
	{
		var value = elem.options[elem.selectedIndex].value;
		var url = window.location.href;
		if (url.indexOf('/host/') != -1)
		{
			url = url.replace(/\/host\/[0-9\.]+/g, '/host/' + value);
		}
		window.location = url;
	},
	onChangeDomain: function(elem)
	{
		var value = elem.options[elem.selectedIndex].value;
		var url = window.location.href;
		if (url.indexOf('/domain/') != -1)
		{
			url = url.replace(/\/domain\/[0-9a-z\-]+\.[0-9a-z\.\-]+/g, '/domain/' + value);
		}
		window.location = url;
	},
	onChangeSNMP: function(show, hidden)
	{
		jQuery('#' + show).fadeIn();
		jQuery('#' + hidden).fadeOut();
	},
	onSelectSNMP: function(id)
	{
		var use_nat = jQuery('#use_snmp')[0].checked;
		if ( use_nat )
		{
			jQuery('#' + id).fadeIn();
		}
		else
		{
			jQuery('#' + id).fadeOut();
		}
	},
	onClickIndexPic: function(id)
	{
		if (pictimer)
			clearInterval(pictimer);
		return this.onChangeIndexPic(id);
	},
	onChangeIndexPic: function(id)
	{
		curr_id = JKB.cache.index_pic;
		$('#__pic_' + curr_id).fadeOut('slow');
		$('#__item_' + curr_id).fadeOut('slow', function(){
			JKB.cache.index_pic = id;
			$('#__click_' + curr_id).removeClass();
			$('#__click_' + id).addClass('selected');
			$('#__item_' + curr_id).hide();
			$('#__item_' + id).fadeIn('slow');
			$('#__pic_' + id).fadeIn('slow');}
		);
		return false;
	},
	startTaskComp: function(obj)
	{
		var err = '很抱歉，对比项目数不能超过 2 个！';
		if (!obj)
		{
			jkbAlert(err, 'error');
			return;
		}
		var ids = '';
		var idcount = 0;
		var task_ids = new Array();
		if (obj.length)
		{
			for (var i = 0, length = obj.length; i < length; ++i)
			{
				if (obj[i].checked)
				{
					task_ids.push(obj[i].value);
					idcount++;
				}
			}
			if (idcount > 2)
			{
				jkbAlert(err, 'error');
				return;
			}
			if(1 == idcount)
			{
			    window.location = '/adv_compare.php?task_ids=' + task_ids.join(',') + '&type=periodcal';
			}
			if(2 == idcount)
			{
			    window.location = '/adv_compare.php?task_ids=' + task_ids.join(',') + '&type=comparison';
			}
		}
		else
		{
			jkbAlert(err, 'error');
			return;
		}
	},
	startTaskDelete: function(obj)
	{
		if (!confirm('确定要删除所选项目吗？'))
		{
			return false;
		}
		
		if(!obj)
		{
			jkbAlert(err, 'error');
			return;
		}
		
		this.showAjaxLoader();
		task_ids = JKB.loader.getCheckedTasks();
		
		jQuery.post(getAjaxWrapper('batch_user_task_delete'), {task_ids:task_ids}, function(data)
		{
			if(data)
			{
				JKB.loader.hideAjaxLoader();
				showSuccMsg('已删除所选监控项目！', '', '', {});
				split_task_id = task_ids.split(",");
				for(i=0;i<split_task_id.length;i++){
					if(split_task_id[i] != "")
					{
						parent.JKB.loader.hideTask(split_task_id[i]);
					}
				}
				return;
			}
		});
	},
	toggleTaskPause: function(obj,type)
	{
		if(!obj)
		{
			jkbAlert(err, 'error');
			return;
		}
		this.showAjaxLoader();
		task_ids = JKB.loader.getCheckedTasks();
		var url = getAjaxWrapper('toggle_batch_task_pause', {task_ids:task_ids, type:type});
		jQuery.getJSON(getRandomUrl(url), function(data)
		{
			if(data['status'] == '1')
			{
				JKB.loader.hideAjaxLoader();
				split_task_id = task_ids.split(",");
				for(i=0;i<split_task_id.length;i++){
					if(split_task_id[i] != "")
					{
						jQuery('#__task_pause_' + split_task_id[i]).show();
						jQuery('#__task_open_' + split_task_id[i]).hide();
					}
				}
				showSuccMsg('所选项目已全部开启监控，告警通知也将开启工作', '', '', {});
			}
			else if(data['status'] == '3')
			{
				JKB.loader.hideAjaxLoader();
				split_task_id = task_ids.split(",");
				for(i=0;i<split_task_id.length;i++){
					if(split_task_id[i] != "")
					{
						jQuery('#__task_open_' + split_task_id[i]).show();
						jQuery('#__task_pause_' + split_task_id[i]).hide();
						
					}
				}
				showSuccMsg('所选项目已全部暂停监控，告警通知也将暂停工作', '', '', {});
			}
			else if(data['status'] == '-1')
			{
				JKB.loader.hideAjaxLoader();
				showErrorTips('很抱歉，监控项目无法开启，您所选的监控项目数量已达到上限。', '', '', {});
			}
			else if(data['status'] == '-2')
			{
				JKB.loader.hideAjaxLoader();
				showErrorTips('很抱歉，您没有这个权限。', '', '', {});
			}
			else if(data['status'] == '-3')
			{
				JKB.loader.hideAjaxLoader();
				showErrorTips('请选择监控项目。', '', '', {});
			}
		});
	},
	startTaskPause: function(obj)
	{
		if(!obj)
		{
			jkbAlert(err, 'error');
			return;
		}
		
		task_ids = JKB.loader.getCheckedTasks();
		
		jQuery.post(getAjaxWrapper('batch_task_pause'), {task_ids:task_ids}, function(data)
		{
			if(data == '3')
			{
				split_task_id = task_ids.split(",");
				for(i=0;i<split_task_id.length;i++){
					if(split_task_id[i] != "")
					{
						jQuery('#__task_open_' + split_task_id[i]).show();
						jQuery('#__task_pause_' + split_task_id[i]).hide();
						
					}
				}
				showSuccMsg('所选项目已全部暂停监控，告警通知也将开启工作', '', '', {});
			}				
		});
	},
	startTaskCompNew: function(obj)
	{
		var err = '请至少选择1个新的监控项目加入比较';
		if (!obj)
		{
			alert(err);
			return;
		}
		var ids = '';
		var idcount = 0;
		if (obj.length)
		{
			for (var i = 0, length = obj.length; i < length; ++i)
			{
				if (obj[i].checked)
				{
					ids += obj[i].value + ',';
					idcount++;
				}
			}	
		}
		else
		{
			if (!obj.checked)
			{
				alert(err);
				return;
			}
			ids += obj.value + ',';
			idcount++;
		}
		if (idcount + JKB.cache.task_comp_sum > 5)
		{
			alert('很抱歉，最多可以选择5个监控项目进行比较');
			return;
		}		
		window.location = 'task_comp.php?ids=' + JKB.cache.ids + ids;
	},
	hideTaskCompTasks: function()
	{
		jQuery('#__task_comp_new').fadeOut();
	},
	toggleUserReportStatus: function(report_id)
	{
		jQuery.post(getAjaxWrapper('toggle_user_report_status'), {report_id:report_id}, function(data)
		{
			if (data == '0')
			{
				jQuery('#__report_status_btn_' + report_id).html('启用');
				jQuery('#__report_status_' + report_id).html('已停用');
				jQuery('#__report_status_' + report_id).css('color','#999');
				showSuccMsg('已停用该报告，您将不再收到该报告的邮件', '', '', {});
			}
			else if (data == '1')
			{
				jQuery('#__report_status_btn_' + report_id).html('停用');
				jQuery('#__report_status_' + report_id).html('已启用');
				jQuery('#__report_status_' + report_id).css('color','#000');
				showSuccMsg('已启用该报告，您将收到该报告的邮件', '', '', {});
			}
			else if (data == '2')
			{
				showSuccMsg('很抱歉，您无法启用更多的报告，您可以升级套餐计划来启用更多报告。<a href="/account_info" class="link1">查看我的账户</a>', '', '', {});
			}
		});
	},
	reportTasks: function(suffix)
	{
		jQuery('#__list_'+suffix).html('<img src="/images/ajax_loader2.gif" />');
		var ids = jQuery('#ids_'+suffix).val();
		var all = jQuery('#all_'+suffix).val();
		var url = getAjaxWrapper('get_report_task_list', {all:all, ids:ids, suffix:suffix});
		jQuery('#__list_'+suffix).load(getRandomUrl(url), function() {
			jQuery('#__list_'+suffix).fadeIn();
		});
	},
	hideReportTasks: function(suffix)
	{
		jQuery('#__list_'+suffix).fadeOut();
	},
	reportChartTasks: function(suffix)
	{
		var cb = jQuery('#report_has_chart');
		if ( cb[0].checked ) {
			JKB.loader.reportTasks(suffix);
		} else {
			JKB.loader.hideReportTasks(suffix);
		}
	},
	setReportTaskAll: function(all, suffix)
	{
		if (all)
		{
			jQuery('#all_'+suffix).val('1');
			jQuery('#__all_'+suffix).show();
			jQuery('#__part_'+suffix).hide();
		}
		else
		{
			jQuery('#all_'+suffix).val('0');
			jQuery('#__all_'+suffix).hide();
			jQuery('#__part_'+suffix).show();
		}
	},
	toggleAllReportTask: function(c, suffix)
	{
		var tbl = jQuery('#__tbl_list_' + suffix);
		var cbs = jQuery("input:checkbox", tbl[0]);
		for (var i = 0; i < cbs.length; i++)
		{
			cbs[i].checked = c.checked;
		}
	},
	toggleReportTask: function(c, suffix)
	{
		var allchecked = true;
		var tbl = jQuery('#__tbl_list_' + suffix);
		var cbs = jQuery("input:checkbox", tbl[0]);
		for (var i = 0; i < cbs.length; i++)
		{
			if ( cbs[i].id != '__s_all_'+suffix && !cbs[i].checked )
			{
				allchecked = false;
			}
		}
		jQuery('#__s_all_' + suffix).attr('checked', allchecked);
	},
	submitReportTasks: function(suffix, max)
	{
		var form = jQuery('#__form_' + suffix);
		var cbs = jQuery("input:checkbox", form[0]);
		var ids = [];
		var allchecked = true;
		for (var i = 0; i < cbs.length; ++i)
		{
			if(cbs[i].checked)
			{
				ids.push(cbs[i].value);
			}
			else
			{
				allchecked = false;
			}
		}
		if (suffix != 'report_chart_task')
		{
			if(ids.length < 1)
			{
				if (suffix == 'report_server') {
					alert('请至少选择1个服务器加入报告');
				} else if (suffix == 'report_task') {
					alert('请至少选择1个监控项目加入报告');
				}
				return false;
			}
			JKB.loader.setReportTaskAll(allchecked, suffix);
		}
		else
		{
			if (ids.length > max)
			{
				alert('很抱歉，您最多可以选择' + max + '个监控项目生成曲线图。');
				return false;
			}
		}
		jQuery('#ids_' + suffix).val(ids.join(','));
		jQuery('#__list_' + suffix).fadeOut();
		return true;
	},
	onSelectReportTaskSort: function(method)
	{
		if (method == '0')
		{
			jQuery('#__report_server').hide();
			jQuery('#__report_task').show();
			jQuery('#__report_chart_task').show();
		}
		if (method == '1')
		{
			jQuery('#__report_server').show();
			jQuery('#__report_task').hide();
			jQuery('#__report_chart_task').hide();
		}
	},
	reportUsers: function(suffix)
	{
		jQuery('#__list_'+suffix).html('<img src="/images/ajax_loader2.gif" />');
		var ids = jQuery('#ids_'+suffix).val();
		var url = getAjaxWrapper('get_report_user_list', {ids:ids, suffix:suffix});
		jQuery('#__list_'+suffix).load(getRandomUrl(url), function() {
			jQuery('#__list_'+suffix).show();
		});
	},
	newReportUser: function()
	{
		jQuery('#__new_report_user').show();
	},
	hideNewReportUser: function()
	{
		jQuery('#__new_report_user').hide();
	},
	newShareUser: function()
	{
		jQuery('#__new_share_user').show('blind');
	},
	hideNewShareUser: function()
	{
		jQuery('#__new_share_user').hide();
	},
	onUserReportSubmit: function()
	{
		var has_chart = jQuery('#report_has_chart').attr('checked');
		var is_site_task = jQuery('#report_task_sort_0').attr('checked');
		if ( is_site_task && has_chart )
		{
			var tbl = jQuery('#__tbl_list_report_chart_task');
			var cbs = jQuery("input:checkbox", tbl[0]);
			var count = 0;
			for (var i = 0; i < cbs.length; i++)
			{
				if ( cbs[i].id != '__s_all_task_chart_report' && cbs[i].checked )
				{
					count++;
				}
			}
			if (count > 5)
			{
				showErrorMsg('您选择的包含曲线图的项目超过了5个，请重新选择。', '', 'msg_container_chart_task', {});
				return false;
			}
		}

		var max_report_user = jQuery('#max_report_user').val();
		var tbl = jQuery('#__tbl_list_report_user');
		var cbs = jQuery("input:checkbox", tbl[0]);
		var count = 0;
		for (var i = 0; i < cbs.length; i++)
		{
			if ( cbs[i].checked )
			{
				count++;
			}
		}
		if ( count > max_report_user)
		{
			showErrorMsg('很抱歉，您选择的收件人数量超过限制，您可以升级套餐计划来支持更多收件人。<a href="/account_info" class="link1">查看我的账户</a>', '', 'msg_container_new_report_user', {});
			return false;
		}

		submitLoading('btn_submit', 'loading_submit');
		return true;
	},
	onUserInviteSubmit: function()
	{
		var patt = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
		var str = $('#user_emails').val().replace(/^\s+|\s+$/, '');
		if ( !str.length ) {
			showErrorMsg('很抱歉，您没有填写Email，请填写后再次尝试。', '', 'msg_container_email_invite', {});
			return false;
		}
		var emails = str.split(/\r\n|\r|\n/);
		for (var i = 0; i< emails.length; i++) {
			if ( !patt.test(emails[i]) ) {
				showErrorMsg('很抱歉，您填写的Email中存在错误地址，请确认再次尝试。', '', 'msg_container_email_invite', {});
				return false;
			}
		}
		submitLoading('btn_submit', 'loading_submit');
		return true;
	},
	alertUsers: function( sel, type, id )
	{
		var sels = '';
		if ( sel ) {
			var tbl = jQuery('#__tbl_alert_user');
			var cbs = jQuery("input:checkbox", tbl[0]);
			var arr = [];
			for (var i = 0; i < cbs.length; i++) {
				if ( cbs[i].checked ) {
					arr.push(cbs[i].value + ':' + cbs[i].name.replace('\[\]',''));
				}
			}
			sels = arr.join(',');
		}
		var url = getAjaxWrapper('get_alert_user_list', {sels:sels, type:type, id:id});
		jQuery('#__list_alert_user').html('<img src="/images/ajax_loader2.gif" />');
		jQuery('#__list_alert_user').load(getRandomUrl(url), function(){
			jQuery('#__list_alert_user').show();
			jQuery('#__alert_user_add').show();
			jQuery('#__alert_submit').show();
		});
	},
	submitNewAlertUser: function( type, id )
	{
		var user_nick = jQuery('#user_nick_new_alert_user').val();
		var user_email = jQuery('#user_email_new_alert_user').val();
		var url = getAjaxWrapper('add_new_alert_user', {user_nick:user_nick, user_email:user_email});
		submitLoading('btn_submit_new_alert_user', 'loading_submit_new_alert_user');
		jQuery.getJSON(getRandomUrl(url), function(json) {
            var res = json['res'];
		    var msg = json['msg'];
            if ( res == '2') {
				showControllerErrorMsg(msg, '', '', {});
			}
            else if ( res == '1') {
				showErrorMsg(msg, '', 'msg_container_new_alert_user', {});
			}
            else if ( res == '0') {
				showSuccMsg(msg, '', 'msg_container_new_alert_user', {});
				JKB.loader.hideNewShareUser();
				JKB.loader.alertUsers(1, type, id);
			}
		});
	},

	onUserEditionSubmit: function()
	{
		var inp = $('input:radio');
		var price_edition = 0;
		for (i=0;i<inp.length;i++) {
			if ( inp[i].checked ){
				price_edition = parseInt( $(inp[i]).attr('price') );
			}
		}

		var plus_price_total = 0;
		jQuery('.ipt_plus_count').each(function() {
			var price = jQuery(this).attr('price');
			var plus_count = jQuery(this).val() / 1;
			if (plus_count % 1 != 0) {
				plus_count = 0;
			}
            plus_price_total += parseInt(plus_count * price);
		});

		var user_status = $('#to_user_status')[0].value;
		if (user_status == '0') {
			alert('你不能给状态为等待激活的用户赠送。');
			return false;
		}

		var month = parseInt($('#sel_month')[0].value);

		var total =  month*(price_edition+plus_price_total);
		if (total <= 0 ) {
			alert('你选择的套餐价值为 0，请重新定制。');
			return false;
		}

		var desc_len = $('#description')[0].value.replace(/^\s+|\s+$/, '').length;
		if ( desc_len <= 0 ) {
			alert('请填写备注信息。');
			return false;
		}

		var str = '您选择的套餐方案总价值为 ' + total + ' 元，确认提交吗？';
		if(confirm(str)) {
			return true;
		}
		return false;
	},
	submitNewReportUser: function(suffix)
	{
		var user_nick = jQuery('#user_nick_'+suffix).val();
		var user_email = jQuery('#user_email_'+suffix).val();
		var url = getAjaxWrapper('add_new_report_user', {user_nick:user_nick, user_email:user_email, suffix:suffix});
		submitLoading('btn_submit_'+suffix, 'loading_submit_'+suffix);
		jQuery.getJSON(getRandomUrl(url), function(json) {
            var res = json['res'];
		    var msg = json['msg'];
            if ( res == '2') {
				showControllerErrorMsg(msg, '', '', {});
			}
            else if ( res == '1') {
				showErrorMsg(msg, '', 'msg_container_'+suffix, {});
			}
            else if ( res == '0') {
				showSuccMsg(msg, '', 'msg_container_'+suffix, {});
				jQuery('#__new_report_user').hide();
				JKB.loader.hideNewReportUser();
				JKB.loader.reportUsers('report_user');
			}
		});
	},
	reportServers: function(suffix)
	{
		jQuery('#__list_'+suffix).html('<img src="/images/ajax_loader2.gif" />');
		var ids = jQuery('#ids_'+suffix).val();
		var all = jQuery('#all_'+suffix).val();
		var url = getAjaxWrapper('get_report_server_list', {all:all, ids:ids, suffix:suffix});
		jQuery('#__list_'+suffix).load(getRandomUrl(url), function() {
			jQuery('#__list_'+suffix).show();
		});
	},
	getUserEditionInfo: function ()
	{
		var user_email = $('#user_email').val();
		var patt = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
		//var patt = /^\s*[\w\-\+_]+(\.[\w\-\+_]+)*\@[\w\-\+_]+\.[\w\-\+_]+(\.[\w\-\+_]+)*\s*$/;
		//var patt = /^([a-zA-Z0-9_.-])+@(([a-zA-Z0-9-])+.)+([a-zA-Z0-9]{2,4})+$/;
		if ( !patt.test(user_email) )
		{
			alert('您输入的 Email 地址错误，请重新输入。');
			return false;
		}
		$('#__form')[0].submit();
		return true;
	},
	getPlanPlus: function (edition)
	{
		$('#edition').val(edition);
		$('#__form')[0].submit();
		return true;
	},
	onSelectTaskHttpMethod: function(method)
	{
		if (method == '0')
		{
			jQuery('#__ctrl_param').fadeOut();
			jQuery('#__ctrl_pattern_str').fadeIn();
			jQuery('#__ctrl_pattern_type').fadeIn();
		}
		if (method == '1')
		{
			jQuery('#__ctrl_param').fadeIn();
			jQuery('#__ctrl_pattern_str').fadeIn();
			jQuery('#__ctrl_pattern_type').fadeIn();
		}
		if (method == '2')
		{
			jQuery('#__ctrl_param').fadeOut();
			jQuery('#__ctrl_pattern_str').fadeOut();
			jQuery('#__ctrl_pattern_type').fadeOut();
		}
	},
	onSelectTaskFtpAnon: function(method)
	{
		if (method == '0')
		{
			jQuery('#__ctrl_ftp_user').fadeIn();
			jQuery('#__ctrl_ftp_pwd').fadeIn();
		}
		if (method == '1')
		{
			jQuery('#__ctrl_ftp_user').fadeOut();
			jQuery('#__ctrl_ftp_pwd').fadeOut();
		}
	},
	loadSummaryView: function()
	{
		JKB.loader.showAjaxLoader();
		ajax_url = getAjaxWrapper('get_summary_view', {});
		jQuery('#__summary_frame').load(getRandomUrl(ajax_url), function()
		{
			//$('#__test').tooltip({delay: 0});
			JKB.loader.hideAjaxLoader();
			JKB.loader.reloadSummaryView();
		});
	},
	reloadSummaryView: function()
	{
		var t = 30;
		jQuery('#__reload').html(t + ' 秒后自动更新')
		var timer = setInterval(function(){
			if (t-- == 1)
			{
				jQuery('#__reload').html('正在自动更新')
				clearInterval(timer);
				JKB.loader.loadSummaryView();
			}
			else
			{
				jQuery('#__reload').html(t + ' 秒后自动更新')
			}
		}, 1000);
	},
	showTaskPriority: function(container, pri, task_id)
	{
		var priority = pri / 1;
		var html = '';
		for (var i = 0; i < 5; ++i)
		{
			var img = '';
			if (i < priority)
				img = 'favorite.gif';
			else
				img = 'star.gif';
			html += '<a href="" onclick="JKB.loader.modifyTaskPriority(\'' + container + '\', ' + (i + 1) + ', ' + task_id + ');return false;"><img src="/images/' + img + '" /></a>';
		}
		jQuery('#' + container).html(html);
	},
	modifyTaskPriority: function(container, pri, task_id)
	{
		jQuery('#' + container).html('<img src="/images/ajax_loader4.gif" />');
		jQuery.post(getAjaxWrapper('modify_task_priority'), {task_id:task_id, pri:pri}, function()
		{
			JKB.cache.task_list_data = [];
			JKB.loader.showTaskPriority(container, pri, task_id);
		});
	},
	showPriority: function(container, pri)
	{
		var priority = pri / 1;
		var html = '';
		for (var i = 0; i < 5; ++i)
		{
			var img = '';
			if (i < priority)
				img = 'favorite.gif';
			else
				img = 'star.gif';
			html += '<img src="/images/' + img + '" />';
		}
		jQuery('#' + container).html(html);
	},
	onNewServerTh: function()
	{
		jQuery('#sel_threshold_tasks').fadeIn();
		jQuery('#__threshold_op').hide();
	},
	loadThresholdNew: function(task_type, task_id, th_id, task_sort)
	{
		jQuery('#__threshold_new').html('<img src="/images/ajax_loader2.gif" />');
		jQuery('#__threshold_new').show();
		jQuery('#add_threshold').hide();
		if (th_id)
			jQuery('#sel_threshold_tasks').hide();
		var ajax_url = getAjaxWrapper('task_threshold_new', {task_type:task_type, task_id:task_id, th_id:th_id, task_sort:task_sort});
		jQuery('#__threshold_new').load(getRandomUrl(ajax_url), function()
		{
			jQuery('#__threshold_new').fadeIn();
		});
	},
	hideThCreator: function()
	{
		jQuery('#__threshold_new').fadeOut();
		jQuery('#__threshold_op').show();
		jQuery('#add_threshold').show();
		jQuery('#sel_threshold_tasks').hide();
	},
	initThDefine: function()
	{
		eval("JKB.cache.th_define=" + JKB.cache.th_define);
		eval("JKB.cache.th_metric=" + JKB.cache.th_metric);
		eval("JKB.cache.th_cond=" + JKB.cache.th_cond);
		eval("JKB.cache.th_comp=" + JKB.cache.th_comp);
		eval("JKB.cache.th_unit=" + JKB.cache.th_unit);
	},
	loadThMetricSelect: function()
	{
		this.initThDefine();
		for (var metric in JKB.cache.th_define)
		{
			jQuery("<option value='" + metric + "'>" + JKB.cache.th_metric[metric] + "</option>").appendTo("#__th_metric_sel");
		}
		this.loadThCondSelect();
	},
	loadThCondSelect: function()
	{
		var metric = jQuery("#__th_metric_sel").val();
		var metric_info = JKB.cache.th_define[metric];
		jQuery("#__th_cond_sel").empty();
		for (var cond in metric_info)
		{
			jQuery("<option value='" + cond + "'>" + JKB.cache.th_cond[cond] + "</option>").appendTo("#__th_cond_sel");
		}
		this.loadThMetricCondSchema();
	},
	loadThMetricCondSchema: function()
	{
		var metric = jQuery("#__th_metric_sel").val();
		var cond = jQuery("#__th_cond_sel").val();
		var metric_info = JKB.cache.th_define[metric];
		var cond_info = metric_info[cond];
		if (cond_info['unit'])
		{
			var count = cond_info['unit'].length;
			if (count > 1)
			{
				jQuery("#__th_unit_sel").empty();
				for (var i = 0; i < count; ++i)
				{
					jQuery("<option value='" + cond_info['unit'][i] + "'>" + JKB.cache.th_unit[cond_info['unit'][i]][0] + "</option>").appendTo("#__th_unit_sel");
				}
				jQuery("#__th_unit_sel").show();
				jQuery("#__th_unit").hide();
			}
			else
			{
				jQuery("#__th_unit").html(JKB.cache.th_unit[cond_info['unit'][0]][0]);
				jQuery("#__th_unit").show();
				jQuery("#__th_unit_sel").empty();
				jQuery("#__th_unit_sel").hide();
				jQuery("<option value='" + cond_info['unit'][0] + "'>" + JKB.cache.th_unit[cond_info['unit'][0]][0] + "</option>").appendTo("#__th_unit_sel");
			}
		}
		else
		{
			jQuery("#__th_unit_sel").hide();
			jQuery("#__th_unit").hide();
		}
		
		if (cond_info['comp'])
		{
			var count = cond_info['comp'].length;
			jQuery("#__th_comp_sel").empty();
			for (var i = 0; i < count; ++i)
			{
				jQuery("<option value='" + cond_info['comp'][i] + "' title='" + JKB.cache.th_comp[cond_info['comp'][i]] + "'>" + JKB.cache.th_comp[cond_info['comp'][i]] + "</option>").appendTo("#__th_comp_sel");
			}
			jQuery("#__th_comp").show();
		}
		else
		{
			jQuery("#__th_comp").hide();
		}
		
		if (cond_info['max'])
		{
			var count = cond_info['max'];
			jQuery("#__th_max_sel").empty();
			for (var i = 1; i <= count; ++i)
			{
				jQuery("<option value='" + i + "'>" + i + "</option>").appendTo("#__th_max_sel");
			}
			jQuery("#__th_max").show();
		}
		else
		{
			jQuery("#__th_max").hide();
		}
		
		if (cond_info['dev_title'])
		{
			jQuery('#__th_dev_title').html(cond_info['dev_title']);
			jQuery("#__th_dev").show();
		}
		else
		{
			jQuery("#__th_dev").hide();
		}
		if (cond_info['dev'])
		{
			jQuery("#__th_dev_sel").empty();
			for (var devid in cond_info['dev'])
			{
				jQuery("<option value='" + devid + "'>" + cond_info['dev'][devid] + "</option>").appendTo("#__th_dev_sel");
			}
		}
	},
	showNewMsgSum: function()
	{
		var ajax_url = getAjaxWrapper('get_new_msg_sum', {});
		jQuery.getJSON(getRandomUrl(ajax_url), function(json)
		{
			var msg_sum = json['msg_sum'] / 1;
			var msg_style = json['msg_style'];
			if (msg_sum > 0)
			{
				if(msg_style)
				{
					jQuery('#__adm_msg_newsum').addClass(msg_style);
				}
				if (json['alert_sound'] == '1')
				{  
					var ua = navigator.userAgent.toLowerCase();
					if(ua.match(/msie ([\d.]+)/)){
						  jQuery('#__alert_sound').html('<object classid="clsid:22D6F312-B0F6-11D0-94AB-0080C74C7E95"><param name="AutoStart" value="1" /><param name="Src" value="/sounds/alert/1.mp3" /></object>');
						}
					else if(ua.match(/firefox\/([\d.]+)/)){
						  jQuery('#__alert_sound').html('<embed src="/sounds/alert/1.mp3" type="audio/mp3" autostart="true" hidden="true" loop="false" mastersound></embed>');
						}
					else if(ua.match(/chrome\/([\d.]+)/)){
						  jQuery('#__alert_sound').html('<audio src="/sounds/alert/1.mp3" type="audio/mp3" autoplay=”autoplay” hidden="true"></audio>');
						}
					else if(ua.match(/opera.([\d.]+)/)){
						  jQuery('#__alert_sound').html('<embed src="/sounds/alert/1.mp3" autostart="true" hidden="true" loop="false"><noembed><bgsounds src="/sounds/alert/1.mp3"></noembed>'); 
						}			
					else if(ua.match(/version\/([\d.]+).*safari/)){
						  jQuery('#__alert_sound').html('<audio src="/sounds/alert/1.mp3" type="audio/mp3" autoplay=”autoplay” hidden="true"></audio>');
						}
					else {
						 jQuery('#__alert_sound').html('<embed src="/sounds/alert/1.mp3" type="audio/mp3" autostart="true" hidden="true" loop="false" mastersound></embed>');
						}	
														
				}
				
				var msg_sum_str = msg_sum;
				if(msg_sum > 99)
				{
					msg_sum_str = '99+';	
				}
				jQuery('#__adm_msg_newsum').fadeIn('fast', function(){jQuery('#__adm_msg_newsum').html(msg_sum_str);});
				//JKB.loader.showAlertLayer();
				showWinTitleNewMsg(msg_sum);
			}
			else
			{
				jQuery('#__adm_msg_newsum').fadeOut();
				//JKB.loader.hideAlertLayer();
				resumeWinTitle();
			}
		});
	},
	showAlertLayer: function()
	{
		var scrollTop = document.body.scrollTop;
		if (scrollTop == 0)
			scrollTop = document.documentElement.scrollTop;
		var top = (document.documentElement.clientHeight - 100 + scrollTop) + 'px';
		var clientWidth = document.documentElement.clientWidth;
		var pageWidth = 980;
		var left = (clientWidth - (clientWidth - 980) / 2 - 150) + 'px';
		jQuery('#msgAlert').css('top', top);
		jQuery('#msgAlert').css('left', left);
		jQuery('#msgAlert').fadeIn('slow');
		$(window).scroll(function(){
			var scrollTop = document.body.scrollTop;
			if (scrollTop == 0)
				scrollTop = document.documentElement.scrollTop;
			var top = (document.documentElement.clientHeight - 100 + scrollTop) + 'px';
			var clientWidth = document.documentElement.clientWidth;
			var pageWidth = 980;
			var left = (clientWidth - (clientWidth - 980) / 2 - 150) + 'px';
			jQuery('#msgAlert').css('top', top);
			jQuery('#msgAlert').css('left', left);
		});
	},
	hideAlertLayer: function()
	{
		jQuery('#msgAlert').fadeOut();
	},
	loadMsgStatusFilter: function(status)
	{
		this.showAjaxLoader();
		window.location = '/alert/message?status=' + status + '&range=' + JKB.cache.dt_range;
		return false;
	},
	loadSysInfo: function()
	{
		this.showAjaxLoader();
		var key = 'sys_info';
		var include_status = 'include';
		
		if(jQuery('#sys_info_include').attr('checked') == false){
			include_status = 'no_include';
		}
		JKB.loader.setCookie(key, include_status);
		
		window.location = '/alert/message?range=' + JKB.cache.dt_range;
		return false;
	},	
	loadAlertTypeFilter: function(type)
	{
		this.showAjaxLoader();
		var dt_range = JKB.cache.dt_range;
		var uid = '';
		if(jQuery('#__alert_user_single').attr('checked') == true){
			uid = jQuery('#__share_user_list').val();
		}
		window.location = '/alert/history?type=' + type + '&range=' + dt_range + '&u=' + uid;
		return false;
	},
	loadThStatusFilter: function(status)
	{
		this.showAjaxLoader();
		window.location = '/alert_threshold_list.php?status=' + status;
		return false;
	},
	showNetIODevInfo: function(elem)
	{
		if (jQuery('#' + elem).css('display') == 'none')
		{
			jQuery('#' + elem).fadeIn();
		}
		else
		{
			jQuery('#' + elem).fadeOut();
		}
	},
	showHelper: function(elem)
	{
		if (jQuery('#' + elem).css('display') == 'none')
		{
			jQuery('#' + elem).fadeIn();
		}
		else
		{
			jQuery('#' + elem).fadeOut();
		}
	},
	showSubMenu: function(elem)
	{
		if (jQuery('#' + elem).css('display') == 'none')
		{
			jQuery('#' + elem).show('fast');
			if (elem == '__submenu_list_class')
			{
				JKB.loader.loadTaskClassList();
			}
		}
		else
		{
			jQuery('#' + elem).hide('fast');
		}
		return false;
	},
	loadTaskClassList: function(class_id)
	{
		jQuery('#__class_list').html('<div class="menu_title2"><img src="/images/ajax_loader4.gif" /></div>');
		var ajax_url = getAjaxWrapper('get_task_class_list', {class_id:class_id});
		jQuery('#__class_list').load(getRandomUrl(ajax_url), function()
		{
			
		});
		return true;
	},
	loadUserViewList: function(view_id)
	{
		jQuery('#__view_list').html('<div class="menu_title2"><img src="/images/ajax_loader4.gif" /></div>');
		var ajax_url = getAjaxWrapper('get_user_view_list', {view_id:view_id});
		jQuery('#__view_list').load(getRandomUrl(ajax_url), function()
		{
			
		});
		return true;
	},
	delUserView: function(view_id)
	{
		if (!confirm('确定要删除这个视图吗？'))
		{
			return false;
		}
		__hidden_call.window.location = '/dispose.php?__action=view_del&view_id=' + view_id;
		return true;
	},
	delTaskClass: function(class_id)
	{
		if (!confirm('确定要删除这个分类吗？\r\n\r\n删除分类并不会影响分类中的监控项目。'))
		{
			return false;
		}
		__hidden_call.window.location = '/dispose.php?__action=task_class_del&class_id=' + class_id;
		return true;
	},
	showTaskClassSel: function(tmp)
	{
		JKB.loader.hideShareUserSel();
		jQuery('#__task_class_sel').html('<img src="/images/ajax_loader4.gif" />');
		var ajax_url = getAjaxWrapper('get_task_class_sel', {tmp:tmp});
		jQuery('#__task_class_sel').load(getRandomUrl(ajax_url), function()
		{
			jQuery('#__task_class_sel').fadeIn();
		});
		return true;
	},
	hideTaskClassSel: function()
	{
		jQuery('#__task_class_sel').fadeOut();
	},
	addMultiTaskClass: function()
	{
		var elem = document.__form.task_class_sel;
		var class_id = elem.options[elem.selectedIndex].value;
		var ids  = JKB.loader.getCheckedTasks();
		if (ids == '')
		{
			return;
		}
		jQuery('#__task_class_sel').html('<img src="/images/ajax_loader4.gif" />');
		jQuery.post(getAjaxWrapper('add_multi_task_to_class'), {ids:ids, class_id:class_id}, function()
		{
			jQuery('#__task_class_sel').html('');
			showSuccMsg('您选择的监控项目已成功加入分组！', '', '', {});
		});
	},
	showShareUserSel: function()
	{
		JKB.loader.hideTaskClassSel();
		jQuery('#__share_user_sel').html('<img src="/images/ajax_loader4.gif" />');
		var ajax_url = getAjaxWrapper('get_share_user_sel', {});
		jQuery('#__share_user_sel').load(getRandomUrl(ajax_url), function()
		{
			jQuery('#__share_user_sel').fadeIn();
		});
		return true;
	},
	hideShareUserSel: function()
	{
		jQuery('#__share_user_sel').fadeOut();
	},
	addMultiTaskShareUser: function()
	{
		var elem = document.__form.share_user_sel;
		var user_id = elem.options[elem.selectedIndex].value;
		var ids  = JKB.loader.getCheckedTasks();
		if (ids == '')
		{
			return;
		}
		jQuery('#__share_user_sel').html('<img src="/images/ajax_loader4.gif" />');
		jQuery.post(getAjaxWrapper('add_multi_task_share_user'), {ids:ids, user_id:user_id}, function()
		{
			jQuery('#__share_user_sel').html('');
			showSuccMsg('您选择的监控项目已成功共享给 <em>' + elem.options[elem.selectedIndex].getAttribute('data') + '</em>', '', '', {});
		});
	},
	addTaskClass: function(task_id, class_id)
	{
		jQuery('#__task_class_sel').html('<img src="/images/ajax_loader4.gif" />');
		jQuery.post(getAjaxWrapper('add_task_to_class'), {task_id:task_id, class_id:class_id}, function()
		{
			jQuery('#__task_class_sel').html('');
			showSuccMsg('已成功加入分组！您可以按分组来查看监控项目。', '', '', {});
			JKB.loader.closeAllDropMenu();
		});
	},
	getCheckedTasks: function()
	{
		var err = '很抱歉，请选择至少1个监控项目';
		var obj = document.__form.task_comp;
		if (!obj)
		{
			alert(err);
			return '';
		}
		var ids = '';
		var idcount = 0;
		if (obj.length)
		{
			for (var i = 0, length = obj.length; i < length; ++i)
			{
				if (obj[i].checked)
				{
					ids += obj[i].value + ',';
					idcount++;
				}
			}
			if (idcount < 1)
			{
				alert(err);
				return '';
			}
		}
		else
		{
			ids += obj.value + ',';
		}
		return ids;
	},
	showTaskMediumBindIcon: function(medium, stat, task_id, user_id)
	{
		if (stat == '1')
		{
			jQuery('#__' + medium + '_' + task_id).html('<a href="" onclick="return JKB.loader.changeTaskMediumSettings(\'' + medium + '\', \'' + task_id + '\', \'' + user_id + '\');" title="禁用通知"><img src="/images/tick.png" /></a>');
		}
		else
		{
			jQuery('#__' + medium + '_' + task_id).html('<a href="" onclick="return JKB.loader.changeTaskMediumSettings(\'' + medium + '\', \'' + task_id + '\', \'' + user_id + '\');" title="开启通知"><img src="/images/tick_disable.gif" /></a>');
		}
	},
	changeTaskMediumSettings: function(medium, task_id, user_id)
	{
		jQuery('#__' + medium + '_' + task_id).html('<img src="/images/loading.gif" />');
		var ajax_url = getAjaxWrapper('task_medium_settings', {task_id:task_id,medium:medium,u:user_id});
		jQuery.getJSON(getRandomUrl(ajax_url), function(json)
		{
			stat = json['stat'];
			JKB.loader.showTaskMediumBindIcon(medium, stat, task_id, user_id);
		});
		return false;
	},
	showServerMediumBindIcon: function(medium, stat, server_id, user_id)
	{		
		var medium_id = 'server_' + medium;
		if (stat == '1')
		{
			jQuery('#__' + medium_id + '_' + server_id).html('<a href="" onclick="return JKB.loader.changeServerMediumSettings(\'' + medium + '\', \'' + server_id + '\', \'' + user_id + '\');" title="禁用通知"><img src="/images/tick.png" /></a>');
		}
		else
		{
			jQuery('#__' + medium_id + '_' + server_id).html('<a href="" onclick="return JKB.loader.changeServerMediumSettings(\'' + medium + '\', \'' + server_id + '\', \'' + user_id + '\');" title="开启通知"><img src="/images/tick_disable.gif" /></a>');
		}
	},
	changeServerMediumSettings: function(medium, server_id, user_id)
	{
		var medium_id = 'server_' + medium;
		jQuery('#__' + medium_id + '_' + server_id).html('<img src="/images/loading.gif" />');
		var ajax_url = getAjaxWrapper('server_medium_settings', {server_id:server_id,medium:medium,u:user_id});
		jQuery.getJSON(getRandomUrl(ajax_url), function(json)
		{
			stat = json['stat'];
			JKB.loader.showServerMediumBindIcon(medium, stat, server_id, user_id);
		});
		return false;
	},
	showServiceMediumBindIcon: function(medium, stat, task_id, user_id)
	{		
		var medium_id = 'service_' + medium;
		if (stat == '1')
		{
			jQuery('#__' + medium_id + '_' + task_id).html('<a href="" onclick="return JKB.loader.changeServiceMediumSettings(\'' + medium + '\', \'' + task_id + '\', \'' + user_id + '\');" title="禁用通知"><img src="/images/tick.png" /></a>');
		}
		else
		{
			jQuery('#__' + medium_id + '_' + task_id).html('<a href="" onclick="return JKB.loader.changeServiceMediumSettings(\'' + medium + '\', \'' + task_id + '\', \'' + user_id + '\');" title="开启通知"><img src="/images/tick_disable.gif" /></a>');
		}
	},
	changeServiceMediumSettings: function(medium, task_id, user_id)
	{
		var medium_id = 'service_' + medium;
		jQuery('#__' + medium_id + '_' + task_id).html('<img src="/images/loading.gif" />');
		var ajax_url = getAjaxWrapper('service_medium_settings', {task_id:task_id,medium:medium,u:user_id});
		jQuery.getJSON(getRandomUrl(ajax_url), function(json)
		{
			stat = json['stat'];
			JKB.loader.showServiceMediumBindIcon(medium, stat, task_id, user_id);
		});
		return false;
	},		
	showReportUserBindIcon: function(report_id, status)
	{
		if (status == '1')
		{
			jQuery('#__report_user_status_' + report_id).html('<a href="" onclick="return JKB.loader.toggleReportUserStatus(\'' + report_id + '\');" title=""><img src="/images/tick.png" /></a>');
		}
		else
		{
			jQuery('#__report_user_status_' + report_id).html('<a href="" onclick="return JKB.loader.toggleReportUserStatus(\'' + report_id + '\');" title=""><img src="/images/tick_disable.gif" /></a>');
		}
	},
	toggleReportUserStatus: function(report_id)
	{
		jQuery('#__report_user_status_' + report_id).html('<img src="/images/loading.gif" />');
		var ajax_url = getAjaxWrapper('report_user_status', {report_id:report_id});
		jQuery.getJSON(getRandomUrl(ajax_url), function(json)
		{
			var status = json['status'];
			JKB.loader.showReportUserBindIcon(report_id, status);
		});
		return false;
	},
	showMediumBindIcon: function(medium, stat)
	{
		if (stat == '1')
		{
			jQuery('#__' + medium).html('<a href="" onclick="return JKB.loader.changeMediumSettings(\'' + medium + '\');" title="禁用通知"><img src="/images/tick.png" /></a>');
		}
		else
		{
			jQuery('#__' + medium).html('<a href="" onclick="return JKB.loader.changeMediumSettings(\'' + medium + '\');" title="开启通知"><img src="/images/tick_disable.gif" /></a>');
		}
	},
	changeMediumSettings: function(medium)
	{
		jQuery('#__' + medium).html('<img src="/images/loading.gif" />');
		var ajax_url = getAjaxWrapper('medium_settings', {medium:medium});
		jQuery.getJSON(getRandomUrl(ajax_url), function(json)
		{
			stat = json['stat'];
			JKB.loader.showMediumBindIcon(medium, stat);
		});
		return false;
	},
	showThStatusIcon: function(th_id, stat)
	{
		//if (stat == '1')
		if (stat == '0')
		{
			jQuery('#__th_status_' + th_id).html('<a href="" onclick="return JKB.loader.changeThStatusIcon(\'' + th_id + '\');" title="关闭自定义告警"><img src="/images/tick.png" /></a>');
		}
		else
		{
			jQuery('#__th_status_' + th_id).html('<a href="" onclick="return JKB.loader.changeThStatusIcon(\'' + th_id + '\');" title="开启自定义告警"><img src="/images/tick_disable.gif" /></a>');
		}
	},
	changeThStatusIcon: function(th_id)
	{
		jQuery('#__th_status_' + th_id).html('<img src="/images/loading.gif" />');
		var ajax_url = getAjaxWrapper('th_status_modify', {th_id:th_id});
		jQuery.getJSON(getRandomUrl(ajax_url), function(json)
		{
			stat = json['stat'];
			JKB.loader.showThStatusIcon(th_id, stat);
		});
		return false;
	},	
	loadServerTaskLastMsgs: function(task_id, server_id, server_ip)
	{
		ajax_url = getAjaxWrapper('get_server_task_last_msg', {task_id:task_id, sid:server_id, sip:server_ip});
		jQuery('#__alert_msg').load(getRandomUrl(ajax_url), function()
		{
			
		});
	},
	loadServerLastMsgs: function(server_id)
	{
		ajax_url = getAjaxWrapper('get_server_task_last_msg', {server_id:server_id});
		jQuery('#__alert_msg').load(getRandomUrl(ajax_url), function()
		{
			
		});
	},
	showProgress: function(width, percent)
	{
		var pb_dis = width / 2 - 18;
		var pb_used = width * percent / 100;
		var pb_empty = width - pb_used;
		var html = '<div class="pb_box"><p class="left"></p><p class="green" style="width:' + pb_used + 'px;"></p><p class="empty" style="width:' + pb_empty + 'px;"></p><p class="right"></p><div class="dis" style="left:' + pb_dis + 'px">' + percent + '%</div></div>';
		document.write(html);
	},
	showStatusBar: function(width, percent, value, tips, alink, color)
	{
		var html = '<p class="statusbar_frame" title="' + tips + '"><span class="status_value">';
		if (alink)
		{
			html += '<a href="' + alink + '"><span style="color:' + color + '">' + value + '</span></a>';
		}
		else
		{
			html += '<span style="color:' + color + '">' + value + '</span>';
		}
		html += '</span><span style="width:' + width + 'px;" class="statusbar_box"><span class="statusbar_value" style="width:' + percent + '%;background-color:' + color + ';"></span></span></p>';
		document.write(html);
	},
	hideTask: function(task_id)
	{
		jQuery('#__task_' + task_id).fadeOut('slow');
		jQuery('#__task_name_' + task_id).fadeOut('slow');
	},
	setMetricSelectorTab: function(tab)
	{
		if (JKB.cache.curr_metric_tab)
		{
			jQuery('#' + JKB.cache.curr_metric_tab).removeClass();
		}
		jQuery('#' + tab).addClass('selected');
		JKB.cache.curr_metric_tab = tab;
	},
	loadMetricSelector: function(elem)
	{
		JKB.cache.curr_overlay_container = elem;
		jQuery('#metric_selector').show();
		jQuery('#metric_selector').html('<img src="/images/loading.gif" />');
		var ajax_url = getAjaxWrapper('get_metric_selector', {});
		jQuery('#metric_selector').load(getRandomUrl(ajax_url), function()
		{
			jQuery('#metric_selector').show('blind');
			JKB.loader.loadMetricSiteTask('__metric_tab_site');
		});
	},
	loadMetricSiteTask: function(tab)
	{
		JKB.loader.setMetricSelectorTab(tab);
		jQuery('#metric_task_list').html('<img src="/images/loading.gif" />');
		var ajax_url = getAjaxWrapper('get_metric_site_task', {});
		jQuery('#metric_task_list').load(getRandomUrl(ajax_url), function()
		{
			
		});
	},
	loadMetricSiteTaskMetric: function(view_id, task_type, task_id, task_name)
	{
		JKB.cache.metric_task_name = task_name;
		jQuery('#__task_' + task_id + '_metric_list').html('<div style="padding:6px 15px;"><img src="/images/loading.gif" /></div>');
		var ajax_url = getAjaxWrapper('get_metric_site_task_metric', {view_id:view_id, task_type:task_type, task_id:task_id});
		jQuery('#__task_' + task_id + '_metric_list').load(getRandomUrl(ajax_url), function()
		{
			jQuery('#__task_' + task_id + '_metric_list').fadeIn();
		});
	},
	loadMetricServer: function(tab)
	{
		JKB.loader.setMetricSelectorTab(tab);
		jQuery('#metric_task_list').html('<img src="/images/loading.gif" />');
		var ajax_url = getAjaxWrapper('get_metric_server', {});
		jQuery('#metric_task_list').load(getRandomUrl(ajax_url), function()
		{
			
		});
	},
	loadMetricServerTask: function(server_id, server_name, view_id)
	{
		JKB.cache.metric_task_name = server_name;
		var div_id = '#__server_' + server_id + '_task_list';
		jQuery(div_id).html('<div style="padding:6px 15px;"><img src="/images/loading.gif" /></div>');
		var ajax_url = getAjaxWrapper('get_metric_server_task', {server_id:server_id,server_name:encodeURIComponent(server_name), view_id:view_id});
		jQuery(div_id).load(getRandomUrl(ajax_url), function()
		{
			
		});
	},
	loadMetricServerTaskMetric: function(view_id, task_type, task_id, task_name)
	{
		jQuery('#__task_' + task_id + '_metric_list').html('<img src="/images/loading.gif" />');
		var ajax_url = getAjaxWrapper('get_metric_server_task_metric', {view_id:view_id, task_type:task_type, task_id:task_id});
		jQuery('#__task_' + task_id + '_metric_list').load(getRandomUrl(ajax_url), function()
		{
			jQuery('#__task_' + task_id + '_metric_list').fadeIn();
		});
	},
	loadMetricServiceTask: function(tab)
	{
		JKB.loader.setMetricSelectorTab(tab);
		jQuery('#metric_task_list').html('<img src="/images/loading.gif" />');
		var ajax_url = getAjaxWrapper('get_metric_service_task', {});
		jQuery('#metric_task_list').load(getRandomUrl(ajax_url), function()
		{
			
		});
	},
	loadMetricAdvanceCompare: function(tab)
	{
		JKB.loader.setMetricSelectorTab(tab);
		jQuery('#metric_task_list').html('<img src="/images/loading.gif" />');
		
		var ajax_url = getAjaxWrapper('get_metric_advance_compare', {});
		jQuery('#metric_task_list').load(getRandomUrl(ajax_url), function()
		{
			
		});
	},
	loadMetricServiceTaskMetric: function(view_id, task_type, task_id, task_name)
	{
		JKB.cache.metric_task_name = task_name;
		jQuery('#__task_' + task_id + '_metric_list').html('<div style="padding:6px 15px;"><img src="/images/loading.gif" /></div>');
		var ajax_url = getAjaxWrapper('get_metric_service_task_metric', {view_id:view_id, task_type:task_type, task_id:task_id});
		jQuery('#__task_' + task_id + '_metric_list').load(getRandomUrl(ajax_url), function()
		{
			jQuery('#__task_' + task_id + '_metric_list').fadeIn();
		});
	},
	
	add_compare_widget_metric: function(view_id, crt_id, widget_style)	//添加同期对比的视图
	{
		var div = '#__compare_' + crt_id + '_metric_list';
		jQuery(div).html('<div style="padding:6px 15px;"><img src="/images/loading.gif" /></div>');
		var ajax_url = getAjaxWrapper('add_compare_widget_metric', {view_id:view_id, report_id:crt_id, widget_style:widget_style});
		

		jQuery.getJSON(getRandomUrl(ajax_url), function(json) {
            var res = json['res'];
		    var msg = json['msg'];
            if ( res == '1') { // failed
				showErrorMsg(msg, '', 'msg_container_view_widget', {});
			}
            else if ( res == '0') { // ok
            	/*
				var widget_id = msg;
				//showSuccMsg('添加成功！', '', 'msg_container_view_widget', {});
				jQuery(elm).removeClass();
				jQuery(elm).addClass('metric_selected');
				jQuery(elm).attr('is_selected','1');
				
				// do others
				$('#view_has_no_widgets').hide();
				*/
				JKB.loader.renderOneWidget(view_id, msg, JKB.cache.curr_period, JKB.cache.date_range, -1);
			}
		});

		return true;
	},

	onSelectMetric: function(metric, title, task_id, task_sort, dev)
	{
		var metric_elem = '#' + JKB.cache.curr_overlay_container;
		jQuery(metric_elem).html(JKB.cache.metric_task_name + "<br />" + title);
		jQuery(metric_elem).removeClass();
		jQuery(metric_elem).addClass('metric_box_filled');
		jQuery(metric_elem).fadeOut('fast');
		jQuery(metric_elem).fadeIn('fast');
		JKB.loader.setOverlayMetricCache(JKB.cache.curr_overlay_container,metric,task_id,task_sort,dev);
	},
	delWidget: function(view_id, widget_id, widget_type,task_id,task_dev)
	{
		if (!confirm('确定要删除这个Widget吗？'))
		{
			return false;
		}

		// 添加 widget
		//var args = Array.prototype.slice.call(arguments);
		//alert(args.join(','));return false;
		var url = getAjaxWrapper('del_view_widget', {view_id:view_id, widget_id:widget_id});
		jQuery.getJSON(getRandomUrl(url), function(json) {
            var res = json['res'];
		    var msg = json['msg'];
            if ( res == '1') { // failed
				showErrorMsg(msg, '', 'msg_container_view_widget', {});
			}
            else if ( res == '0') { // ok
				//showSuccMsg('删除成功！', '', 'msg_container_view_widget', {});
				var btn_id = '#' + widget_type + '_' + task_id + '_' + task_dev;
				$(btn_id).each (function(){
									$(this).removeClass();
									$(this).addClass('metric_unselected');
									$(this).attr('is_selected','0');
								});

				// do others
				var id = 'widget_' + widget_id;
				$('li#' + id).hide('blind').remove();
				for (var i = 0; i < 2; i++) {
					for (var j = 0; j < g_layout[i].length; j++) {
						if( g_layout[i][j] == id) {
							g_layout[i].splice(j,1);
						}
					}
				}
				$("ul.wids_cols").sortable('refresh');
				JKB.loader.saveViewLayout(view_id, JSON.stringify(g_layout));
			}
		});
		return true;
	},
	
	/*********** 删除报告视图 *************/
	delReportWidget: function(view_id,widget_id)
	{
	   if (!confirm('确定要删除这个Widget吗？'))
		{
			return false;
		}
		var url = getAjaxWrapper('del_view_widget', {view_id:view_id, widget_id:widget_id});
		jQuery.getJSON(getRandomUrl(url), function(json) {
            var res = json['res'];
		    var msg = json['msg'];
            if ( res == '1') { // failed
				showErrorMsg(msg, '', 'msg_container_view_widget', {});
			}
            else if ( res == '0') { // ok
				showSuccMsg('视图删除成功！', '', 'msg_container_view_widget', {});
				jQuery('li#widget_' + widget_id).hide('blind');
			}
		});
		return true;
	},
	
	addWidget: function(elm, view_id, widget_type, widget_title, task_id, task_type, task_sort, task_dev, period, range)
	{
		var is_selected = jQuery(elm).attr('is_selected');
		if (is_selected == '1') {
			return false;
		}
		$('#msg_container_view_widget').hide();

		// 添加 widget
		//var args = Array.prototype.slice.call(arguments);
		//alert(args.join(','));return false;
		var url = getAjaxWrapper('add_view_widget', {view_id:view_id, widget_type:widget_type, widget_title:widget_title, task_id:task_id, task_type:task_type, task_sort:task_sort, task_dev:encodeURIComponent(task_dev)});
		jQuery.getJSON(getRandomUrl(url), function(json) {
            var res = json['res'];
		    var msg = json['msg'];
            if ( res == '1') { // failed
				showErrorMsg(msg, '', 'msg_container_view_widget', {});
			}
            else if ( res == '0') { // ok
				var widget_id = msg;
				//showSuccMsg('添加成功！', '', 'msg_container_view_widget', {});
				jQuery(elm).removeClass();
				jQuery(elm).addClass('metric_selected');
				jQuery(elm).attr('is_selected','1');
				
				// do others
				$('#view_has_no_widgets').hide();
				// render the newly created widget
				JKB.loader.renderOneWidget(view_id, widget_id, period, range, -1);
			}
		});
		return true;
	},
	getWidgetColumn: function()
	{
		// 找出当前 widget 数目最少的列
		var min = -1;
		var col_to_add = 0;
		for(var i = 0; i < g_layout.length; i++)
		{
			if (min == -1 || min > g_layout[i].length)
			{
				min = g_layout[i].length;
				col_to_add = i;
			}
		}
		return col_to_add;
	},
	renderOneWidget: function(view_id, widget_id, period, range, col_to_add)
	{
		var append = true;
		if(col_to_add == -1) {
			col_to_add = JKB.loader.getWidgetColumn();
			append = false;
		}

		var id = col_to_add + 1;
		if (append) {
			$('ul#__wids_col_' + id).append('<li id="widget_' + widget_id + '" class="module_contain1">');
		} else {
			g_layout[col_to_add].unshift('widget_' + widget_id); // 新增 widget
			$('ul#__wids_col_' + id).prepend('<li id="widget_' + widget_id + '" class="module_contain1">');
		}
		
		var url = getAjaxWrapper('render_one_widget', {view_id:view_id,widget_id:widget_id,period:period,range:range,scale:JKB.cache.scale});
		jQuery('#widget_' + widget_id).load(getRandomUrl(url), function(){
												if (append) {
													JKB.cache.widget_to_show--;
												} else {
													//$('#widget_'+widget_id).hide();
													//$('#widget_'+widget_id).show();
													//$("ul.wids_cols").sortable('refresh');
													JKB.loader.saveViewLayout(view_id, JSON.stringify(g_layout));
												}
											});
	},
	getWidgetCount: function(rows)
	{
		var count = 0;
		for (var i = 0; i < __widget_ids.length; i++) 
		{
			count += (__widget_ids[i].length >= rows) ? rows : __widget_ids[i].length;
		}
		return count;
	},
	renderSomeWidgets: function(rows)
	{
		for ( var i = 0; i< __widget_ids.length; i++)
		{
			var j = 0;
			while ( __widget_ids[i].length > 0 && j++ < rows)
			{
				var widget_id = __widget_ids[i].shift();
				JKB.loader.renderOneWidget(__view_id, widget_id, JKB.cache.curr_period, JKB.cache.date_range, i);
			}
		}
	},
	saveViewLayout: function(view_id, view_layout)
	{
		//var args = Array.prototype.slice.call(arguments);
		//alert(args.join(','));
		var url = getAjaxWrapper('save_view_layout', {view_id:view_id, view_layout:view_layout});
		jQuery.getJSON(getRandomUrl(url), function(json) {
            var res = json['res'];
		    var msg = json['msg'];
            if ( res == '1') { // failed
				showErrorMsg(msg, '', 'msg_container_view_widget', {});
			}
            else if ( res == '0') { // ok
				//showSuccMsg(msg, '', 'msg_container_view_widget', {});
				// do others
			}
		});
	},
	setOverlayMetricCache: function(elem, metric, task_id, task_sort, dev)
	{
		JKB.cache[elem] = [metric,task_id,task_sort,dev];
	},
	startOverlayAnalyse: function()
	{
		if (JKB.cache.overlay_left_metric && JKB.cache.overlay_right_metric)
		{
			JKB.cache.task_overlay = JKB.cache.overlay_left_metric[0] + ',' + JKB.cache.overlay_left_metric[1] + ',' + JKB.cache.overlay_left_metric[2] + ',' + JKB.cache.overlay_left_metric[3]
				+ '|' + JKB.cache.overlay_right_metric[0] + ',' + JKB.cache.overlay_right_metric[1] + ',' + JKB.cache.overlay_right_metric[2] + ',' + JKB.cache.overlay_right_metric[3];
		}
		else
		{
			alert('请您选择参与比较的指标');
		}
	},
	/*
	onCartItemSumChange: function(item_name, item_sum)
	{
		jQuery('span.item_total_fee').html('<img src="/images/loading.gif">');
		jQuery('#total_fee').html('<img src="/images/loading.gif">');
		ajax_url = getAjaxWrapper('update_cart_fee', {item_name:item_name,item_sum: item_sum});
		jQuery.getJSON(getRandomUrl(ajax_url), function(json)
		{
			var total_fee = json.total_fee;
			var items = json.items;
			jQuery('#total_fee').html(total_fee);
			for (name in items)
			{
				jQuery('#item_total_fee_' + name).html(items[name]);
			}
		});
	},
	onCartItemMonthChange: function(item_name, item_month)
	{
		jQuery('span.item_total_fee').html('<img src="/images/loading.gif">');
		jQuery('#total_fee').html('<img src="/images/loading.gif">');
		ajax_url = getAjaxWrapper('update_cart_fee', {item_name:item_name,item_month: item_month});
		jQuery.getJSON(getRandomUrl(ajax_url), function(json)
		{
			var total_fee = json.total_fee;
			var items = json.items;
			jQuery('#total_fee').html(total_fee);
			for (name in items)
			{
				jQuery('#item_total_fee_' + name).html(items[name]);
			}
		});
	},*/
	onCartItemSumChange: function(item_name, input_obj, calculator)
	{
		jQuery('span.item_total_fee').html('<img src="/images/loading.gif">');
		jQuery('#item_' + item_name).html('<img src="/images/loading.gif">');
		var month_num = jQuery("#month_num").val();
		var item_sum = input_obj.value;
		
		if(calculator){
			var ajax_func = 'update_calculator_fee';
		}else {
			var ajax_func = 'update_cart_fee';	
		}
		
		ajax_url = getAjaxWrapper(ajax_func, {item_name:item_name,item_sum:item_sum,month_num:month_num});
		jQuery.getJSON(getRandomUrl(ajax_url), function(json)
		{
			var errno = json.errno;
			var data = json.data;
			
			if(errno == 3){
				var allow_buy = json.allow_buy;
				input_obj.value = allow_buy;
				showErrorTips('很抱歉，您购买的额外监测点数量已经超过系统允许的最大值，你只能购买不超过' + allow_buy + "个监测点。", '');
			}else if(errno == 2){
				var allow_buy = json.allow_buy;
				input_obj.value = allow_buy;
				showErrorTips('很抱歉，请输入正确的数量。', '');				
			}
			
			for(i in data)
			{
				jQuery('#item_total_' + i).html(data[i]);	
			}			
		});
	},
	onCartItemMonthChange: function(month_num, calculator)
	{
		jQuery('span.item_total_fee').html('<img src="/images/loading.gif">');
	
		if (calculator){
			var ajax_func = 'calculator_select_month';
		}else {
			var ajax_func = 'cart_select_month';
		}
		
		ajax_url = getAjaxWrapper(ajax_func, {month_num:month_num});
		jQuery.getJSON(getRandomUrl(ajax_url), function(json)
		{
			for(i in json)
			{
				jQuery('#item_total_' + i).html(json[i]);
				if(i == 'remain_price'){
					if(json[i] > 0){
						jQuery("#__tr_remain_price").show();
					}
				}
			}
		});
	},	
	addPurchaseItemToCart: function(item_type, calculator)
	{
		if(jQuery("#input_" + item_type).hasClass("selected")){
			//选中已经添加的项目
			for(i in purchase_type[item_type]){
				if(jQuery("#input_" + purchase_type[item_type][i]).attr('type') == 'text'){
					jQuery("#input_" + purchase_type[item_type][i]).focus().select();
				}
			}
			return false;	
		}
		
		JKB.loader.showAjaxLoader();
		if(calculator){
			var ajax_func = 'add_item_to_calculator';
			var edition_op = '购买';
		}else {
			var ajax_func = 'add_item_to_cart';	
			var edition_op = '当前';
		}
		ajax_url = getAjaxWrapper(ajax_func, {item_type:item_type});
		jQuery("#input_" + item_type).addClass("selected");
		
		jQuery.get(getRandomUrl(ajax_url), function(data)
		{
			JKB.loader.hideAjaxLoader();
			if(data == 1){
				showErrorTips('系统错误！请联系管理员！', '');
			}else if(data == 2){
				showErrorTips('很抱歉，您购买的套餐不支持购买此项目，详情请查看<a href="/pricing_plans#extra" target="_blank" class="link2">哪些套餐支持购买额外项目</a>。', '');
			}else if(data == 3){
				showErrorTips('很抱歉，您' + edition_op + '的套餐不支持购买此项目，详情请查看<a href="/pricing_plans#extra" target="_blank" class="link2">哪些套餐支持购买额外项目</a>。', '');
			}else if(data == 4){
				showErrorTips('很抱歉，暂时没有更多的监测点了，我们稍后会继续添加更多的监测点。', '');
			}else {
				jQuery("#cart_list").html(data);	
			}
		
			if(JKB.cache.tmp_include_tr_fold){
				jQuery(".include_item_tr").show();
				jQuery("#include_item_fold").addClass("selected");				
			}
			return false;
		});
		return false;
	},
	loadCartList: function()
	{
		JKB.loader.showAjaxLoader();
		ajax_url = getAjaxWrapper('get_cart_item', {});
		
		jQuery("#cart_list").load(getRandomUrl(ajax_url), function()
		{
			JKB.loader.hideAjaxLoader();
		});
	},
	loadCalculatorList: function()
	{
		jQuery('#cart_list').html('<img src="/images/loading.gif">');
		
		ajax_url = getAjaxWrapper('get_calculator_item', {});
		jQuery("#cart_list").load(getRandomUrl(ajax_url), function()
		{
			JKB.loader.hideAjaxLoader();
		});
	},
	onChangeMaster: function(elem)
	{
		value = elem.options[elem.selectedIndex].value;
		var url = "/dashboard?mid=" + value;
		window.location = url;
	},
	loadDropMenu: function(elem, param)
	{
		if (JKB.cache.display_cache[elem])
		{
			jQuery('#' + elem).fadeOut('fast');
			JKB.cache.display_cache[elem] = false;
		}
		else
		{
			JKB.loader.closeAllDropMenu();
			jQuery('#' + elem).show('blind');
			JKB.cache.display_cache[elem] = true;
			switch (elem)
			{
				case '__dropmenu_task_selector':
					JKB.loader.loadDropTaskSelector(param);
					break;
				case '__dropmenu_addclass':
					JKB.loader.loadDropSiteClassList(param);
					break;
				case '__dropmenu_server_selector':
					JKB.loader.loadDropServerSelector(param);
					break;
				case '__dropmenu_service_task_selector':
					JKB.loader.loadDropServiceTaskSelector(param);
					break;
				case '__dropmenu_custom_task_selector':
					JKB.loader.loadDropCustomTaskSelector(param);
					break;
				case '__dropmenu_exp_host_selector':
					JKB.loader.loadDropExpHostSelector(param);
					break;
				case '__dropmenu_domain_selector':
					JKB.loader.loadDropDomainSelector(param);
					break;
				case '__dropmenu_host_selector':
					JKB.loader.loadDropHostSelector(param);
					break;
				case '__dropmenu_view_selector':
					JKB.loader.loadDropViewSelector(param);
					break;
				case '__dropmenu_date_selector':
					JKB.loader.loadDropWeekSelector(param);
					break;
				case '__query_result':
				    JKB.loader.loadDropRecentlyQuery(param);
					break;
			}
		}
	},
	loadHtml: function(elem, param)
	{
	   var buzz_type = param;
	   
	   jQuery('#'+elem).html('');
	   jQuery('#'+elem).html('<span><img style="margin:0 10px;" src="/images/ajax_loader4.gif"></span> 正在加载...');
	   var ajax_url = getAjaxWrapper('get_html', {buzz_type:buzz_type});
	   jQuery('#'+elem).load(getRandomUrl(ajax_url), function(){
						
		});
	   jQuery('#enter_logo li').siblings('li').removeClass('clickon');
	   jQuery('#'+param).addClass('clickon');
	},
	closeAllDropMenu: function()
	{
		for (menu_elem in JKB.cache.display_cache)
		{
			jQuery('#' + menu_elem).fadeOut('fast');
			JKB.cache.display_cache[menu_elem] = false;
		}
	},
	onMouseOverDropMenu: function()
	{
		JKB.cache.dropmenu_inside = true;
	},
	onMouseOutDropMenu: function()
	{
		JKB.cache.dropmenu_inside = false;
	},
	onClickDropMenuOutside: function()
	{
		if (!JKB.cache.dropmenu_inside)
		{
			JKB.loader.closeAllDropMenu();
		}
	},
	loadDomainHostNew: function(domain_id)
	{
		jQuery('#__domain_host_new').html('<img src="/images/ajax_loader2.gif" />');
		jQuery('#__domain_host_new').show();
		var ajax_url = getAjaxWrapper('domain_host_new', {domain_id:domain_id});
		jQuery('#__domain_host_new').load(getRandomUrl(ajax_url), function()
		{
			jQuery('#__domain_host_new').fadeIn();
		});
	},
	hideDomainHostNew: function()
	{
		jQuery('#__domain_host_new').fadeOut();
	},
	loadHostDomainNew: function(host_id)
	{
		jQuery('#__host_domain_new').html('<img src="/images/ajax_loader2.gif" />');
		jQuery('#__host_domain_new').show();
		var ajax_url = getAjaxWrapper('host_domain_new', {host_id:host_id});
		jQuery('#__host_domain_new').load(getRandomUrl(ajax_url), function()
		{
			jQuery('#__host_domain_new').fadeIn();
		});
	},
	hideHostDomainNew: function()
	{
		jQuery('#__host_domain_new').fadeOut();
	},
	loadDomainHostStatus: function(className)
	{
		if (JKB.cache.display_cache[className])
		{
			jQuery(className).fadeOut('fast');
			JKB.cache.display_cache[className] = false;
		}
		else
		{
			jQuery(className).fadeIn();
			JKB.cache.display_cache[className] = true;
		}
	},
	showMsgAlertDetail: function(msg_id)
	{
		if (jQuery('#__msg_' + msg_id).css('display') != 'none')
		{
			jQuery('#__msg_' + msg_id).hide();
			jQuery('#__msg_alert_' + msg_id).hide();
		}
		else
		{
			jQuery('#__msg_' + msg_id).show();
			jQuery('#__msg_alert_' + msg_id).show();
			jQuery('#__msg_alert_' + msg_id).html('<img src="/images/ajax_loader4.gif" />');
			var ajax_url = getAjaxWrapper('get_msg_alert_list', {msg_id:msg_id});
			jQuery('#__msg_alert_' + msg_id).load(getRandomUrl(ajax_url), function()
			{
			});
		}
	},
	showAlertMsgDetail: function(alert_id, msg_id)
	{
		if (jQuery('#__alert_' + alert_id).css('display') != 'none')
		{
			jQuery('#__alert_' + alert_id).fadeOut();
			//jQuery('#__alert_msg_' + alert_id).fadeOut();
		}
		else
		{
			jQuery('#__alert_' + alert_id).fadeIn();
			//jQuery('#__alert_msg_' + alert_id).fadeIn();
			jQuery('#__alert_msg_' + alert_id).html('<img src="/images/ajax_loader4.gif" />');
			if(!jQuery.support.opacity) 
			{
				jQuery('#__alert_' + alert_id).css('display', 'block');
			}
			var ajax_url = getAjaxWrapper('get_alert_msg_list', {msg_id:msg_id});			
			jQuery('#__alert_msg_' + alert_id).load(getRandomUrl(ajax_url), function()
			{
			});
		}
	},
	loadDropViewSelector: function(param)
	{
		var view_id = param['view_id'];
		jQuery('#__dropmenu_view_selector').html('<span><img style="margin:0 10px;" src="/images/ajax_loader4.gif"></span> 正在加载...');
		var ajax_url = getAjaxWrapper('get_view_nav_selector', {view_id:view_id});
		jQuery('#__dropmenu_view_selector').load(getRandomUrl(ajax_url), function()
		{
			
		});
	},
	loadDropTaskSelector: function(param)
	{
		var task_id = param['task_id'];
		jQuery('#__dropmenu_task_selector').html('<span><img style="margin:0 10px;" src="/images/ajax_loader4.gif"></span> 正在加载...');
		var ajax_url = getAjaxWrapper('get_task_nav_selector', {task_id:task_id});
		jQuery('#__dropmenu_task_selector').load(getRandomUrl(ajax_url), function()
		{
			
		});
	},
	loadDropRecentlyQuery: function(param)
	{
	   var tab_type = param['tab_type'];
	   jQuery('#__query_result').html('<span style="padding-left:380px;"><img src="/images/ajax_loader4.gif"></span> 正在加载...');
	   var ajax_url = getAjaxWrapper('get_recently_query', {tab_type:tab_type});
	   jQuery('#__query_result').load(getRandomUrl(ajax_url), function()
	   {
																	   
		});
	},
	loadDropWeekSelector: function(param)
	{
		var route = param['url'];
		var select_time = param['select_time'];
		var report_type = param['report_type'];
		jQuery('#__dropmenu_date_selector').html('<span><img style="margin:0 10px;" src="/images/ajax_loader4.gif"></span> 正在加载...');
		var ajax_url = getAjaxWrapper('get_date_nav_selector', {route:route, select_time:select_time, report_type:report_type});
		jQuery('#__dropmenu_date_selector').load(getRandomUrl(ajax_url), function()
		{
		});
	},		
	loadDropAccountSelector: function()
	{
		account_click++;
		var selector = jQuery('#__dropmenu_account_selector');
		
		if(jQuery('#__dropmenu_account_selector').css('display') != 'none'){
			return false;
		} 
		selector.show();
	},
	loadDropServerSelector: function(param)
	{
		var server_id = param['server_id'];
		var task_id = param['task_id'];
		jQuery('#__dropmenu_server_selector').html('<span><img style="margin:0 10px;" src="/images/ajax_loader4.gif"></span> 正在加载...');
		var ajax_url = getAjaxWrapper('get_server_nav_selector', {server_id:server_id, task_id:task_id});
		jQuery('#__dropmenu_server_selector').load(getRandomUrl(ajax_url), function()
		{
			
		});
	},
	loadDropServiceTaskSelector: function(param)
	{
		var task_id = param['task_id'];
		jQuery('#__dropmenu_service_task_selector').html('<span><img style="margin:0 10px;" src="/images/ajax_loader4.gif"></span> 正在加载...');
		var ajax_url = getAjaxWrapper('get_service_task_nav_selector', {task_id:task_id});
		jQuery('#__dropmenu_service_task_selector').load(getRandomUrl(ajax_url), function()
		{
			
		});
	},
	loadDropCustomTaskSelector: function(param)
	{
		var task_id = param['task_id'];
		jQuery('#__dropmenu_custom_task_selector').html('<span><img style="margin:0 10px;" src="/images/ajax_loader4.gif"></span> 正在加载...');
		var ajax_url = getAjaxWrapper('get_custom_task_nav_selector', {task_id:task_id});
		jQuery('#__dropmenu_custom_task_selector').load(getRandomUrl(ajax_url), function()
		{
			
		});
	},
	loadDropExpHostSelector: function(param)
	{
		var host_id = param['host_id'];
		jQuery('#__dropmenu_exp_host_selector').html('<span><img style="margin:0 10px;" src="/images/ajax_loader4.gif"></span> 正在加载...');
		var ajax_url = getAjaxWrapper('get_exp_host_nav_selector', {host_id:host_id});
		jQuery('#__dropmenu_exp_host_selector').load(getRandomUrl(ajax_url), function()
		{
			
		});
	},
	loadDropDomainSelector: function(param)
	{
		var domain_id = param['domain_id'];
		jQuery('#__dropmenu_domain_selector').html('<span><img style="margin:0 10px;" src="/images/ajax_loader4.gif"></span> 正在加载...');
		var ajax_url = getAjaxWrapper('get_domain_nav_selector', {domain_id:domain_id});
		jQuery('#__dropmenu_domain_selector').load(getRandomUrl(ajax_url), function()
		{
			
		});
	},
	loadDropHostSelector: function(param)
	{
		var host_id = param['host_id'];
		jQuery('#__dropmenu_host_selector').html('<span><img style="margin:0 10px;" src="/images/ajax_loader4.gif"></span> 正在加载...');
		var ajax_url = getAjaxWrapper('get_host_nav_selector', {host_id:host_id});
		jQuery('#__dropmenu_host_selector').load(getRandomUrl(ajax_url), function()
		{
			
		});
	},
	loadDropSiteClassList: function(param)
	{
		var task_id = param['task_id'];
		jQuery('#__drop_class_list').html('<span><img style="margin:0 10px;" src="/images/ajax_loader4.gif"></span> 正在加载...');
		var ajax_url = getAjaxWrapper('get_task_class_sel', {tmp:'summary', task_id:task_id});
		jQuery('#__drop_class_list').load(getRandomUrl(ajax_url), function()
		{
			
		});
	},
	loadServerViewTaskSelector: function(server_id)
	{
		jQuery('#__view_task_add').show();
		jQuery('#__view_task_add').html('<span><img style="margin:0 10px;" src="/images/ajax_loader4.gif"></span> 正在加载...');
		var ajax_url = getAjaxWrapper('get_server_view_task_selector', {server_id:server_id});
		jQuery('#__view_task_add').load(getRandomUrl(ajax_url), function()
		{
			
		});
	},
	hideServerViewTaskSelector: function()
	{
		jQuery('#__view_task_add').fadeOut();
	},
	switchTaskPause: function(task_id, task_summary)
	{
		jQuery.post(getAjaxWrapper('switch_task_pause'), {task_id:task_id}, function(data)
		{
			if (data == '1')
			{
				if(task_summary)
				{
					jQuery('#__task_pause_' + task_id).html('暂停监控');
					jQuery('#__task_pause_status_' + task_id).html('');				
				}
				else
				{
					jQuery('#__task_pause_' + task_id).show();
					jQuery('#__task_open_' + task_id).hide();					
				}
				showSuccMsg('已开启监控，告警通知也将开启工作', '', '', {});
			}
			else if (data == '3')
			{
				if(task_summary)
				{
					jQuery('#__task_pause_' + task_id).html('开启监控');
					jQuery('#__task_pause_status_' + task_id).html('已暂停监控');				
				}
				else
				{				
					jQuery('#__task_pause_' + task_id).hide();
					jQuery('#__task_open_' + task_id).show();
				}
				showSuccMsg('已暂停监控，您将无法收到告警通知', '', '', {});
			}
			else if (data == '-1')
			{
				showErrorTips('很抱歉，该监控项目无法开启，您创建的监控项目数量已达到上限。', '');
			}
			else if (data == '-2')
			{
				showErrorTips('很抱歉，该监控项目无法开启，您可以尝试降低监控频率后重新开启。', '');
			}
		});
	},
	switchServerTaskPause: function(task_id)
	{
		jQuery.post(getAjaxWrapper('switch_server_task_pause'), {task_id:task_id}, function(data)
		{
			if (data == '1')
			{
				jQuery('#__task_pause_' + task_id).html('暂停监控');
				jQuery('#__task_pause_status_' + task_id).html('');
				showSuccMsg('已开启监控，告警通知也将开启工作', '', '', {});
			}
			else if (data == '3')
			{
				jQuery('#__task_pause_' + task_id).html('开启监控');
				jQuery('#__task_pause_status_' + task_id).html('已暂停监控');
				showSuccMsg('已暂停监控，您将无法收到告警通知', '', '', {});
			}
			else if (data == '-1')
			{
				showSuccMsg('很抱歉，该监控项目无法开启，您可以创建的监控项目数量已达到上限。', '', '', {});
			}
		});
	},
	switchServiceTaskPause: function(task_id)
	{
		jQuery.post(getAjaxWrapper('switch_service_task_pause'), {task_id:task_id}, function(data)
		{
			if (data == '1')
			{
				jQuery('#__task_pause_' + task_id).show();
				jQuery('#__task_open_' + task_id).hide();
				showSuccMsg('已开启监控，告警通知也将开启工作', '', '', {});
			}
			else if (data == '3')
			{
				jQuery('#__task_open_' + task_id).show();
				jQuery('#__task_pause_' + task_id).hide();
				showSuccMsg('已暂停监控，您将无法收到告警通知', '', '', {});
			}
			else if (data == '-1')
			{
				showSuccMsg('很抱歉，该监控项目无法开启，您可以创建的监控项目数量已达到上限。', '', '', {});
			}
		});
	},
	switchBatchServiceTaskPause: function(obj, type)
	{
		if(!obj)
		{
			jkbAlert(err, 'error');
			return;
		}
		this.showAjaxLoader();
		task_ids = JKB.loader.getCheckedTasks();
		
		jQuery.post(getAjaxWrapper('switch_batch_service_task_pause'), {task_ids:task_ids, type:type}, function(data)
		{
			if (data == '1')
			{
				JKB.loader.hideAjaxLoader();
				split_task_id = task_ids.split(",");
				for(i=0;i<split_task_id.length;i++){
					if(split_task_id[i] != "")
					{
						jQuery('#__task_pause_' + split_task_id[i]).show();
						jQuery('#__task_open_' + split_task_id[i]).hide();
					}
				}
				showSuccMsg('已开启监控，告警通知也将开启工作', '', '', {});
			}
			else if (data == '3')
			{
				JKB.loader.hideAjaxLoader();
				split_task_id = task_ids.split(",");
				for(i=0;i<split_task_id.length;i++){
					if(split_task_id[i] != "")
					{
						jQuery('#__task_open_' + split_task_id[i]).show();
						jQuery('#__task_pause_' + split_task_id[i]).hide();
					}
				}
				showSuccMsg('已暂停监控，您将无法收到告警通知', '', '', {});
			}
			else if (data == '-1')
			{
				JKB.loader.hideAjaxLoader();
				showSuccMsg('很抱歉，该监控项目无法开启，您创建的监控项目数量已达到上限。', '', '', {});
			}
		});
	},
	serviceBatchTaskDelete: function(obj)
	{
		if (!confirm('确定要删除所选项目吗？'))
		{
			return false;
		}
		
		if(!obj)
		{
			jkbAlert(err, 'error');
			return;
		}
			
		task_ids = JKB.loader.getCheckedTasks();
		
		jQuery.post(getAjaxWrapper('service_batch_task_delete'), {task_ids:task_ids}, function(data)
		{
			if(data)
			{
				showSuccMsg('已删除所选监控项目！', '', '', {});
				split_task_id = task_ids.split(",");
				for(i=0;i<split_task_id.length;i++){
					if(split_task_id[i] != "")
					{
						parent.JKB.loader.hideTask(split_task_id[i]);
					}
				}
				return;
			}
		});
	},
	switchCustomTaskPause: function(task_id)
	{
		jQuery.post(getAjaxWrapper('switch_custom_task_pause'), {task_id:task_id}, function(data)
		{
			if (data == '1')
			{
				jQuery('#__task_pause_' + task_id).html('暂停监控');
				jQuery('#__task_pause_status_' + task_id).html('');
				showSuccMsg('已开启监控，告警通知也将开启工作', '', '', {});
			}
			else if (data == '3')
			{
				jQuery('#__task_pause_' + task_id).html('开启监控');
				jQuery('#__task_pause_status_' + task_id).html('已暂停监控');
				showSuccMsg('已暂停监控，您将无法收到告警通知', '', '', {});
			}
			else if (data == '-1')
			{
				showSuccMsg('很抱歉，该监控项目无法开启，您可以创建的监控项目数量已达到上限。', '', '', {});
			}
		});
	},
	modifyPlanPrice: function()
	{
		var plus_html = "";
		var plus_items = "";
		var plus_total = 0;
		var plus_price_total = 0;
		jQuery('.ipt_plus_count').each(function()
		{
			var price = jQuery(this).attr('price');
			var plus_name = jQuery(this).attr('plus_name');
			var plus_title = jQuery(this).attr('plus_title');
			var plus_count = jQuery(this).val() / 1;
			if (plus_count % 1 != 0)
			{
				plus_count = 0;
			}
			var plus_price = jQuery.sprintf("%.2f", plus_count * price);
			plus_price_total += plus_price / 1;
			if (plus_count > 0)
			{
				plus_total += plus_count;
				plus_html += '<div class="plan_plus">'
					+ '<div class="plus_descr">' + plus_count + ' x <span style="font-weight:;">' + plus_title + '</span></div>'
					+ '<div class="plus_price">￥' + plus_price + '</div>'
					+ '</div>';
				plus_items += plus_name + ':' + plus_count + ',';
			}
		});
		plus_price_total = jQuery.sprintf("%.2f", plus_price_total);
		if (plus_total > 0)
		{
			plus_html = '<div class="plan_title">额外定制</div>' + plus_html + '<div class="spacer5"></div><div class="plan_price">￥<span id="__plus_total_price">' + plus_price_total + '</span></div><div class="plan_line"></div>';
		}
		jQuery('#__plan_plus').html(plus_html);
		jQuery('#__plus_items').val(plus_items);
		
		this.calMonthPrice();
		this.modifyPlanMonths('#__month_sel');
	},
	modifyPlanPlus: function(obj)
	{
		var value = jQuery(obj).val() / 1;
		if (value % 1 != 0)
		{
			value = 0;
		}
		jQuery(obj).val(value);
		this.modifyPlanPrice();
	},
	modifyPlanMonths: function(obj)
	{
		var value = jQuery(obj).val();
		if (value % 1 != 0)
		{
			value = 1;
		}
		var month_price = jQuery('#__month_price').html() / 1;
		var total_price = value * month_price;
		if (total_price > 0)
		{
			total_price = jQuery.sprintf("%.2f", value * month_price);
		}
		jQuery('#__total_price').html(total_price);
		jQuery('#__plan_month').val(value);
		var month_discount = JKB.loader.getMonthDiscount(value);
		if (total_price > 0)
		{
			if (month_discount != 1)
			{
				var discount_price = jQuery.sprintf("%.2f", total_price * month_discount);
				var discount_reduce = jQuery.sprintf("%.2f", total_price - discount_price);
				jQuery('#__discount_reduce').html(discount_reduce);
				jQuery('#__discount_price').html(discount_price);
				jQuery('#__discount').fadeIn();
				total_price = discount_price;
			}
			else
			{
				jQuery('#__discount').fadeOut();
			}
		}
		if (jQuery('#__return_reduce'))
		{
			var return_reduce = jQuery('#__return_reduce').html() / 1;
			total_price -= return_reduce;
			total_price = jQuery.sprintf("%.2f", total_price);
			jQuery('#__return_price').html(total_price);
		}
	},
	getMonthDiscount: function(month)
	{
		var month_discount_json = jQuery('#__month_discount').val();
		var month_discount = eval("(" + month_discount_json + ")");
		var discount = 1;
		for (key in month_discount)
		{
			if (parseInt(month) >= parseInt(key))
			{
				discount = parseFloat(month_discount[key]);
			}
			else
			{
				return discount;
			}
		}
		return discount;
	},
	calMonthPrice: function()
	{
		var plan_price = jQuery('#__plan_price').html() / 1;
		var plus_total_price = jQuery('#__plus_total_price').html() / 1;
		var month_price = plan_price + plus_total_price;
		if (month_price > 0)
		{
			month_price = jQuery.sprintf("%.2f", month_price);
		}
		jQuery('#__month_price').html(month_price);
	},
	planToEva: function()
	{
		jQuery('#__to_eva').html('<img src="/images/ajax_loader4.gif" />');
		ajax_url = getAjaxWrapper('plan_to_eva', {});
		jQuery.getJSON(getRandomUrl(ajax_url), function(json)
		{
			if (json['result'] == 1)
			{
				window.location.reload();
			}
		});
	},
	planUpgrade: function(plan)
	{
		ajax_url = getAjaxWrapper('plan_upgrade', {plan:plan});
		jQuery.getJSON(getRandomUrl(ajax_url), function(json)
		{
			if (json['result'] == 1)
			{
				window.location = '/cart';
			}
		});
	},
	calculatorUpgrade: function(plan)
	{		
		ajax_url = getAjaxWrapper('calculator_upgrade', {plan:plan});
		jQuery.getJSON(getRandomUrl(ajax_url), function(json)
		{
			if (json['result'] == 1)
			{
				window.location.reload();
			}
		});
	},	
	planRenew: function(plan)
	{
		ajax_url = getAjaxWrapper('plan_renew', {plan:plan});
		jQuery.getJSON(getRandomUrl(ajax_url), function(json)
		{
			if (json['result'] == 1)
			{
				window.location = '/cart';
			}
		});
	},
	planPlusCustom: function()
	{
		var plan = jQuery('#__plan').val();
		var plus_items = jQuery('#__plus_items').val();
		var plan_month = jQuery('#__plan_month').val();
		jQuery('#__btn_plan_plus_custom').hide();
		jQuery('#loading_submit').show();
		ajax_url = getAjaxWrapper('plan_plus_custom', {plan:plan,plus_items:plus_items,plan_month:plan_month});
		jQuery.getJSON(getRandomUrl(ajax_url), function(json)
		{
			if (json['result'] == 1)
			{
				window.location = '/cart';
			}
		});
	},
	loadTips: function(ids, jkb_tooltip)
	{
		var tooltip = 'bottomLeft';
		if(jkb_tooltip)
		{
			tooltip = jkb_tooltip;
		}
		for (i = 0; i < ids.length; ++i)
		{
			var elem_id = ids[i];
			var tips_title = "";
			var tips_content = "";
			if (JKB.cache.ajax_tips[elem_id])
			{
				tips_title = JKB.cache.ajax_tips[elem_id]['title'];
				tips_content = JKB.cache.ajax_tips[elem_id]['content'];
			}
			else
			{
				tips_title = tips_content = '<img src="/images/loading.gif" />';
			}
			
			jQuery('#' + elem_id).qtip({
				content: {
					text: '<div id="__tips_content_' + elem_id + '">' + tips_content + '</div>',
					title: {text: '<div class="ajaxtips_title" id="__tips_title_' + elem_id + '">' + tips_title + '</div>'}
				},
				position: {
					corner: {
						target: 'topMiddle',
						tooltip: tooltip
					}
				},
				style: {
					 name: 'light',
					 padding: '7px 13px',
					 width: {
						max: 300,
						min: 0
					 },
					 tip: true,
					 classes: { content: 'ajax_tips_content'}
				},
				show: {
					solo: true,
					when: 'click'
				},
				hide:'unfocus'
			});
			jQuery('#' + elem_id).addClass('text_tips3');
			
			if (!JKB.cache.ajax_tips[elem_id])
			{
				jQuery('#' + elem_id).click(function(){
					var __id = this.id;
					jQuery.getJSON('/ajax_tips.php?id=' + this.id, function(json)
					{
						jQuery('#__tips_title_' + __id).html(json['title']);
						jQuery('#__tips_content_' + __id).html(json['content']);
						JKB.cache.ajax_tips[elem_id] = {title:json['title'],content:json['content']};
					});
				});
			}
		}
	},
	initTips: function(className)
	{
		jQuery('.' + className).each(function(){
			jQuery(this).qtip({
				content:jQuery(this).attr('rel'),
				position: {
					corner: {
						target: 'topMiddle',
						tooltip: 'bottomLeft'
					}
				},
				style: {
					 name: 'blue',
					 padding: '7px 13px',
					 width: {
						max: 210,
						min: 200
					 },
					 tip: true
				},
				show: {
					solo: true,
					when: 'mouseover'
				}
			});
		});
	},
	initTipsByElemId: function(elem_id)
	{
		jQuery('#' + elem_id).each(function(){
			jQuery(this).qtip({
				content:jQuery(this).attr('rel'),
				position: {
					corner: {
						target: 'bottomMiddle',
						tooltip: 'topMiddle'
					}
				},
				style: {
					 name: 'blue',
					 padding: '7px 13px',
					 width: {
						max: 200,
						min: 0
					 },
					 tip: true
				},
				show: {
					solo: true,
					when: 'mouseover'
				}
			});
		});
	},
	initOnLoadTips: function(elem_id)
	{
		jQuery('#' + elem_id).each(function(){
			jQuery(this).qtip({
				content:jQuery(this).attr('rel'),
				position: {
					corner: {
						target: 'topMiddle',
						tooltip: 'bottomMiddle'
					}
				},
				style: {
					 name: 'blue',
					 padding: '7px 13px',
					 width: {
						max: 210,
						min: 200
					 },
					 tip: true
				},
				show: {
					solo: true,
					when: 'focus'
				},
				hide:'unfocus'
			});
		});
		jQuery('#' + elem_id).focus();
	},
	showPopLayer: function(elem_id, command, param, settings)
	{
		var ajax_url = getAjaxLayer(command, param);
		var qtip_corner = {
			target: 'buttomRight',
			tooltip: 'leftBottom'
		};

		elem_id = "#" + elem_id;
		if (JKB.cache.ajax_layer_init[elem_id])
		{
			jQuery(elem_id).qtip('destroy');
		}
		else
		{
			JKB.cache.ajax_layer_init[elem_id] = true;
		}
		jQuery(elem_id).qtip({
			content: {
				url: ajax_url,
				data: '',
				method: 'get',
				text: '<img src="/images/loading.gif" />'
			},
			position: {
				corner: qtip_corner
			},
			style: {
				 name: 'light',
				 padding: '7px 13px',
				 width: {
					max: 220,
					min: 220
				 },
				 tip: true
			},
			show: {
				solo: true,
				when: 'focus'
			},
			hide:'unfocus'
		});
		jQuery(elem_id).focus();
	},
	
	showDialog: function(elem_id, command, param, settings)
	{
		//var args = Array.prototype.slice.call(arguments);
		//alert(args.join(','));	return false;	
		
		$('#dialog').dialog('open');
		return false;
		
		param['task_dev'] = encodeURIComponent(param['task_dev']);
	
		var ajax_url = getAjaxLayer(command, param);
		var target = 'topLeft';
		var tooltip = 'rightBottom';
		var titele_text = '&nbsp;';
		var colse_button = '<span style="float:right;"><img src="/images/close_red.gif" /></span>';
		
		if ("target" in settings)
		{
			target = settings["target"];
		}
		if ("tooltip" in settings)
		{
			tooltip = settings["tooltip"];
		}		
		if ("titele_text" in settings)
		{
			titele_text = settings["titele_text"];
		}			

		elem_id = "#" + elem_id;
		jQuery(elem_id).qtip({
			content: {
				url: ajax_url,
				data: '',
				title: {
					 text: titele_text,
     				 button: colse_button
				},
				method: 'get',
				text: '<img src="/images/loading.gif" />'
			},
			position: {
				   corner: {
					  target: target,
					  tooltip: tooltip
				   }
			},
			style: {
				 name: 'light',
				 padding: '7px 13px',
				 width: {
					max: 240,
					min: 220
				 },
				 tip: true
			},
			show: {
				solo: true,
				when: 'focus'
			},
			hide:'unfocus'
		});
		jQuery(elem_id).focus();
	},	
	
	showPopLayerNew: function(elem_id, command, param, settings)
	{
		//var args = Array.prototype.slice.call(arguments);
		//alert(args.join(','));	return false;	
		param['task_dev'] = encodeURIComponent(param['task_dev']);
	
		var ajax_url = getAjaxLayer(command, param);
		var target = 'topLeft';
		var tooltip = 'rightBottom';
		var titele_text = '&nbsp;';
		var colse_button = '<span style="float:right;"><img src="/images/close_red.gif" /></span>';
		
		if ("target" in settings)
		{
			target = settings["target"];
		}
		if ("tooltip" in settings)
		{
			tooltip = settings["tooltip"];
		}		
		if ("titele_text" in settings)
		{
			titele_text = settings["titele_text"];
		}			

		elem_id = "#" + elem_id;
		jQuery(elem_id).qtip({
			content: {
				url: ajax_url,
				data: '',
				title: {
					 text: titele_text,
     				 button: colse_button
				},
				method: 'get',
				text: '<img src="/images/loading.gif" />'
			},
			position: {
				   corner: {
					  target: target,
					  tooltip: tooltip
				   }
			},
			style: {
				 name: 'light',
				 padding: '7px 13px',
				 width: {
					max: 240,
					min: 220
				 },
				 tip: true
			},
			show: {
				solo: true,
				when: 'focus'
			},
			hide:'unfocus'
		});
		jQuery(elem_id).focus();
	},	
	
	loadTaskDomainHostStatus: function(task_sort, task_id)
	{
		jQuery('#__domain_host_status').html('<img src="/images/ajax_loader3.gif" />');
		var ajax_url = getAjaxWrapper('get_domain_host_status', {task_sort:task_sort,task_id:task_id});
		jQuery('#__domain_host_status').load(getRandomUrl(ajax_url), function()
		{
			JKB.loader.initTipsByElemId('__domain_host_link');
		});
	},
	loadWizardResult: function(data)
	{
		jQuery('#__pw_ret').hide();
		var param = "";
		for (name in data)
		{
			param += name + "=" + data[name] + "&";
		}
		param = escape(param);
		jQuery('#__btn_submit').hide();
		jQuery('#loading_submit').show();
		var ajax_url = getAjaxWrapper('get_wizard_result', {param:param});
		jQuery.getJSON(getRandomUrl(ajax_url), function(json)
		{
			jQuery('#__pw_ret_plan').html(json['plan_title']);
			jQuery('#__pw_ret_plan_price').html("￥" + json['plan_price'] + "/月");
			jQuery('#__pw_ret_plus_total_price').html("￥" + json['plus_total_price'] + "/月");
			jQuery('#__pw_ret_total_price').html("￥" + json['total_price'] + "/月");
			var plus = json['plus'];
			var plus_html = "";
			var plus_count = plus.length;
			for (i = 0; i < plus.length; ++i)
			{
				var title = plus[i]['title'];
				var sum = plus[i]['sum'] / 1;
				if (sum == 0)
				{
					continue;
				}

				var total_price = plus[i]['total_price'];
				plus_html += '<div class="ret_plus_line"><p class="plus_title">' + title + '</p><p class="plus_sum"> ' + sum + '个</p></div>';
				if (plus_count > 1)
				{
					plus_html += '<div class="spacer5"></div>';
				}
			}
			if (plus_html == "")
			{
				plus_html = "无";
			}
			jQuery('#__pw_detail_url').html('<a href="/plan_plus?plan=' + json['plan_name'] + '&plus=' + json['plus_url'] + '" target="_blank">查看以上套餐组合的详细清单</a>');
			jQuery('#__pw_ret_plus_lines').html(plus_html);
			jQuery('#__pw_ret').show('blind');
			jQuery('#__btn_submit').show();
			jQuery('#loading_submit').hide();
		});
	},
	exchangeFault: function(fault_id)
	{
		if (jQuery('#__fault_' + fault_id).css('display') != 'none')
		{
			jQuery('#__fault_' + fault_id).fadeOut();
		}
		else
		{
			JKB.loader.loadFaultRemark(fault_id);
		}
	},
	loadFaultRemark: function(fault_id)
	{	
		jkb_fadein('__fault_' + fault_id, 'fast');	
		jQuery('#__fault_remark_' + fault_id).html('<img src="/images/ajax_loader2.gif" />');
		
		var ajax_url = getAjaxWrapper('get_fault_remark', {fault_id:fault_id});
		jQuery('#__fault_remark_' + fault_id).load(getRandomUrl(ajax_url), function()
		{
		});
	},
	loadFaultRemarkEditor: function(fault_id)
	{
		jQuery('#__fault_remark_editor_' + fault_id).html('<img src="/images/ajax_loader2.gif" />');
		var ajax_url = getAjaxWrapper('get_fault_remark_editor', {fault_id:fault_id});
		jQuery('#__fault_remark_editor_' + fault_id).load(getRandomUrl(ajax_url), function()
		{
			jQuery('#__fault_remark_editor_' + fault_id).fadeIn();
		});
	},
	selectFaultCate: function(fault_id, cate_id, cate_title)
	{
		var ajax_url = getAjaxWrapper('save_fault_cate', {fault_id:fault_id, cate_id:cate_id});
		
		jQuery.get(getRandomUrl(ajax_url), function(data)
		{
			jQuery("#__fault_cate_list_" + fault_id + " a").removeClass('selected');
			jQuery("#__fault_cate_a_" + fault_id + "_" + cate_id).addClass('selected');
			jQuery("#__fault_cate_span_" + fault_id).removeClass("icon_fault_remark").addClass("灰色字体,不要图标");
			jQuery("#__fault_cate_span_" + fault_id + " span:first").html('');
			jQuery("#__fault_cate_span_" + fault_id + " a:first").html(cate_title);
			jQuery("#__fault_status_" + fault_id + " a img").attr('src', "/images/fault/"+cate_id+".gif");
			jQuery("#__fault_status_" + fault_id + " a img").attr('title', cate_title);
		});
	},	
	saveFaultRemark: function(fault_id)
	{
		jQuery('#__ajax_submit_' + fault_id).hide();
		jQuery('#__ajax_loading_' + fault_id).show();
		var remark_content = jQuery('#__fault_remark_content_' + fault_id).val();
		var ajax_url = getAjaxWrapper('save_fault_remark', {});
		jQuery.post(getRandomUrl(ajax_url), {fault_id:fault_id,remark_content:remark_content}, function(json)
		{
			JKB.loader.loadFaultRemark(fault_id);
		});
	},
	cancelFaultRemarkEditor: function(fault_id)
	{
		jQuery('#__fault_remark_editor_' + fault_id).hide();
	},
	getDashWidget: function(container_id, method)
	{
		var ajax_url = getAjaxWrapper(method, {});
		jQuery('#' + container_id).load(getRandomUrl(ajax_url), function()
		{
			
		});
	},
	editTaskFreq: function(elem, task_id)
	{
		JKB.loader.showPopLayer(elem, 'task_freq_edit', {task_id:task_id});
	},
	taskFreqUpdate: function(task_id)
	{
		var freqs = document['__task_freq_edit_form_' + task_id]['frequency_' + task_id];
		var sel_freq = 0;
		if (freqs.length)
		{
			for (i = 0; i < freqs.length; ++i)
			{
				if (freqs[i].checked && !freqs[i].disabled)
				{
					sel_freq = freqs[i].value;
				}
			}
		}
		else
		{
			sel_freq = freqs.value;
		}
		
		if(sel_freq == 0) {
			jQuery('#__task_freq_edit_' + task_id).qtip('destroy');
			return false;
		}
		
		jQuery('#__task_freq_' + task_id).html('<img src="/images/loading.gif" />');
		var ajax_url = getAjaxWrapper('task_freq_update', {});
		jQuery.post(getRandomUrl(ajax_url), {task_id:task_id,freq:sel_freq}, function(data)
		{
			if (data == '1')
			{
				jQuery('#__task_freq_edit_' + task_id).qtip('destroy');
			}
			else
			{
				jQuery('#__task_freq_edit_error_' + task_id).css('display', 'block');
				jQuery('#__task_freq_edit_error_' + task_id).html('请选择正确的监控频率！');
			}
			
			jQuery('#__task_freq_' + task_id).html(sel_freq + '分钟');
		});
	},
	showMoreBottom: function(btn, more_elem_id)
	{
		if (jQuery('#' + more_elem_id).css('display') == 'none')
		{
			jQuery('#' + more_elem_id).show('blind');
			jQuery(btn).removeClass();
			jQuery(btn).addClass('more_bottom_off');
		}
		else
		{
			jQuery('#' + more_elem_id).hide('blind');
			jQuery(btn).removeClass();
			jQuery(btn).addClass('more_bottom_on');
		}
	},
	example: function(period)
	{
		var ajax_url = getAjaxWrapper('get_marker_group_list', {marker_id:marker_id});
		jQuery('#marker_groups').load(getRandomUrl(ajax_url), function()
		{
			
		});
	},
	displayAnalogUrl: function()
	{
		var callback_url = jQuery('#callback_url').val();
		var url_callback_key = jQuery('#url_callback_key').val();
		if(callback_url.length == 0)
		{
			showSuccMsg('请填写回调URL。', '', '', {});
			return false;
		}
		
		var ajax_url = getAjaxWrapper('get_analog_callback_url', {callback_url:callback_url, url_callback_key:url_callback_key});
		
		jQuery('#analog_url').load(getRandomUrl(ajax_url), function()
		{
			jQuery('#analog_url').fadeIn();
		});		
	},
	updateUrlCallbackKey: function()
	{		
		var ajax_url = getAjaxWrapper('update_url_callback_key');
		jQuery.get(getRandomUrl(ajax_url), function(data)
		{
			jQuery('#url_callback_key').val(data);
			jQuery('#analog_url').fadeOut();
		});		
	},
	showCallbackMsgDetail: function(alert_id)
	{
		if (jQuery('#__callback_' + alert_id).css('display') == 'none')
		{
			jQuery('#__callback_' + alert_id).fadeIn();
		}
		else if(jQuery('#__callback_' + alert_id).css('display') != 'none')
		{
			jQuery('#__callback_' + alert_id).fadeOut();
		}		
	},
	loadMonitorAvgResptime: function(task_id, edition)
	{
		var ajax_url = getAjaxWrapper('get_all_monitor_avg_resptime', {task_id:task_id, edition:edition});
		
		
		jQuery('#__task_monitor_' + task_id).qtip({
						content:{
							text:'<img src="/images/ajax_loader5.gif" />',
							url:ajax_url
						},
						position: {
							corner: {
								target: 'topLeft',
								tooltip: 'bottomRight'
							}
						},
						style: {
							 name: 'blue',
							 padding: '7px 13px',
							 width: {
								max: 260,
								min: 0
							 },
							 tip: true,
							 classes: { content: 'public_detail_tips'}
						},
						show: {
							solo: true,
							when: 'focus'
						},
						hide:'unfocus'
					});		
					
		jQuery('#__task_monitor_' + task_id).focus();
	},
	loadAddToView: function(task_id, task_type, task_sort, widget_type, task_dev, display_id)
	{
		var ajax_url = getAjaxLayer('get_custom_widget', {task_id:task_id, task_type:task_type, task_sort:task_sort, task_dev:encodeURIComponent(task_dev), widget_type:widget_type, display_id:display_id});		
		jQuery('#div_add_to_view_' + display_id).html('<img src="/images/ajax_loader2.gif" />');
		jQuery('#div_add_to_view_' + display_id).load(getRandomUrl(ajax_url), function()
		{
		});
	},	
	loadAddToViewNew: function(display_id, widget_style, json_str, report_id)
	{   
	    jQuery('#div_add_to_view_compare').show();
		jQuery('#div_add_to_view_compare_json').val(json_str);
		
		//json_str = encodeURI(json_str);
		var ajax_url = getAjaxLayer('get_custom_widget', {display_id:display_id, widget_style:widget_style, report_id:report_id});		
		
		jQuery('#div_add_to_view_' + display_id).html('<img src="/images/ajax_loader2.gif" />');
		jQuery('#div_add_to_view_' + display_id).load(getRandomUrl(ajax_url), function()
		{
		});
	},	
	submitAddCustomView: function(task_id, task_type, task_sort, widget_type, task_dev, display_id)
	{
		var new_view = jQuery('#new_view_' + display_id).val();
		new_view = encodeURIComponent(new_view);

		var view_id = jQuery('#view_id_' + display_id).val();
		var view_new = jQuery('#view_new_' + display_id).attr('checked');
		var view_type = view_new ? 'view_new' : 'view_exist';
		
		var url = getAjaxWrapper('add_view_widget', {task_id:task_id, task_type:task_type, task_sort:task_sort, task_dev:encodeURIComponent(task_dev), widget_type:widget_type, view_id:view_id, view_type:view_type, new_view:new_view});
		jQuery('#msg_container_' + display_id).html('<img src="/images/ajax_loader2.gif" />');
		jQuery.getJSON(getRandomUrl(url), function(json) {
            var res = json['res'];
		    var msg = json['msg'];
			var return_view_id = json['view_id'];
            if ( res == '0') {
				var succ_msg = '添加成功！<a href="/view/' + return_view_id + '" target="_blank">访问视图</a>';
				showSuccMsgFixed(succ_msg, '', 'msg_container_' + display_id, {});
			}
            else {
				showErrorMsg(msg, '', 'msg_container_' + display_id, {});
			}
		});
	},
	submitAddViewWidget: function (display_id, widget_style, report_id)
	{
		var new_view = jQuery('#new_view_' + display_id).val();
		new_view = encodeURIComponent(new_view);
		
		
		var view_id = jQuery('#view_id_' + display_id).val();
		var view_new = jQuery('#view_new_' + display_id).attr('checked');
		var view_type = view_new ? 'view_new' : 'view_exist';
		var widget_options = jQuery('#div_add_to_view_compare_json').val();
		var url = getAjaxWrapper('add_view_widget', {report_id:report_id, widget_style:widget_style, widget_options:widget_options, view_id:view_id, view_type:view_type, new_view:new_view});
		jQuery('#msg_container_' + display_id).html('<img src="/images/ajax_loader2.gif" />');
		jQuery.getJSON(getRandomUrl(url), function(json) {
            var res = json['res'];
		    var msg = json['msg'];
			var return_view_id = json['view_id'];
            if ( res == '0') {
				var succ_msg = '添加成功！<a href="/view/' + return_view_id + '" target="_blank">访问视图</a>';
				showSuccMsgFixed(succ_msg, '', 'msg_container_' + display_id, {});
			}
            else {
				showErrorMsg(msg, '', 'msg_container_' + display_id, {});
			}
		});

	},
	
	viewWidReload: function(view_id, wid_id, period)
	{
		if (!period)
		{
			period = JKB.cache.curr_period;
		}
		jQuery('#wid_body_reloading_' + wid_id).hide();
		jQuery('#wid_body_loading_' + wid_id).show();
		jQuery('#wid_chart_' + wid_id).hide();

		var curr_url = document.getElementById('wid_chart_' + wid_id).src;
		var new_url = '/widget_chart.php?view_id=' + view_id + '&widget_id=' + wid_id + '&period=' + period + '&range=' + JKB.cache.date_range;
		if (period == JKB.cache.curr_period)
		{
			new_url = getRandomUrl(new_url);
		}
		document.getElementById('wid_chart_' + wid_id).src = new_url;
	},
	viewWidAllReload: function(view_id, period)
	{
		for(var i = 0; i < g_layout.length; i++)
		{
			for(var j = 0; j < g_layout[i].length; j++)
			{
				var wid_id = g_layout[i][j].substr(7);
				JKB.loader.viewWidReload(view_id, wid_id, period);
			}
		}
	},
	loadViewWids: function(period)
	{
		this.switchDateRangeSelected(period);
		this.viewWidAllReload(__view_id, period);
		this.hideDateSelecter();
		JKB.cache.setCurrPeriod(period);
		this.getDRSelectorPeriod(period);
	},
	getDRSelectorPeriod: function(period)
	{
		jQuery('#__period').html(JKB.loader.loading_str).removeClass().addClass('task_data_loading');
		ajax_url = getAjaxWrapper('get_daterange_period', {period: period, range: JKB.cache.date_range});
		jQuery.getJSON(getRandomUrl(ajax_url), function(json)
		{
			fillPeriod(json['period']);
		});
		function fillPeriod(str)
		{
			jQuery('#__period').html(str).removeClass().addClass('time_period');
		}
	},	
	loadThumb: function(task_id, task_type, task_sort, thumb_type, task_dev, display_id, thumb_style)
	{		
		var url = getAjaxWrapper('get_thumb_data', {task_id:task_id, task_type:task_type, task_sort:task_sort, thumb_type:thumb_type, task_dev:task_dev});
		
		jQuery.getJSON(getRandomUrl(url), function(json) {
			for(k in json)
			{
				jQuery('#thumb_' + k).html('<img class="thumb_style" src="/thumb.php?thumb_style=' + thumb_style + '&data=' + json[k] + '" />');
			}
		});
	},
	cancelMobileValidate: function()
	{		
		var url = getAjaxWrapper('cancel_mobile_validate', {});
		
		jQuery.get(getRandomUrl(url), function(data) {
			if(data == '1')
			{
				jQuery('#mobile').removeAttr("readonly");
				jQuery('#mobile_validate_button_close').hide();
				jQuery('#mobile_validate_button_open').show();				
			}
			else
			{
				jQuery('#__err_mobile').html('解除认证失败！');
			}
		});
	},
	mobileValidate: function(style)
	{
		var mobile = '';
		var url = getAjaxWrapper('get_mobile_validate_code', {});
		if (style == '1') {
			mobile = jQuery('#mobile').val().trim();
			var url = getAjaxWrapper('get_mobile_validate_code', {style:style, mobile:mobile});
		}
		
		jQuery.getJSON(getRandomUrl(url), function(data) {
			var res = data.res;
			var msg = data.msg;
			
			if(style == '1'){
				if(res == '0') {
					window.location.href = '/mobile_validate.php';
				} else{
					jkbAlert(msg, 'error');
				}				
			}else {
				if(res == '0') {
					jkbAlert(msg, 'ok');
				} else{
					jkbAlert(msg, 'error');
				}				
			}
				
		});		
	},
	loadUserAlertStat: function(sel)
	{
		var u = jQuery(sel).val();
		window.location = '/alert/stat?u=' + u;
	},
	loadAdminUserAlertStat: function(user_id, master_id, sel)
	{
		var u = jQuery(sel).val();
		window.location = '/admin_tool_alert_stat.php?user=' + user_id + '&master=' + master_id + '&u=' + u;
		return false;
	},	
	loadUserAlertHistory: function(select_type)
	{
		this.showAjaxLoader();
		var uid = '';
		if(jQuery('#__alert_user_single').attr('checked') == true || select_type){
			uid = jQuery('#__share_user_list').val();
		}
		var type = jQuery('#__alert_type').val();
		var dt_range = JKB.cache.dt_range;
		window.location = '/alert/history?type=' + type + '&range=' + dt_range + '&u=' + uid;
		return false;
	},	
	loadAdminUserAlertHistory: function(user_id, master_id, select_type)
	{
		var uid = '';
		if(jQuery('#__alert_user_single').attr('checked') == true || select_type){
			uid = jQuery('#__share_user_list').val();
		}
	
		window.location = '/admin_tool_alert_history.php?user=' + user_id + '&master=' + master_id + '&u=' + uid;
		return false;
	},	
	viewReloadCtrl: function()
	{
		var cname = jQuery('#__view_reload').attr('class');
		if (cname == 'view_autoload_start')
		{
			jQuery('#__view_reload').removeClass();
			jQuery('#__view_reload').addClass('view_autoload_pause');
			view_autoreload(__reload_time);
		}
		else
		{
			jQuery('#__view_reload').removeClass();
			jQuery('#__view_reload').addClass('view_autoload_start');
			jQuery('#__view_reload_time').html('');
			if (__view_timer)
				clearTimeout(__view_timer);
		}
	},
	loadServerListStatus: function(period, scale)
	{
		var period;
		var range;
		//var scale;
		if(!period) period = '';
		if(!range) range = '';
		
		if (period == 'custom')
		{
			if (JKB.cache.date_range == '')
			{
				var start = jQuery('#__date_start').val();
				var end = jQuery('#__date_end').val();
				JKB.cache.date_range = start + ',' + end;
			}
		}
		
		var view_type = JKB.cache.view_type_tab;
		var status_type = JKB.cache.server_tab;
		var type = JKB.cache.host_list_type;
		var node_type = 'h';
		if(type == 't'){
			node_type = type;
		}
		
		var n_id = JKB.cache.n_id;
		if(view_type == 'list'){
			if(status_type == 'netio' && node_type){
				status_type = 'list';
				selectClass('server_tab', 'list');
			}	
			
			if(status_type == 'list' && node_type == 'h'){
				var ajax_url = '/ajax_host_list.php?node_type=' + node_type + '&n_id=' + n_id;
			}else {
				var ajax_url = '/ajax_server_list_status.php?type=' + status_type + '&node_type=' + node_type + '&n_id=' + n_id;
			}
			$("#server_tab_netio").hide();
			$("#server_tab_list").show();
			
		}else if(view_type == 'pic') {
			if(status_type == 'list' && node_type){
				status_type = 'netio';
				selectClass('server_tab', 'netio');
			}	
			
			var ajax_url = '/ajax_server_view.php?n_id=' + n_id + '&dev_type=' + status_type;
			$("#server_tab_list").hide();
			$("#server_tab_netio").show();
			
		}else {
			var ajax_url = '/ajax_server_list_status.php?type=' + status_type;
		}
		ajax_url += "&period=" + period + "&range=" + JKB.cache.date_range + "&scale=" + scale;

		JKB.loader.showAjaxLoader();
		jQuery('#server_list_status').load(getRandomUrl(ajax_url), function()
		{
			JKB.loader.hideAjaxLoader();
		});
		return false;
		
	},
	showStatusBarNew: function(index, width, percent, value, tips, alink, color)
	{
		var html = '<p class="statusbar_frame" title="' + tips + '"><span class="status_value">';
		if (alink)
		{
			html += '<a href="' + alink + '"><span style="color:' + color + '">' + value + '</span></a>';
		}
		else
		{
			html += '<span style="color:' + color + '">' + value + '</span>';
		}
		html += '</span><span style="width:' + width + 'px;" class="statusbar_box"><span class="statusbar_value" style="width:' + percent + '%;background-color:' + color + ';"></span></span></p>';
		
		jQuery('#status_bar_' + index).html(html);
	},
	exportTaskList: function()
	{		
		var excel_url = '/excel_task_list.php?period=' + JKB.cache.curr_period + '&range=' + JKB.cache.date_range;
		jQuery("#export_task_list").attr('href', excel_url);
		return false;	
	},
	exportReportUprate: function()
	{		
		var excel_url = '/csv_report_uprate.php?period=' + JKB.cache.curr_period + '&range=' + JKB.cache.date_range + '&task_id=' + JKB.cache.task_id + '&scale=' + JKB.cache.scale;
		jQuery("#export_uprate").attr('href', excel_url);
		return false;	
	},
	exportReportResptime: function()
	{		
		var excel_url = '/csv_report_resptime.php?period=' + JKB.cache.curr_period + '&range=' + JKB.cache.date_range + '&task_id=' + JKB.cache.task_id + '&scale=' + JKB.cache.scale;
		jQuery("#export_resptime").attr('href', excel_url);
		return false;	
	},
	exportFaultList: function()
	{		
		var tree_html = '<div style="width:300px;"><div id="msg_container_popup" style="margin-bottom:4px;"></div><div class="normal_tips2">请选择要导出的故障时间范围：</div>';
		tree_html += '<div class="menu_title_root" style="margin-bottom:10px;"></div>';
		tree_html += '<input type="radio" name="export_fault_time" checked="checked" value="last7days" id="fault_time_7"/><label for="fault_time_7" style="margin-right:20px;">最近7天</label>';
		tree_html += '<input type="radio" name="export_fault_time" value="last15days" id="fault_time_15"/><label for="fault_time_15" style="margin-right:20px;">最近15天</label>';
		tree_html += '<input type="radio" name="export_fault_time" value="last30days" id="fault_time_30"/><label for="fault_time_30" style="margin-right:20px;">最近30天</label>';
		tree_html += '</div>';
		jConfirm(tree_html, '导出故障历史', function(r) {
			if(r){
				var selected_fault_time = jQuery("input[name='export_fault_time']:checked").val();
				if(!selected_fault_time){
					showErrorMsg("请选择要导出的故障时间范围", '', 'msg_container_popup');
					return false;
				}
				
				var excel_url = '/excel_fault_list.php?period=' + selected_fault_time;
				window.location.href = excel_url;
				return true;
			}
		});
		return false;
	},	
	loadMsnContacts: function()
	{
		var ajax_url = '/ajax_invite_msn_contacts.php?cache=' + Math.floor(100000*Math.random());
		JKB.loader.showAjaxLoader();
		jQuery.get(ajax_url, function(data){
			if(data == '1'){
				showErrorTips('很抱歉，MSN认证授权过期，请您重新尝试。', 'msn_contact_list');
			}else {
				jQuery("#msn_contact_list").html(data);
			}
			JKB.loader.hideAjaxLoader();
		});
		return false;		
	},
	setCookie: function(key, value, path)
	{
		var exdate = new Date();
		exdate.setDate(exdate.getDate() + 1000);
		var cookie_str = key + "=" + escape(value) + ";expires=" + exdate.toGMTString();	
		if(path){
			cookie_str += ";path=" + path;
		}
		document.cookie = cookie_str;		
	},
	getCookie: function(key)
	{
		if(document.cookie.length > 0){
		  c_start = document.cookie.indexOf(key + "=");
	
		  if(c_start != -1){ 
				c_start = c_start + key.length + 1; 
				c_end = document.cookie.indexOf(";", c_start);
				if(c_end == -1){
					c_end = document.cookie.length;
				}
				return unescape(document.cookie.substring(c_start,c_end));
			} 
		}
		return null;
	},
	delCookie: function(key)
	{		
		var exdate = new Date();
		exdate.setDate(exdate.getDate() - 1);
		document.cookie = key + "=" + ";expires=" + exdate.toGMTString() + ";path=/";	
	},
	deleteOauth: function(token_id)
	{		
		if(!confirm('你确定要取消授权吗？')) return false;
	
		var url = getAjaxWrapper('delete_oauth', {token_id:token_id});
		
		jQuery.get(getRandomUrl(url), function(data) {
			if(data == '0') {
				jQuery("#oauth_" + token_id).remove();
			} else{
				showErrorMsg('取消授权失败', '', '');
			}
		});	
		
		return false;
	},
	changePageRows: function()
	{		
		var page_rows = jQuery("#page_rows_select").val();
		JKB.loader.setCookie('page_rows', page_rows, '/');
		
		var url = window.location.href;
		if (url.indexOf('page=') != -1)
		{
		   url = url.replace(/page=[0-9a-z]+/g,'');
		   url = url.replace('?','');
		   window.location = url;	
		}
		else
		{
			window.location.reload();
		}
		return false;
	},
	faqCount: function(type, help_id, change)
	{
		if(type == 'useful'){			
			if(change == '1'){
				jQuery('#help_feedback_second').show();	
			}else {	
			}
		}else if(type == 'understand'){
		}else if(type == 'detail'){
		}else {
			return false;
		}
	
		jQuery('#help_' + type).hide();
		jQuery('#help_' + type + '_msg').show();	
		JKB.loader.faqCountSubmit(type, help_id, change);
		return false;
	},
	faqCountSubmit: function(type, help_id, change)
	{
		var url = getAjaxWrapper('faq_count_stat', {type:type, help_id:help_id, change:change});
		jQuery.get(getRandomUrl(url), function() {
		});
	},
	loadResptimePeriodStat: function(task_id, mon, start, end)
	{
		var url = getAjaxWrapper('get_task_resptime_period', {task_id:task_id, mon:mon, start:start, end:end});
		jQuery('#__resptime_period').html('<div style="padding:10px;"><img src="/images/ajax_loader2.gif" /></div>');
		jQuery('#__resptime_period').load(getRandomUrl(url), function() {
		});
	},
	hideTopBox: function(top_box_version)
	{
		JKB.loader.setCookie('top_box_version', top_box_version, '/');
		jQuery("#__top_box").fadeOut();
	},
	foldCartEditionItem: function()
	{
		var include_tr_fold = jQuery("#include_item_fold");
		if(include_tr_fold.hasClass("selected")){
			jQuery(".include_item_tr").hide();
			include_tr_fold.removeClass("selected");
		}else {
			jQuery(".include_item_tr").show();
			include_tr_fold.addClass("selected");	
		}
	},
	loadMonitorList: function(edition)
	{
		var group_html = jQuery("#monitor_group_" + edition).html();
		jkbAlert(group_html);
	},
	loadPayByTtelegraphicTransfer: function()
	{
		var group_html = jQuery("#pay_by_telegraphic_transfer").html();
		jkbAlert(group_html);
	},
	giveStandard: function()
	{
		var url = getAjaxWrapper('give_standard', {});
		jQuery.get(getRandomUrl(url), function(html) {
			jkbAlert(html, '', go_dashboard);
		});
	},
	showCalculatorLink: function()
	{
		var html = jQuery("#share_calculator").html();
		jkbAlert(html);
	},
	fillCompanyAndContact: function()
	{
		var company = jQuery("#__company").val();
		var contact = jQuery("#__contact").val();
		
		var url = getAjaxWrapper('fill_company_contact', {company:encodeURIComponent(company), contact:encodeURIComponent(contact)});
		jQuery.getJSON(getRandomUrl(url), function(data) {
			var errno = data.errno;
			var error = data.error;
			
			if(errno > 0){
				for(i in error){
					jQuery("#__error_" + i).html(error[i]);	
				}
			}else {
				jkbAlertHide();
				JKB.loader.giveStandard();
			}
			return false;
		});
		
		return false;
	},
	invoiceApply: function()
	{
		var pur_ids = '';
		var purs = new Array;		
		var obj = jQuery("input[name='__pur']:checked");

		for(i = 0; i < obj.length; i++){
			purs.push(obj[i].value);
		}
		pur_ids = purs.join(',');

		if (!pur_ids){
			jkbAlert('请选择需要申请发票的订单！', 'error');	
			return false;
		}
		
		var url = getAjaxWrapper('invoice_apply', {pur_ids:pur_ids});		
		jQuery.get(getRandomUrl(url), function(html) {
			if (html == '1'){
				jkbAlert('很抱歉，没有可以申请发票的订单！', 'error');	
			}else {
				jkbAlert(html);	
			}
		});
	},
	drawGift: function(invited_user_id, style)
	{					
		var url = getAjaxWrapper('draw_gift', {invited_user_id:invited_user_id, style:style});
		if (__draw_cache > 0){jkbAlert("您还有刮奖卡未刮完，请先刮完，以免丢失您的中奖信息！", 'error');return false;}
		
		jQuery.getJSON(getRandomUrl(url), function(data) {
			__draw_cache = 1;
			var draw_result = data.draw_result;
			var draw_result_img = data.draw_result_img;
			var card_id = '#card_' + invited_user_id;
			var draw_tips = '';
			
			jQuery("#__draw_button_" + invited_user_id).hide();
			jQuery(card_id).attr('src', '/images/' + draw_result_img);
			jQuery(card_id).show();
			jQuery("#__div_button_" + invited_user_id).addClass('scratchcard');
			
			var call_num = 0;
			var	callBack = function() {
				if (call_num > 0) return false;
				
				var scrape_url = getAjaxWrapper('scrape_gift', {invited_user_id:invited_user_id});
				call_num++;
				
				jQuery.get(getRandomUrl(scrape_url), function() {		
					__draw_cache = 0;
					if (draw_result) {
						draw_tips = '<div style="text-align:center;"><div class="smile"><img src="/images/smile.gif" />恭喜您中奖了！</div>中奖信息审核成功后奖品将以手机短信的方式发送到您的认证手机号码。详情请参考 <a href="/gift" target="_blank">活动介绍</a></div>';
						jkbAlert(draw_tips, '', jkbReload);
					}else {
						draw_tips = '<div style="text-align:center;"><div class="sad"><img src="/images/sad.gif" />您没有中奖！</div>邀请好友再试一次？详情请参考 <a href="/gift" target="_blank">活动介绍</a></div>';
						jkbAlert(draw_tips, '', jkbReload);
					}
				});
			};
			
			jQuery(card_id).jScratchcard({
				opacity: 0.9,
				color: '#98AFC7',
				stepx: 20,
				stepy: 10,
				callCallbackPerc: 10,
				mousedown: true,
				callbackFunction: callBack
			});
		});
	},
	refreshCaptcha: function(type)
	{
		if (type){
			var captcha_url = getRandomUrl('/' + type + '.php?o=f');
		}else {
			var captcha_url = getRandomUrl('/feedback_captcha.php?o=f');	
		}
		
		jQuery('#__captcha').attr('src', captcha_url);
	},
	loadMonitorUprateSummary: function(task_id)
	{
		jQuery('#__monitor_uprate_summary').html('<img src="/images/ajax_loader2.gif" />');
		ajax_url = getAjaxWrapper('get_monitor_uprate_summary', {task_id:task_id, period:JKB.cache.curr_period, range:JKB.cache.date_range});

		jQuery('#__monitor_uprate_summary').load(getRandomUrl(ajax_url), function()
		{
			__tab_uprate = 1;
		});		
	},
	showMonitorUprateSummary: function(task_id)
	{
		var dis = jQuery('#__monitor_uprate_summary').css('display');
		var tab_status = 0;
		if (dis == 'none'){
			jQuery('#__monitor_uprate_summary').slideDown();
			jQuery('#__monitor_uprate_btn').removeClass().addClass('arrow2_up');
			if (__tab_uprate == 0){
				JKB.loader.loadMonitorUprateSummary(task_id);
			}
		}else {
			jQuery('#__monitor_uprate_summary').slideUp();
			jQuery('#__monitor_uprate_btn').removeClass().addClass('arrow2_down');
			tab_status = 1;
		}
		
		var tab_cookie = JKB.loader.getCookie('__tsum_tab');
		if (!tab_cookie){
			JKB.loader.setCookie('__tsum_tab', tab_status + '.0');	
		}else {
			var tab_resptime = tab_cookie.substr(1, 2);	
			JKB.loader.setCookie('__tsum_tab', tab_status + tab_resptime);
		}
	},
	loadMonitorResptimeSummary: function(task_id)
	{
		jQuery('#__monitor_resptime_summary').html('<img src="/images/ajax_loader2.gif" />');
		ajax_url = getAjaxWrapper('get_monitor_resptime_summary', {task_id:task_id, period:JKB.cache.curr_period, range:JKB.cache.date_range});

		jQuery('#__monitor_resptime_summary').load(getRandomUrl(ajax_url), function()
		{
			__tab_resptime = 1;
		});	
	},
	showMonitorResptimeSummary: function(task_id)
	{
		var dis = jQuery('#__monitor_resptime_summary').css('display');
		var tab_status = 0;
		if (dis == 'none'){
			jQuery('#__monitor_resptime_summary').slideDown();
			jQuery('#__monitor_resptime_btn').removeClass().addClass('arrow2_up');
			if (__tab_resptime == 0){
				JKB.loader.loadMonitorResptimeSummary(task_id);
			}
		}else {
			jQuery('#__monitor_resptime_summary').slideUp();
			jQuery('#__monitor_resptime_btn').removeClass().addClass('arrow2_down');
			tab_status = 1;
		}
		
		var tab_cookie = JKB.loader.getCookie('__tsum_tab');
		if (!tab_cookie){
			JKB.loader.setCookie('__tsum_tab', '0.' + tab_status);	
		}else {
			var tab_uprate = tab_cookie.substr(0, 2);	
			JKB.loader.setCookie('__tsum_tab', tab_uprate + tab_status);
		}
	},	
	showTaskMonitor: function(elem, group_id, task_type, task_id)
	{
		JKB.loader.showPopLayer(elem, 'get_task_monitor', {group_id:group_id, task_type:task_type, task_id:task_id});
	},
	editMonitorGroup: function(group_id, type)
	{
		if (type == 'del'){
			if (confirm('您确定要删除分组吗？ 删除分组后分组中的监控项目将使用默认监测点分组')){
				window.location.href = '/dispose.php?__action=monitor_group_del&group_id=' + group_id;
				return false;
			}else {
				return false;
			}
		}
		
		jQuery(".group_tr").removeClass('group_tr_select');
		jQuery("#__group_tr_" + group_id).addClass('group_tr_select');
		
		jQuery('#__monitor_edit').html('<img src="/images/ajax_loader2.gif" />');
		ajax_url = getAjaxWrapper('get_monitor_group_edit_info', {group_id:group_id, type:type});

		jQuery('#__monitor_edit').load(getRandomUrl(ajax_url), function()
		{
		});		
	},
	changeGroupInfo: function(data)
	{
		var ret = json_parse(data);
		var group_id = ret.group_id;
		jQuery("#__group_name_" + group_id).html(ret.group_name);
		if (ret.group_status_change == '1') {
			jQuery("#__group_status_" + group_id).html('使用中');
			jQuery("#__group_open_" + group_id).html('');
		}
	},
	loadUserNoticeNum: function(no_load)
	{
		if (no_load) return false;
		
		ajax_url = getAjaxWrapper('get_user_notice_num');
		jQuery.get(getRandomUrl(ajax_url), function(notice_num)
		{
			if (notice_num > 0) {
				jQuery("#__user_notice_tips").fadeIn();
				jQuery("#__user_notice_num").html(notice_num);
			}
		});		
	},
	expendNotice: function(uniq_id)
	{
		var row = jQuery("#__row_" + uniq_id);
		var button = jQuery("#__button_" + uniq_id);
		var content = jQuery("#__content_" + uniq_id);
		
		//展开情况
		if (row.hasClass('notice_expand')) {
			row.removeClass('notice_expand');
			button.removeClass().addClass('arrow2_down');
			content.fadeOut();
		}else {
			row.addClass('notice_expand');
			button.removeClass().addClass('arrow2_up');
			content.fadeIn();
			jQuery("#__title_" + uniq_id).removeClass('no_read');
		}
	},
	saveTaskSort: function(view_layout)
	{		
		var url = getAjaxWrapper('save_task_sort');
		jQuery.post(getRandomUrl(url), {view_layout:view_layout}, function(res) {
            if (res == '1') {
				jkbAlert('很抱歉，排序失败！', 'error');
			}
		});
	},
	showPurchaseDialog:function()
	{
		var dialog_html = document.getElementById("dialog_html").innerHTML;
		jkbAlert(dialog_html, '',jkbReload);
	},
	reportGadata: function(show_div,data,period,range,task_id,scale,monitor_id,compare_type,one_line,one_title,two_line,two_title)
	{
		 var url = getAjaxWrapper('get_ga_chart');
		 var new_url = encodeURI(url+"&ga_data="+data+"&show_div=new_"+show_div+"&period="+period+"&date_range="+range+"&task_id="+task_id+"&scale="+scale+"&monitor_id="+monitor_id+"&compare_type="+compare_type+"&one_line="+one_line+"&one_title="+one_title+"&two_line="+two_line+"&two_title="+two_title);
		 jQuery('#'+show_div).show();
		 $("#"+show_div).load(new_url,function (){jQuery('#'+show_div+'_loading').empty();});	 
	},
	showPromoCode: function()
	{
		var promo_box = jQuery('#__promo_box');
		var use_flag = jQuery('#use_promo_code');
		if(promo_box.css('display') == 'none'){
			promo_box.fadeIn();	
			use_flag.val(1);
		}else{
			promo_box.fadeOut();
			use_flag.val(0);
		}
	},
	onSelectTopAppkey: function(elem,show_id)
	{
		var value = elem.options[elem.selectedIndex].value;
		jQuery('#'+show_id).val('');
		
		if(value == null || value == "")
		{
			jQuery('#'+show_id).val("");
			jQuery('#ajax_app_name').text("");
			showErrorMsg('请选择AppKey', '', 'msg_container_task', {});
			return false;
		}
		var url = getAjaxWrapper('get_top_url_by_appkey', {appkey:value});
		jQuery.post(getRandomUrl(url),  function(res)
		{
			if(res == 1)
			{
				jQuery('#msg_container_task').hide("slow");
				jQuery('#top_show_notice').show("slow");
				return false;
			}
			else if(res == 2)
			{
				jQuery('#msg_container_task').hide();
				jQuery('#top_show_notice').hide("slow");
				showErrorMsg('很抱歉，无法获取此应用的监控页面URL，请 <a href="">重试</a> 或 <a href="http://my.open.taobao.com" target="_blank">检查</a> 此应用设置是否正确', '', 'msg_container_task', {});
				return false;
			}
			else
			{
				var ret = json_parse(res);
				var monitor_url;
				monitor_url = ret['monitor_url'][0];
				jQuery('#top_show_notice').hide("slow");
				jQuery('#msg_container_task').hide("slow");
				jQuery('#'+show_id).val(monitor_url);
			}
          
		});
	},
	onSelectTopAllAppKey:function(select_key)
	{
		jQuery('#ga_loading').html('<img src="/images/ajax_loader2.gif" />');
		var url = getAjaxWrapper('get_top_all_appkey');
		jQuery.post(getRandomUrl(url), {appkey:select_key}, function(res) {
            if (res == '1') {
				jQuery('#top_show_notice').show("slow");
			}
            else
            {
            	jQuery('#appkey_value').append(res);	
            }
            jQuery('#ga_loading').empty().hide();
			jQuery('#appkey_value').show();
		});
	},
	usePromoCode: function()
	{
		var promo_code = jQuery("#promo_code").val();
		var month_num = jQuery("#month_num").val();
		
		ajax_url = getAjaxWrapper('validate_promo_code', {promo_code:promo_code, month_num:month_num});
		jQuery.getJSON(getRandomUrl(ajax_url), function(ret)
		{
			var msg_content = ret.error.join("<br />");
			
			var html = '';
			if(ret.errno){
				html = '<div class="error_msg">' + msg_content + '</div>';
				jQuery('#__promo_fee_box').fadeOut();
			}else{
				html = '<div class="succ_msg">' + msg_content + '</div>';
				jQuery('#__promo_fee').html(ret.data.promo_fee);
				jQuery('#__promo_fee_box').fadeIn();
			}
			html += '<div class="spacer5"></div>';
			
			jQuery('#__promo_tips').html(html).fadeIn();
		});			
	},
	addIpInput: function()
	{
		var ajax_url = getAjaxWrapper('get_dns_ip_input');
		var sum_ip_num = $("input#metric_ip_1").length;
		if(sum_ip_num >= 10){
			jQuery('#msg_error').html("抱歉,ip最多添加十个指标").show("slow");
			setTimeout(function(){jQuery('#msg_error').hide("slow");}, 3000);
		}else{
			jQuery.get(getRandomUrl(ajax_url), function(data){
				jQuery('#ip_metric_table tbody').append(data);
			}); 
		}
	},
	deleteIpInput: function(task_id, metric_id)
	{
		if(!confirm('您确定要删除该指标吗？')) return false;
		
		var errno;
		var error;
		if(task_id){
			var ajax_url = getAjaxWrapper('delete_dns_ip_metric', {task_id:task_id, metric_id:metric_id});
			jQuery.get(getRandomUrl(ajax_url), function(data){
				if(data == '1'){
					jQuery('#exist_ip_' + metric_id).remove();
				}
			}); 	
		}else {
			jQuery('#' + metric_id).remove();
		}
	}
};
	
function go_dashboard()
{
	window.location.href = '/dashboard';
}

function go_to_alert_medium()
{
	window.location.href = '/alert_medium_settings.php?m=sms';
}
	
jQuery(window).click(function()
{
	JKB.loader.onClickDropMenuOutside();
});

jQuery(document).click(function(e)
{
	JKB.loader.onClickDropMenuOutside();
	clearNavLayer();
	
});

function clearNavLayer()
{
	jQuery('#__dropmenu_nav_selector').hide();
	
	if(account_over){
		if(jQuery('#__dropmenu_account_selector').css('display') != 'none'){
			jQuery('#__dropmenu_account_selector').hide();
		}else {
			jQuery('#__dropmenu_account_selector').show();	
		}
	}else {
		jQuery('#__dropmenu_account_selector').hide();		
	}	
}

var __view_timer = null;
function view_autoreload(time)
{
	if (time == 0)
	{
		JKB.loader.viewWidAllReload(__view_id);
		time = __reload_time;
	}
	jQuery('#__view_reload_time').html('(' + time + '秒)');
	__view_timer = setTimeout(function(){view_autoreload(--time);}, 1000);
}
		
function getRandomUrl(url)
{
	return url + '&cache=' + Math.floor(100000*Math.random());
}

function getAjaxWrapper(command, options)
{
	var url = '/ajax_wrapper.php?command=' + command;
	for (name in options)
	{
		url += '&' + name + '=' + options[name];
	}

	return url;
}
function getAjaxLayer(command, options)
{
	var url = '/ajax_layer.php?command=' + command;
	for (name in options)
	{
		url += '&' + name + '=' + options[name];
	}
	
	url = getRandomUrl(url);
	return url;
}

function getDomDataById(id)
{
	return getDomData(document.getElementById(id));
}
function getDomData(object)
{
	eval("var data = {" + object.getAttribute('data[]') + "};");
	return data;
}
function hashEncode(data)
{
	var hash = '#';
	for (name in data)
	{
		hash += name + ':#' + data[name] + '#,';
	}
	if (hash.substr(hash.length - 1, 1) == ',')
	{
		hash = hash.substr(0, hash.length - 1);
	}
	return hash;
}
function hashDecode(hash)
{
	while (hash.indexOf('#') != -1)
	{
		hash = hash.replace('#', '"');
	}
	eval("var data = {" + hash + "};");
	return data;
}

function showErrorMsg(msg, action, msgcontainer_id, json)
{
	if (msgcontainer_id == '')
		msgcontainer_id = 'msg_container';
	var msg_container = document.getElementById(msgcontainer_id);
	if (msg_container)
	{
		msg_container.className = 'error_msg';
		msg_container.innerHTML = msg;
		jQuery('#'+msgcontainer_id).show("slow");
	}
	resetSubmitBtn();
	if (typeof error_callback != 'undefined')
	{
		error_callback(msg, action, msgcontainer_id, json);
	}
}
function showControllerErrorMsg(msg, action, msgcontainer_id, json)
{
	for (name in msg)
	{
		if (jQuery('#__err_' + name))
		{
			jQuery('#__err_' + name).html(msg[name]).show();
			jQuery('#' + name).attr('normal_class', jQuery('#' + name).attr('class'));
			jQuery('#' + name).addClass('input_err');
			jQuery('#' + name).focus(function(){
				this.setAttribute('class', this.getAttribute('normal_class'));
				jQuery('#__err_' + this.id).hide();
			});
		}
	}
	resetSubmitBtn();
	if (typeof error_callback != 'undefined')
	{
		error_callback(msg, action, msgcontainer_id, json);
	}
}
function showPopupErrorMsg(msg, action, msgcontainer_id, json)
{
	jQuery(".popup_err").hide();
	for (name in msg)
	{
		if (jQuery('#__err_' + name))
		{
			jQuery('#__err_' + name).html(msg[name]).show();
		}
	}
	resetSubmitBtn();
}

function showSuccMsg(msg, action, msgcontainer_id, json)
{
	
	if (msgcontainer_id == '')
		msgcontainer_id = 'msg_container';
	var msg_container = document.getElementById(msgcontainer_id);
	if (msg_container)
	{
		msg_container.className = 'succ_msg';
		msg_container.innerHTML = msg;
		jQuery('#'+msgcontainer_id).show("slow");
	}
	resetSubmitBtn();
	if (msgcontainer_id == '')
	{
		scroll(0,0);
	}
	if (typeof succ_callback != 'undefined')
	{
		succ_callback(msg, action, msgcontainer_id, json);
	}
	setTimeout(function(){jQuery('#'+msgcontainer_id).hide("slow");}, 3000);
}

function showSuccMsgFixed(msg, action, msgcontainer_id, json)
{
	if (msgcontainer_id == '')
		msgcontainer_id = 'msg_container';
	var msg_container = document.getElementById(msgcontainer_id);
	if (msg_container)
	{
		msg_container.className = 'succ_msg';
		msg_container.innerHTML = msg;
		jQuery('#'+msgcontainer_id).show("slow");
	}
	resetSubmitBtn();
	if (msgcontainer_id == '')
	{
		scroll(0,0);
	}
	if (typeof succ_callback != 'undefined')
	{
		succ_callback(msg, action, msgcontainer_id, json);
	}
}

function showErrorTips(msg, msgcontainer_id)
{
	if (msgcontainer_id == '')
		msgcontainer_id = 'msg_container';
	var msg_container = document.getElementById(msgcontainer_id);
	if (msg_container)
	{
		msg_container.className = 'error_msg';
		msg_container.innerHTML = msg;
		jQuery('#'+msgcontainer_id).show("slow");
	}
	resetSubmitBtn();
	setTimeout(function(){jQuery('#'+msgcontainer_id).fadeOut();}, 3000);
}

function onSubmitSucc(msg, msg_id, btn_id, form_id)
{
	jQuery('#' + btn_id).hide();
	jQuery('#' + form_id).fadeOut('normal', function(){
		jQuery('#' + msg_id).html(msg);
		jQuery('#' + msg_id).show('fast');
	});
	if (typeof succ_callback != 'undefined')
	{
		succ_callback(form_id);
	}
	pageScroll();
}

var cache_btn_id = null;
var cache_loading_id = null;
function submitLoading(btn_id, loading_id)
{
	cache_btn_id = btn_id;
	cache_loading_id = loading_id;
	jQuery('#' + btn_id).hide();
	jQuery('#' + loading_id).show();
}
function resetSubmitBtn()
{
	jQuery('#' + cache_btn_id).show();
	jQuery('#' + cache_loading_id).hide();
}
function resetMsgContainer()
{
	jQuery('#msg_container').hide();
}
function showAlertMsg(msg)
{
	alert(msg);
	return false;
}
function source2url(url)
{
	url += '&source=' + escape(window.location.href);
	window.location = url;
	return false;
}

function showConfirm(msg)
{
	if (confirm(msg))
	{
		return true;
	}
	return false;
}
function selectAllCheckboxByName(obj, switch_elem)
{
	var ret = switch_elem.checked;
	if (obj.length)
	{
		for (var i = 0, length = obj.length; i < length; ++i)
		{
			obj[i].checked = ret;
		}
	}
	else
	{
		obj.checked = ret;
	}
}
function selectCheckbox(obj, selected_array)
{
	if (selected_array == '')
	{
		//return;
	}
	if (!obj)
	{
		return;
	}
	if (obj.length)
	{
		for (var i = 0, length = obj.length; i < length; ++i)
		{
			if (selected_array.indexOf(obj[i].value) != -1)
			{
				obj[i].checked = true;
			}
			else
			{
				obj[i].checked = false;
			}
		}
	}
	else
	{
		if (selected_array.indexOf(obj.value) != -1)
		{
			obj.checked = true;
		}
		else
		{
			obj.checked = false;
		}
	}
}
function checkRadio(obj, value)
{
	if (!obj)
	{
		return;
	}
	if (obj.length)
	{
		for (var i = 0, length = obj.length; i < length; ++i)
		{
			if (obj[i].value == value)
			{
				obj[i].checked = true;
			}
		}
	}
	else
	{
		if (obj.value == value)
		{
			obj.checked = true;
		}
	}
}
function switchAttr(cond, result)
{
	result = cond;
}
function goPage(page)
{
	var url = window.location.href;
	if (url.indexOf('page=') != -1)
	{
		url = url.replace(/page=[0-9]+/g, 'page=' + page);
	}
	else
	{
		if (url.indexOf('#') != -1)
		{
			url = url.substr(0, url.indexOf('#'));
		}
		url += (url.indexOf('?') == -1 ? '?' : '&') + 'page=' + page;
	}
	window.location = url;
}
function goStart(start,curr,dir)
{
	var url = window.location.href;
	if (url.indexOf('start=') != -1)
	{
		url = url.replace(/start=[0-9]+/g, 'start=' + start);
	}
	else
	{
		if (url.indexOf('#') != -1)
		{
			url = url.substr(0, url.indexOf('#'));
		}
		url += (url.indexOf('?') == -1 ? '?' : '&') + 'start=' + start;
	}
	if (url.indexOf('curr=') != -1)
	{
		url = url.replace(/curr=[0-9]+/g, 'curr=' + curr);
	}
	else
	{
		if (url.indexOf('#') != -1)
		{
			url = url.substr(0, url.indexOf('#'));
		}
		url += (url.indexOf('?') == -1 ? '?' : '&') + 'curr=' + curr;
	}
	if (url.indexOf('dir=') != -1)
	{
		url = url.replace(/dir=[0-9]+/g, 'dir=' + dir);
	}
	else
	{
		if (url.indexOf('#') != -1)
		{
			url = url.substr(0, url.indexOf('#'));
		}
		url += (url.indexOf('?') == -1 ? '?' : '&') + 'dir=' + dir;
	}
	window.location = url;
}
function getAjaxWrapper(command, options)
{
	var url = '/ajax_wrapper.php?command=' + command;
	for (name in options)
	{
		url += '&' + name + '=' + options[name];
	}
	return url;
}
function task_detail_display(task_id)
{
	var task_tr = jQuery('#__task_' + task_id);
	var task_tr_extend = jQuery('#__task_' + task_id + '_extend');
	task_tr.css('background', '0');
	task_tr_extend.css('display', '');
}
function pageScroll(id)
{
	if(id){
		$("html,body").animate({scrollTop: $("#" + id).offset().top}, 1000);
	}else{
		$("html,body").animate({scrollTop: $("body").offset().top}, 1000);
	}
}
function dns_server_check()
{
	if($('#use_dns_server').attr('checked') == true){
		$('#dns_server_div').show().slideDown();	
	}else {
		$('#dns_server_div').hide().slideUp();
	}
}
function checkbox_check_toggle(checkbox_id, div_id)
{
	if($('#' + checkbox_id).attr('checked') == true){
		$('#' + div_id).show().slideDown();
	}else {
		$('#' + div_id).hide().slideUp();
	}
}
function is_show_ip_metric(dns_type)
{
	if(dns_type != 'A'){
		$('#ip_metric_div').hide();
	}else {
		$('#ip_metric_div').show();
	}
}
function showWinTitleNewMsg(sum)
{
	var __win_title_cnt = 0;
	
	function __modify_title()
	{
		if(__win_title_cnt > 30){
			return false;
		}
		
		if (__win_title_cnt % 2 == 0)
		{
			document.title = '[' + sum + '条新告警消息]';
		}
		else
		{
			document.title = '监控宝提醒';
		}
		__win_title_cnt++;
		
		setTimeout(__modify_title, 1000);
	}
	__modify_title();
}
function resumeWinTitle()
{
	document.title = __win_title.toString();
}
function selectClass(parent_id, select_id)
{
	$('#' + parent_id + ' span').removeClass('selected');
	$('#' + parent_id + '_' + select_id).addClass('selected');
	if(parent_id == 'view_type_tab')
	{
		$('#' + parent_id + '_pic a').removeClass();
		$('#' + parent_id + '_list a').removeClass();
		JKB.cache.view_type_tab = select_id;
		if (select_id == 'list')
		{
			$('#' + parent_id + '_list a').addClass('view_type_tab_list_a_sel');
			$('#' + parent_id + '_pic a').addClass('view_type_tab_pic_a');
		}
		if (select_id == 'pic')
		{
			$('#' + parent_id + '_pic a').addClass('view_type_tab_pic_a_sel');
			$('#' + parent_id + '_list a').addClass('view_type_tab_list_a');
		}
	}
	else if(parent_id == 'server_tab')
	{
		JKB.cache.server_tab = select_id;
	}
}
function getCheckBoxSelected()
{
	var ids = new Array;
	
	var checkbox_obj = jQuery("input[name='task_comp']");
	for (i = 0; i < checkbox_obj.length; i++) {
		if (checkbox_obj[i].checked) {
			ids.push(checkbox_obj[i].value);
		}
	}

	return ids.join(',');
}
function loadServerList(from_server, sys_type)
{
	var ajax_url = getAjaxLayer('get_server_list', {server_id:from_server, sys_type:sys_type});
	
	jQuery.get(getRandomUrl(ajax_url), function(data){
		if(data == '1'){
			jAlert('很抱歉，该服务器尚未设置自定义告警线，无法应用到其它服务器。', '无法应用');
			return false;			
		}
		
		jConfirm(data, '请选择要应用到的服务器', function(r) {
			if(r){
				var to_ids = getCheckBoxSelected();

				if(to_ids == '') {
					showSuccMsg('请选择服务器。', '', 'msg_container_popup', {});
					return false;
				}
					
				var url = getAjaxWrapper('copy_server_threshold', {from_server:from_server, to_server:to_ids});
				jQuery.get(getRandomUrl(url), {}, function(ret) {
						jAlert('已经将自定义告警设置应用到选中的服务器。', '成功');
						return true;
				});
				return true;
			}
		});		
	});
	return false;
}

function submitGiveSmsPlus()
{
	submitLoading('btn_submit', 'loading_submit');
	var ajax_url = getAjaxWrapper('give_sms_plus_record');
	
	jQuery.getJSON(getRandomUrl(ajax_url), function(data){
		resetSubmitBtn();
		if(data == '1'){
			jAlert('很抱歉，您已经领取过此短信配额', '领取失败');
			return false;
		}else if(data == '2'){
			jAlert('很抱歉，您不属于领取短信包的用户范围', '领取失败');
			return false;
		}
		var num = data.sms_num;
		$("#show_main").hide();
		$("#show_error").show();
		jAlert('您已成功领取 ' + num + ' 条短信配额，请在 <a href="/dashboard?mid=' + data.user_id + '">' + data.user_email + '</a> 账户中查看。', '领取成功');
		return true;
	});
	return false;
}

function jkb_fadein(id, speed)
{
	if(!jQuery.support.opacity) {
		jQuery("#" + id).css('display', 'block');
	}else {
		if(speed){
			jQuery("#" + id).fadeIn(speed);
		}else {
			jQuery("#" + id).fadeIn();
		}
	}
}

function jkbReload()
{
	window.location.reload();	
}

function display_validate_button(type)
{
	if(type == '0'){
		jQuery("#mobile_validate_mobile_1").hide();
		jQuery("#mobile_validate_mobile_0").show();		
	}else if (type == '1'){
		jQuery("#mobile_validate_mobile_1").show();
		jQuery("#mobile_validate_mobile_0").hide();				
	}
}

var drop_timeout    = 200;
var drop_closetimer = 0;
var drop_ddmenuitem = 0;
var nav_monitor_selected = 0;

function drop_open()
{  
	drop_canceltimer();
	if(jQuery("#__dropmenu_nav_selector").css('display') == 'none'){
		drop_ddmenuitem = jQuery("#__dropmenu_nav_selector").fadeIn('fast');
		var monitor_nav = jQuery("#__monitor_nav_link");
		if(monitor_nav.hasClass('selected'))
		{
			nav_monitor_selected = 1;
		}
		else
		{
			monitor_nav.addClass('selected');
		}
	}
}

function drop_close()
{  
	if(drop_ddmenuitem) {
		drop_ddmenuitem.hide();	
		if(nav_monitor_selected == 0)
		{
			jQuery("#__monitor_nav_link").removeClass('selected');	
		}
	}
}

function drop_timer()
{
	drop_closetimer = window.setTimeout(drop_close, drop_timeout);
}

function drop_canceltimer()
{  
	if(drop_closetimer)
   	{  
 		window.clearTimeout(drop_closetimer);
      	drop_closetimer = null;
	}
}

function error_report_div(div_id,content)
{
	$('#'+div_id).html('<font color=red >'+content+'</font>');
}

function clear_div_content(class_name)
{
	$('.'+class_name).empty();
}
/*
function countCheckedArray(obj)
{
	var ids = new Array();
	
	if (obj.length)
	{
		for (var i = 0, length = obj.length; i < length; ++i)
		{
			if (obj[i].checked)
			{
				ids.push(obj[i].value);
			}
		}
	}
	else
	{
		jkbAlert(err, 'error');
		return;
	}
	return ids;
}
*/
jQuery(document).ready(function(){ 
	jQuery("#__dropmenu_nav_drop").mouseover(drop_open);
	jQuery("#__dropmenu_nav_drop").mouseout(drop_timer);	
	jQuery("#__dropmenu_nav_selector").mouseover(drop_canceltimer);
	jQuery("#__dropmenu_nav_selector").mouseout(drop_timer);
})