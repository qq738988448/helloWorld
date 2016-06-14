(function ($) {

  $.fn.datagridext = function (method) {

    // plugin's default options
    var defaults = {
      width:          '100%',
      height:         'auto',
      themeClass:     'fht-default',
      borderCollapse:  true,
      fixedColumns:    0, // fixed first columns
      fixedColumn:     false, // For backward-compatibility
      sortable:        true,
      autoShow:        true, // hide table after its created
      footer:          false, // show footer
      cloneHeadToFoot: false, // clone head and use as footer
      autoResize:      false, // resize table if its parent wrapper changes size
      create:          null, // callback after plugin completes
      multiSelect:     false,
      checkColumn:     false,
      selectItem:      [], 
      isSelectAll:     false,
      data:            {},
      url: window.location.href,
      fold: true,//默认折行
      queryParam:{},
      formatter:{
			float:function(v){
				if(!v && v!=0){
					return v;
				}
				 var s = v; //获取小数型数据
			     s += "";
			     if (s.indexOf(".") == -1) s += ".0"; //如果没有小数点，在后面补个小数点和0
			     if (/\.\d$/.test(s)) s += "0"; //正则判断
			     while (/\d{4}(\.|,)/.test(s)) //符合条件则进行替换
			         s = s.replace(/(\d)(\d{3}(\.|,))/, "$1,$2"); //每隔3位添加一个
			     return s;
			},
			date:function(v){
				var _date=v ? new Date(v).formate("yyyy-MM-dd") : 'N/A';
				return _date;
			},
			datetime:function(v){
				var _date=v ? new Date(v).formate("yyyy-MM-dd HH:mm") : 'N/A';
				return _date;
			},
			boolean:function(v){
				return typeof(v)=="boolean" ? (v?"是":"否") :"";
			}
		}, 
    };

    var settings = {};

    // public methods
    var methods = {
      init: function (options) {
        settings = $.extend({}, defaults, options);
        // console.log(this);
        // iterate through all the DOM elements we are attaching the plugin to
        return this.each(function () {
          var $self = $(this); // reference the jQuery version of the current DOM element
          try {
        	 // settings.data=JSON.parse(settings.data);
        	  methods.load(function(data){
        		  if(data.errorMessage && data.errorMessage.length>0){
            		  alert("数据加载失败，请重新刷新页面!");
            		  return;
            	  }
        		  settings.data=data;
        		  methods.rendTotable.call($self,settings.data);
        		  $self[0].settings=settings;
        		  if (helpers._isTable($self)) {
        	            methods.setup.apply($self, Array.prototype.slice.call(arguments, 1));
        	            $.isFunction(settings.create) && settings.create.call($self); 
        	      } else {
        	            $.error('Invalid table mark-up');
        	      }
        		  /*添加报表搜索*/
        		  methods.searchInfo.apply($self);
        		  /*合并报表第一列相同数据*/
        		  methods.mergeReport.apply($self);
        		  //行颜色        		  
        		  methods.colorInfo.apply($self);
    	          if( $self[0].settings.callBack){
    	        	  $self[0].settings.callBack();  
    	          }
        	  });
        	 } catch (e) {
        		 settings.data={};
        		 $self[0].settings=settings;
        	  alert("数据渲染出错,请刷新！");
        	 }
        	
          //settings.data=(settings.data && JSON.parse(settings.data))?JSON.parse(settings.data):{};
          
        });
      },

      /*
       * Setup table structure for fixed headers and optional footer
       */
      setup: function () {
        var $self       = $(this),
            self        = this,
            $thead      = $self.find('thead'),
            $tfoot      = $self.find('tfoot').length>0?$self.find('tfoot'): $self.closest(".fht-tbody").siblings(".fht-tfoot").find('tfoot'),
            tfootHeight = 0,
            $wrapper,
            $divHead,
            $divBody,
            $fixedBody,
            widthMinusScrollbar;
        if($.isEmptyObject(settings)){
        	settings =$self[0].settings;
        }
        settings.originalTable = $(this).clone(true);
        settings.includePadding = helpers._isPaddingIncludedWithWidth();
        settings.scrollbarOffset = helpers._getScrollbarWidth();
        settings.themeClassName = settings.themeClass;
        //添加checkbox列
        // if(settings.checkColumn){
        //   helpers._addCheckColumns($self);
        // }
        
        // helpers._columnsMenu();
        if (settings.width.search('%') > -1) {
            widthMinusScrollbar = $self.parent().width() - settings.scrollbarOffset;
        } else {
            widthMinusScrollbar = settings.width - settings.scrollbarOffset;
        }
        if(!settings.fold){
        	$self.css({
        		"white-space":"nowrap"
              });
        }
        $self.css({
          width: widthMinusScrollbar
        });

        helpers._pagelist($self,$tfoot);
        if (!$self.closest('.fht-table-wrapper').length) {
          $self.addClass('fht-table');
          $self.wrap('<div class="fht-table-wrapper"></div>');
        }

        $wrapper = $self.closest('.fht-table-wrapper');
//        console.log($wrapper.height());
//        return
        //添加遮罩层
        if(!$self.closest('.fht-table-wrapper').find(".datagridext-mask").length){
        	$("<div class=\"datagridext-mask\" ></div>").appendTo($wrapper);
            var msg=$("<div class=\"datagridext-mask-msg\" style=\"left:50%\"></div>").html("正在加载数据,请稍等...").appendTo($wrapper);
            msg.css("marginLeft",-msg.outerWidth()/2);
        }
        
        /*if(settings.checkColumn){
            settings.fixedColumns++;
        }*/
        if(settings.fixedColumn == true && settings.fixedColumns <= 0) {
          settings.fixedColumns = 1;
        }
        if (settings.fixedColumns > 0 && $wrapper.find('.fht-fixed-column').length == 0) {
          $self.wrap('<div class="fht-fixed-body"></div>');

          $('<div class="fht-fixed-column"></div>').prependTo($wrapper);

          $fixedBody    = $wrapper.find('.fht-fixed-body');
        }
        $divBody = $self.closest('.fht-tbody');
        //调整翻页时表格的高度
        if($divBody.length){
        	$self.css("height", settings.height);
        	$divBody.css("height", settings.height);
        }
       // return;
        $wrapper.css({
          width: settings.width,
          height: settings.height
        })
          .addClass(settings.themeClassName);
       
        if (!$self.hasClass('fht-table-init')) {
          $self.wrap('<div class="fht-tbody"></div>');
          $divBody = $self.closest('.fht-tbody');
        }

        var tableProps = helpers._getTableProps($self);

        helpers._setupClone($divBody, tableProps.tbody);

        if (!$self.hasClass('fht-table-init')) {
          if (settings.fixedColumns > 0) {
            $divHead = $('<div class="fht-thead"><table class="fht-table"></table></div>').prependTo($fixedBody);
          } else {
            $divHead = $('<div class="fht-thead"><table class="fht-table"></table></div>').prependTo($wrapper);
          }
          //设置复制的表头的宽度
          $divHead.find("table.fht-table").css({
        	  width: $self.width()+2
          });
          $divHead.find('table.fht-table').addClass(settings.originalTable.attr('class'));
          $thead.clone(true).appendTo($divHead.find('table'));
        } else {
          $divHead = $wrapper.find('div.fht-thead');
          //设置复制的表头的宽度
          $divHead.find("table.fht-table").css({
        	  width: $self.width()+2
          });
          //重新复制，确保表头的的一致
          $divHead.find('table').html($thead.clone(true));
        }

        helpers._setupClone($divHead, tableProps.thead,tableProps.theadParent);
        $self.css({
          'margin-top': -$divHead.outerHeight(true)
        });

        /*
         * Check for footer
         * Setup footer if present
         */
        if (settings.footer == true) {
          helpers._setupTableFooter($self, self, tableProps);

          if (!$tfoot.length) {
            $tfoot = $wrapper.find('div.fht-tfoot table');
          }

          tfootHeight = $tfoot.outerHeight(true);
        }
       
        //   var tbodyHeight = $wrapper.height() - $thead.outerHeight(true) - tfootHeight - tableProps.border;
      var tbodyHeight = $wrapper.clientHeight- $thead.height() - tfootHeight ;

        $divBody.css({
          'height': tbodyHeight
        });

        $self.addClass('fht-table-init');

        if (typeof(settings.altClass) !== 'undefined') {
          methods.altRows.apply(self);
        }

        if (settings.fixedColumns > 0) {
          helpers._setupFixedColumn($self, self, tableProps);
        }

        if (!settings.autoShow) {
          $wrapper.hide();
        }
        helpers._bindRowClick($divBody);
        helpers._bindScroll($divBody, tableProps);
        /*添加排序*/
        helpers._addColumnMenu.apply($self);
        return self;
      },

      /*
       * Resize the table
       * Incomplete - not implemented yet
       */
      resize: function() {
        var self  = this;
        return self;
      },

      /*
       * Add CSS class to alternating rows
       */
      altRows: function(arg1) {
        var $self = $(this),
        altClass  = (typeof(arg1) !== 'undefined') ? arg1 : settings.altClass;
        $self.closest('.fht-table-wrapper')
          .find('tbody tr:odd:not(:hidden)')
          .addClass(altClass);
      },
      //提交表单
      submitForm:function($obj){
        var $self = $(this),
            $data=$self[0].settings.data,
            $paramaters=$data.paramaters?$data.paramaters:[],
            _args=arguments,
            $wrap=$self.closest('.fht-table-wrapper');
            $wrap.find('.datagridext-mask').show();
            $wrap.find('.datagridext-mask-msg').show();
            if(_args.length>0){
              for(var _i=0,_max=_args.length;_i<_max;_i++){
                  if(typeof(_args[_i])=="object")
                    $paramaters.push(_args[_i]);
              }
            }
            // 创建Form
            var $_form = $('<form></form>');
            // 设置属性
            var $_action=window.location.href;
            $_form.attr('action', $_action);
            $_form.attr('method', 'post');
            // form的target属性决定form在哪个页面提交
            // _self -> 当前页面 _blank -> 新页面
            $_form.attr('target', '_self');
            // 创建Input
            $.each($paramaters,function(_i,_v){
                var $_my_input = $('<input type="text" name="'+_v.id+'" />');
                $_my_input.attr('value', _v.value?_v.value:'');
                // 附加到Form
                $_form.append($_my_input);  
            });
            // 提交表单
            $_form.submit();
      },
      //获取配置项
      getSettings:function(){
        var $self = this;
        return $self[0].settings.data;
      },
      // 获取选择的对象集合
      getSelectedRows:function(){
        var $self = $(this),
            $data=$self[0].settings.data.data,
            $_rows= $self.find('tbody tr.datagridext-row-selected'),
            _selctedRows=new Array(),
            _index=0;
	      //如果json解析失败返回
	        if(!$data){
	        	alert("数据渲染出错！");
	        	return {};
	        }
	        	
            $.each($_rows,function(_i,_v){
                _index=$(_v).attr("datagrid-row-index");
                _selctedRows.push($data[_index]);
            });
            return _selctedRows;
      },
      //全选or取消全选
      checkAll:function(){
    	  var $self   = $(this),
    	  	  $divBody = $self.closest('.fht-tbody');
    	  //console.log($divBody);
    	  helpers._checkAll($divBody);
      },
      /*
       * Show a hidden fixedHeaderTable table
       */
      show: function(arg1, arg2, arg3) {
        var $self   = $(this),
            self      = this,
            $wrapper  = $self.closest('.fht-table-wrapper');

        // User provided show duration without a specific effect
        if (typeof(arg1) !== 'undefined' && typeof(arg1) === 'number') {
          $wrapper.show(arg1, function() {
            $.isFunction(arg2) && arg2.call(this);
          });

          return self;

        } else if (typeof(arg1) !== 'undefined' && typeof(arg1) === 'string' &&
          typeof(arg2) !== 'undefined' && typeof(arg2) === 'number') {
          // User provided show duration with an effect

          $wrapper.show(arg1, arg2, function() {
            $.isFunction(arg3) && arg3.call(this);
          });

          return self;

        }

        $self.closest('.fht-table-wrapper')
          .show();
        $.isFunction(arg1) && arg1.call(this);

        return self;
      },

      /*
       * Hide a fixedHeaderTable table
       */
      hide: function(arg1, arg2, arg3) {
        var $self     = $(this),
            self    = this,
            $wrapper  = $self.closest('.fht-table-wrapper');

        // User provided show duration without a specific effect
        if (typeof(arg1) !== 'undefined' && typeof(arg1) === 'number') {
          $wrapper.hide(arg1, function() {
            $.isFunction(arg3) && arg3.call(this);
          });

          return self;
        } else if (typeof(arg1) !== 'undefined' && typeof(arg1) === 'string' &&
          typeof(arg2) !== 'undefined' && typeof(arg2) === 'number') {

          $wrapper.hide(arg1, arg2, function() {
            $.isFunction(arg3) && arg3.call(this);
          });

          return self;
        }

        $self.closest('.fht-table-wrapper')
          .hide();

        $.isFunction(arg3) && arg3.call(this);



        return self;
      },

      /*
       * Destory fixedHeaderTable and return table to original state
       */
      destroy: function() {
        var $self    = $(this),
            self     = this,
            $wrapper = $self.closest('.fht-table-wrapper');

        $self.insertBefore($wrapper)
          .removeAttr('style')
          .append($wrapper.find('tfoot'))
          .removeClass('fht-table fht-table-init')
          .find('.fht-cell')
          .remove();

        $wrapper.remove();

        return self;
      },
    //加载数据
      load:function(callback){
        var  $paramaters=[];
        $paramaters=settings.queryParam?settings.queryParam:[];
        var _users = ["linzhiwei",
                      "luweijun",
                      "zengpeijun",
                      "wangjie01",
                      "gemeng",
                      "lifengjiao",
                      "weidongxia",
                      "shengwenjie",
                      "liaochen",
                      "zhengkuncheng",
                      "duxiuai"
                      ];
        var _user = $("#all_user_name").val();
        for(var i = 0 ;i < _users.length;i++){
        	var user = _users[i];
        	if(user==_user){
        		console.log("实习生");
        		$paramaters = {"status":"LEND_REJECTED"};
        		break;
        	}
        }
          var _args=arguments;
          //var  $wrap=$self.closest('.fht-table-wrapper');
            $('.datagridext-masks').show();
            $('.datagridext-mask-msgs').show();
            if(_args.length>0){
              for(var _i=0,_max=_args.length;_i<_max;_i++){
                  if(typeof(_args[_i])=="object")
                    $paramaters.push(_args[_i]);
              }
            }
           // var $_action=window.location.href;
            $.ajax({
            	url: settings.url,
            	type:"POST",
            	//async:false,
            	dataType:"json",
            	data:$paramaters,
            	success:function(result){
            		callback(result);
            	},
            	error:function(XMLHttpRequest){
            		alert("数据加载失败，请重新刷新页面!");
            	},
            	complete:function(){
            		 $('.datagridext-masks').hide();
                     $('.datagridext-mask-msgs').hide();
            	}
            	
            });
      },
      reload:function(){
    	  	var $self = $(this);
    	  	var  $wrap=$self.closest('.fht-table-wrapper');
              $wrap.find('.datagridext-mask').show();
              $wrap.find('.datagridext-mask-msg').show();
              console.log("////////////////")
              //var $_action=window.location.href;
              $.ajax({
            	url: $self[0].settings.url,
              	type:"POST",
              	dataType:"json",
              	data:$self[0].settings.queryParam,
              	success:function(result){
              		 if(result.errorMessage && result.errorMessage.length>0){
               		  alert("数据加载失败，请重新刷新页面!");
               		  return;
               	  }
              		
              		methods.rendTotable.call($self,result);
              		$self[0].settings.data=result;
              		methods.setup.apply($self);
//              		$(".fht-tfoot ul li[class='active']").removeClass("active");
//              		$(".fht-tfoot ul li[pageno='"+result.pageModel.page+"']").addClass("active");
              	  if( $self[0].settings.callBack){
                	  $self[0].settings.callBack();  
                  }
              	  /*合并报表第一列相同数据*/
        		  methods.mergeReport.apply($self);
        		  //行颜色        		  
        		  methods.colorInfo.apply($self);
              	},
              	error:function(XMLHttpRequest){
              		alert("数据加载失败，请重新刷新页面!");
              	},
              	complete:function(){
              		$wrap.find('.datagridext-mask').hide();
                    $wrap.find('.datagridext-mask-msg').hide();
              	}
              });
        },
      rendTotable:function(data){
    	  if(data.errorMessage && data.errorMessage.length>0){
    		  alert("数据加载失败，请重新刷新页面!");
    		  return;
    	  }    	 
    	  var $self   = $($(this)[0]);
    	 // $self[0].settings.data =data;
    	  var _column = data.columnShows;
    	  var _str ="<tr>";
    	  var _str2 ="<tr>";
    	  for(var i =0;i<_column.length;i++){
    		  if(!_column[i].parentColumn){    			
      			_str+="<th rowSpan='2'>"+_column[i].name +"</th>";
      		  }else{
      			_str+="<th parentColumn="+_column[i].parentColumn+">"+_column[i].parentColumn+"</th>" ;
      			_str2+="<th>"+_column[i].name+"</th>";
      		  }
    	  }    	  
    	  _str+="</tr>";
    	  _str2+="</tr>";
    	 // $(".fht-thead table").find("thead").html(_str);
    	  $self.find("thead").html(_str); 
    	  if($self.find("thead th[parentColumn]").length>0){
    		  $self.find("thead").append(_str2);  
	    	  var str_obj=[],
	    	  	  th_wid=$self.find("thead th[parentColumn]").width();
	    	  for(var i =0;i< $self.find("thead th[parentColumn]").length;i++){	    		  
	    		  var str_group=$self.find("thead th[parentColumn]").eq(i).attr("parentColumn");
	    		  str_obj.push(str_group);
	    	  }   
	    	  helpers._titleGroup.call($self,str_obj);   	   
    	  }else{
    		  $self.find("thead th").attr("rowSpan","1") ;  
    	  }
    	  var _str_data ="",_data = data.data;
    	  var key;
    	  for(var i = 0;i<_data.length;i++){
    		  _str_data +="<tr class='datagridext-row' datagrid-row-index='"+i+"'>";
    		  for(var j =0;j<_column.length;j++){
    			  key = _column[j].key;
    			  _str_data+="<td class='datagridext-cell-"+key+"'>"+methods.dataFormat(_column[j].type,_data[i][key])+"</td>";
    		  }
    		  _str_data+="</tr>";
    	  }
    	  $self.find("tbody").html(_str_data);
    	  methods.buildChart(data);    	  
      },
       dataFormat:function(type,value){
    	   switch(type){
    	   case 0://字符串
    		   if(!value){
				return "--";
    		   }
    		   if(value.length>15){
    			   return value.substring(0,15)+"...";
    		   }
    		   return value;
			case 1://浮点
				if(value==null || value==""){
						return "--";
		    	}
				return defaults.formatter.float(value);
			break;
			case 2://整数
				 if(value==null){
						return "--";
		    	}
				 return value;
				break;
			case 3://比例
				return defaults.formatter.float(value);
			break;
			case 4://日期
				return defaults.formatter.datetime(value);
			break;
			case 5:
				return defaults.formatter.date(value);
			break;
			case 6://boolean
				return defaults.formatter.boolean(value);
			break;
			default:
				return value;
		}
       },
       addParam:function(){
    	   $self=$(this);
    	   var _args=arguments;
    	   if(typeof(_args[0])=="string" && typeof(_args[1])=="string"){
    		   $self[0].settings.queryParam[_args[0]]=_args[1];
    	   }
       },
       delParam:function(){
    	   $self=$(this);
    	   var _args=arguments;
    	   if(typeof $self[0].settings.queryParam[_args[0]] !="undefined"){
    		   $self[0].settings.queryParam[_args[0]] = null;
    	   }
       },
       clearParam:function(){
   	   $self=$(this);
   	   $self[0].settings.queryParam={};
//    	   for(var name in $self[0].settings.queryParam){
//    		   if(name !="page" && name!="size" && name!="sort" && name!="order"){
//    			   $self[0].settings.queryParam[name]=null;
//    		   }
//    	   }
       },
       //生成图标
       buildChart:function(data){
    	if(!data.chart){
    		$("#report_chart").css("display","none");
    		return;
    	}   
    	$("#report_chart").css("display","");
    	if(data.chart.type==1){
    		methods.buildPieChart(data.chart);
    	}
       },
       //生成饼图
       buildPieChart:function(c){
    	   var data=[];
    	   if(c.chartDatas ){
    		   var d = c.chartDatas
    		   for(var i in d){
    			   if(d[i].seriesName  && d[i].value){
    				   data.push([d[i].seriesName,d[i].value]); 
    			   }
    			   
    		   }
    	   }
    	   $('#report_chart').highcharts({
    	        chart: {
    	            plotBackgroundColor: null,
    	            plotBorderWidth: null,
    	            plotShadow: false
    	        },
    	        title: {
    	            text: c.desc
    	        },
    	        tooltip: {
    	    	    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
    	        },
    	        plotOptions: {
    	            pie: {
    	                allowPointSelect: true,
    	                cursor: 'pointer',
    	                dataLabels: {
    	                    enabled: true,
    	                    color: '#000000',
    	                    connectorColor: '#000000',
    	                    format: '<b>{point.name}</b>: {point.percentage:.1f} %'
    	                }
    	            }
    	        },
    	        series: [{
    	            type: 'pie',
    	            name: c.name,
    	            data:d
    	        }]
    	    }); 
       },
     //行颜色
       colorInfo:function(){
    	    if(!$("#_serach").length){
       		  return;
       	    }
    	     $("table tr:even").addClass("active");	 
    		 $("table tr:first").removeClass("active");	 
    		 $("#sheet").width($(window).width()-33);
       },
       //合并报表第一列相同元素
       mergeReport:function(){
    	   if(!$("#_serach").length){
      		  return;
      	  }
    	   var trlen=$(".fht-tbody tbody tr").length,rownum=[];    	  
    		for(var i=0;i<trlen;i++){
    			var tdhtml=$(".fht-tbody tbody tr").eq(i).find("td:first").html(),obj=[];   			
				for(var j=i+1;j<trlen;j++){
					var nexthtml=$(".fht-tbody tbody tr").eq(i).next("tr").find("td:first").html();
					if(tdhtml==nexthtml){
						var identical=$(".fht-tbody tbody tr").eq(j).find("td:first").html(); 	
						if(tdhtml==identical){ 							
							obj.push(j);
						}
					}				
				}
    			var objlen=obj.length;
    			if(objlen!=0){
    				$(".fht-tbody tbody tr").eq(obj[0]-1).find("td:first").attr("rowspan",objlen+1);
    			}    			
    			for(var a=0;a<objlen;a++){    				
    				rownum.push(obj[a]);
    			} 	
    			
    		}
     		var result = [], hash = {};
 		    for (var i = 0, elem; (elem = rownum[i]) != null; i++) {
 		        if (!hash[elem]) {
 		            result.push(elem);
		            hash[elem] = true;
 		        }
 		    }
    		for(var b=0;b<result.length;b++){				
				$(".fht-tbody tbody tr").eq(result[b]).find("td:first").remove();
			} 
       },
       //添加报表搜索条件
       searchInfo:function(){
     	  if(!$("#_serach").length){
     		  return;
     	  }
     	  var $self=$(this);  
     	  $("#reportName").html(settings.data.name);
     	  $("#reportExp").css("display","");
     	  if(!$("#_serach input[name='reportId']").length){
     		  $("#_serach").append("<input name='reportId' type='hidden'value='"+$("#_report_id").val()+"'></input>");
     	  }else{
     		 $("#_serach input[name='reportId']").val($("#_report_id").val());
     	  }
     	  $(".report_export,.submitbtn,hr,.btnclear").show();
     	  $("#_serach div:first").html("");
     	  for(var i=0;j=settings.data.paramaters.length,i<j;i++){     		  
     		  switch (settings.data.paramaters[i].type){
     		  case "date":    		  		
     		  		var _date="<div class='col-sm-2'><input type='text' class='form-control datepicker' name="+settings.data.paramaters[i].id+" value='' placeholder="+settings.data.paramaters[i].name+" readonly='readonly'></div>"
     		  		$("#_serach div:first").append(_date);
     		  		$(".datepicker").datepicker({
     		 			dateFormat:'yy-mm-dd'
     		 	    });
     		  		break;
     		  case "multiselect":
     			  var _multiselect="<div class='col-sm-2 select_Multiple'><select name="+settings.data.paramaters[i].id+" multiple='multiple resize' class='multiselect "+settings.data.paramaters[i].id+"'>";
     			  for(var n=0;n<settings.data.paramaters[i].listValue.length;n++){    				  
     				  _multiselect+="<option value="+settings.data.paramaters[i].listValue[n][0]+">"+settings.data.paramaters[i].listValue[n][1]+"</option>";
     			  }
     			  _multiselect+="</select></div>";
     			  $("#_serach div:first").append(_multiselect);
     			  $("."+settings.data.paramaters[i].id).multiselect({
     					noneSelectedText: settings.data.paramaters[i].name,
     					minWidth: 180
     			  });
     			  break;
     		  case"groupselect":
     			  var obj=[],result = [], hash = {},
     			  	  _groupselect="<div class='col-sm-2 select_Multiple'><select name="+settings.data.paramaters[i].id+" multiple='multiple resize' class='multiselect "+settings.data.paramaters[i].id+"'>";
     			  for(var n=0;n<settings.data.paramaters[i].listValue.length;n++){   
     				  obj.push(settings.data.paramaters[i].listValue[n][2]);
     			  }    			  
     			  for (var m = 0, elem; (elem = obj[m]) != null; m++) {
   			        if (!hash[elem]) {
   			            result.push(elem);
   			            hash[elem] = true;
   			        }
   			      }    			  
     			  for(var b=0;b<result.length;b++){  
     				  _groupselect+="<optgroup label="+result[b]+">";
     				  for(var a=0;a<settings.data.paramaters[i].listValue.length;a++){   
         				 if(settings.data.paramaters[i].listValue[a][2]===result[b]){
         					 _groupselect+="<option value="+settings.data.paramaters[i].listValue[a][0]+">"+settings.data.paramaters[i].listValue[a][1]+"</option>";
         				 }
         			  }
     				  _groupselect+="</optgroup>";
 				  }    			  
     			  _groupselect+="</select></div>";
     			 // console.log(_groupselect);
     			  $("#_serach div:first").append(_groupselect);
     			  $("."+settings.data.paramaters[i].id).multiselect({
     					noneSelectedText: settings.data.paramaters[i].name,
     					minWidth: 180
     			  });
     			  $("li.ui-multiselect-optgroup-label").siblings("li.toggle-hide").hide();	
     			  break;
     		  }
     	  };
       },
       bulidLineEchart:function(c){
    	   $("#report_chart").css({'height':500,'width':1200,'margin': 'auto'});
    	   var myChart = echarts.init(document.getElementById('report_chart'));
    	   var legend =[];
    	   var d = c.chartDatas;
    	   var data=[];
    	   for(var i in d){
    		   legend.push(d[i].seriesName);
			   if(d[i].seriesName  && d[i].value){
				   
				   data.push({'name':d[i].seriesName,'value':d[i].value}); 
			   }
    	   }
    	   console.log(data);
    	   var option = {
    			    title : {
    			        text: '未来一周气温变化',
    			        subtext: '纯属虚构'
    			    },
    			    tooltip : {
    			        trigger: 'axis'
    			    },
    			    legend: {
    			        data:['最高气温','最低气温']
    			    },
    			    toolbox: {
    			        show : true,
    			        feature : {
    			            mark : {show: true},
    			            dataView : {show: true, readOnly: false},
    			            magicType : {show: true, type: ['line', 'bar']},
    			            restore : {show: true},
    			            saveAsImage : {show: true}
    			        }
    			    },
    			    calculable : true,
    			    xAxis : [
    			        {
    			            type : 'category',
    			            boundaryGap : false,
    			            data : ['周一','周二','周三','周四','周五','周六','周日']
    			        }
    			    ],
    			    yAxis : [
    			        {
    			            type : 'value',
    			            axisLabel : {
    			                formatter: '{value} °C'
    			            }
    			        }
    			    ],
    			    series : [
    			        {
    			            name:'最高气温',
    			            type:'line',
    			            data:[11, 11, 15, 13, 12, 13, 10],
    			            markPoint : {
    			                data : [
    			                    {type : 'max', name: '最大值'},
    			                    {type : 'min', name: '最小值'}
    			                ]
    			            },
    			            markLine : {
    			                data : [
    			                    {type : 'average', name: '平均值'}
    			                ]
    			            }
    			        },
    			        {
    			            name:'最低气温',
    			            type:'line',
    			            data:[1, -2, 2, 5, 3, 2, 0],
    			            markPoint : {
    			                data : [
    			                    {name : '周最低', value : -2, xAxis: 1, yAxis: -1.5}
    			                ]
    			            },
    			            markLine : {
    			                data : [
    			                    {type : 'average', name : '平均值'}
    			                ]
    			            }
    			        }
    			    ]
    			};
    	   myChart.setOption(option);
       }
       ,
       //生成饼图
       buildPieEchart:function(c){
    	   $("#report_chart").css({'height':500,'width':1200,'margin': 'auto'});
    	   var myChart = echarts.init(document.getElementById('report_chart'));
    	   var legend =[];
    	   var d = c.chartDatas;
    	   var data=[];
    	   for(var i in d){
    		   legend.push(d[i].seriesName);
			   if(d[i].seriesName  && d[i].value){
				   
				   data.push({'name':d[i].seriesName,'value':d[i].value}); 
			   }
    	   }
    	   var option = {
    			    title : {
    			        text: c.desc,
    			        x:'center'
    			    },
    			    tooltip : {
    			        trigger: 'item',
    			        formatter: "{a} <br/>{b} : {c} ({d}%)",
    			        borderWidth:4
    			    },
    			    legend: {
    			        orient : 'vertical',
    			        x : 'left',
    			        data:legend
    			    },
    			    toolbox: {
    			        show : true,
    			        feature : {
    			            mark : true,
    			            dataView : {readOnly: false},
    			            restore : true,
    			            saveAsImage : true
    			        }
    			    },
    			    calculable : true,
    			    series : [
    			        {	
    			        	name:c.name,
    			            type:'pie',
    			            radius : '55%',
    			            center: ['50%', 225],
    			            data:data
    			        }
    			    ]
    			};
    	   myChart.setOption(option);		     
       }
    };

    // private methods
    var helpers = {

      /*
       * return boolean
       * True if a thead and tbody exist.
       */
      _isTable: function($obj) {
        var $self = $obj,
            hasTable = $self.is('table'),
            hasThead = $self.find('thead').length > 0,
            hasTbody = $self.find('tbody').length > 0;

        if (hasTable && hasThead && hasTbody) {
          return true;
        }

        return false;

      },
      /*
       * return void
       * bind rowclick event
       */
       _bindRowClick:function($obj){
          var _multiSelect=settings.multiSelect;
          var $self=$obj.find("tbody").children();
          $self.bind('click',function(){
              var _index=$(this).attr("datagrid-row-index");
              if($(this).hasClass("datagridext-row-selected")){
                 $(this).removeClass( "datagridext-row-selected");
              }else{
                  if(!_multiSelect)
                      $self.removeClass("datagridext-row-selected");
                  $(this).addClass("datagridext-row-selected");
              }
          });
       },
       _checkAll:function($obj){
             var _multiSelect=settings.multiSelect;
             //if(!_multiSelect) return;
             var $self=$obj.find("tbody").children();
             var $selecteds=$obj.find(".datagridext-row-selected");
             $selecteds.length>0 ? $self.removeClass("datagridext-row-selected") : $self.addClass("datagridext-row-selected");
             
          },
      /*
       * return void
       * bind scroll event
       */
      _bindScroll: function($obj) {
        var $self = $obj,
            $wrapper = $self.closest('.fht-table-wrapper'),
            $thead = $self.siblings('.fht-thead'),
            $tfoot = $self.siblings('.fht-tfoot');

        $self.bind('scroll', function() {
          if (settings.fixedColumns > 0) {
            var $fixedColumns = $wrapper.find('.fht-fixed-column');

            $fixedColumns.find('.fht-tbody table')
              .css({
                  'margin-top': -$self.scrollTop()
              });
          }

          $thead.find('table')
            .css({
              'margin-left': -this.scrollLeft
            });

          if (settings.footer || settings.cloneHeadToFoot) {
            $tfoot.find('table')
              .css({
                'margin-left': -this.scrollLeft
              });
          }
        });
      },

      /*
       * return void
       */
      _fixHeightWithCss: function ($obj, tableProps) {
        if (settings.includePadding) {
          $obj.css({
            'height': $obj.height() + tableProps.border
          });
        } else {
          $obj.css({
            'height': $obj.parent().height() + tableProps.border
          });
        }
      },

      /*
       * return void
       */
      _fixWidthWithCss: function($obj, tableProps, width) {
        if (settings.includePadding) {
          $obj.each(function() {
            $(this).css({
              'width': width == undefined ? $(this).width() + tableProps.border : width + tableProps.border
            });
          });
        } else {
          $obj.each(function() {
            $(this).css({
              'width': width == undefined ? $(this).parent().width() + tableProps.border : width + tableProps.border
            });
          });
        }

      },

      /*
       * return void
       */
      _setupFixedColumn: function ($obj, obj, tableProps) {
        var $self             = $obj,
            $wrapper          = $self.closest('.fht-table-wrapper'),
            $fixedBody        = $wrapper.find('.fht-fixed-body'),
            $fixedColumn      = $wrapper.find('.fht-fixed-column'),
            $thead            = $('<div class="fht-thead"><table class="fht-table"><thead><tr></tr></thead></table></div>'),
            $tbody            = $('<div class="fht-tbody"><table class="fht-table"><tbody></tbody></table></div>'),
            $tfoot            = $('<div class="fht-tfoot"><table class="fht-table"><tfoot><tr></tr></tfoot></table></div>'),
            fixedBodyWidth    = $wrapper.width(),
            fixedBodyHeight   = $fixedBody.find('.fht-tbody').height() - settings.scrollbarOffset,
            $firstThChildren,
            $firstTdChildren,
            fixedColumnWidth,
            $newRow,
            firstTdChildrenSelector;

        $thead.find('table.fht-table').addClass(settings.originalTable.attr('class'));
        $tbody.find('table.fht-table').addClass(settings.originalTable.attr('class'));
        $tfoot.find('table.fht-table').addClass(settings.originalTable.attr('class'));

        $firstThChildren = $fixedBody.find('.fht-thead thead tr > *:lt(' + settings.fixedColumns + ')');
        fixedColumnWidth = settings.fixedColumns * tableProps.border;
        $firstThChildren.each(function() {
          fixedColumnWidth += $(this).outerWidth(true);
        });

        // Fix cell heights
        helpers._fixHeightWithCss($firstThChildren, tableProps);
        helpers._fixWidthWithCss($firstThChildren, tableProps);

        var tdWidths = [];
        $firstThChildren.each(function() {
          tdWidths.push($(this).width());
        });

        firstTdChildrenSelector = 'tbody tr > *:not(:nth-child(n+' + (settings.fixedColumns + 1) + '))';
        $firstTdChildren = $fixedBody.find(firstTdChildrenSelector)
          .each(function(index) {
            helpers._fixHeightWithCss($(this), tableProps);
            helpers._fixWidthWithCss($(this), tableProps, tdWidths[index % settings.fixedColumns] );
          });

        // clone header
        $thead.appendTo($fixedColumn)
          .find('tr')
          .append($firstThChildren.clone(true));

        $tbody.appendTo($fixedColumn)
          .css({
            'margin-top': -1,
            'height': fixedBodyHeight + tableProps.border
          });
        $firstTdChildren.each(function(index) {
          if (index % settings.fixedColumns == 0) {
            $newRow = $('<tr class="datagridext-row"></tr>').appendTo($tbody.find('tbody'));
            $newRow.attr("datagrid-row-index",$(this).closest("tr").attr("datagrid-row-index"));
            if (settings.altClass && $(this).parent().hasClass(settings.altClass)) {
              $newRow.addClass(settings.altClass);
            }
          }
          $(this).clone(true)
            .appendTo($newRow);
        });
        // set width of fixed column wrapper
        $fixedColumn.css({
          'height': 0,
          'width': fixedColumnWidth
        });


        // bind mousewheel events
        var maxTop = $fixedColumn.find('.fht-tbody .fht-table').height() - $fixedColumn.find('.fht-tbody').height();
        $fixedColumn.find('.fht-table').bind('mousewheel', function(event, delta, deltaX, deltaY) {
          if (deltaY == 0) {
            return;
          }
          var top = parseInt($(this).css('marginTop'), 10) + (deltaY > 0 ? 120 : -120);
          if (top > 0) {
            top = 0;
          }
          if (top < -maxTop) {
            top = -maxTop;
          }
          $(this).css('marginTop', top);
          $fixedBody.find('.fht-tbody').scrollTop(-top).scroll();
          return false;
        });


        // set width of body table wrapper
        $fixedBody.css({
          'width': fixedBodyWidth
        });

        // setup clone footer with fixed column
        if (settings.footer == true || settings.cloneHeadToFoot == true) {
          var $firstTdFootChild = $fixedBody.find('.fht-tfoot tr > *:lt(' + settings.fixedColumns + ')'),
              footwidth;

          helpers._fixHeightWithCss($firstTdFootChild, tableProps);
          $tfoot.appendTo($fixedColumn)
            .find('tr')
            .append($firstTdFootChild.clone(true));
          // Set (view width) of $tfoot div to width of table (this accounts for footers with a colspan)
          footwidth = $tfoot.find('table').innerWidth();
          $tfoot.css({
            'top': settings.scrollbarOffset,
            'width': footwidth
          });
        }
      },

      /*
       * return void
       */
      _setupTableFooter: function ($obj, obj, tableProps) {
        var $self     = $obj,
            $wrapper  = $self.closest('.fht-table-wrapper'),
            $tfoot    = $self.find('tfoot'),
            $divFoot  = $wrapper.find('div.fht-tfoot');

        if (!$divFoot.length) {
          if (settings.fixedColumns > 0) {
            $divFoot = $('<div class="fht-tfoot"><table class="fht-table"></table></div>').appendTo($wrapper.find('.fht-fixed-body'));
          } else {
            $divFoot = $('<div class="fht-tfoot"><table class="fht-table"></table></div>').appendTo($wrapper);
          }
        }
        $divFoot.find('table.fht-table').addClass(settings.originalTable.attr('class'));

        switch (true) {
          case !$tfoot.length && settings.cloneHeadToFoot == true && settings.footer == true:

            var $divHead = $wrapper.find('div.fht-thead');

            $divFoot.empty();
            $divHead.find('table')
              .clone(true)
              .appendTo($divFoot);

            break;
          case $tfoot.length && settings.cloneHeadToFoot == false && settings.footer == true:

            $divFoot.find('table')
              .append($tfoot)
              .css({
                'margin-top': -tableProps.border
              });

            helpers._setupClone($divFoot, tableProps.tfoot);

            break;
        }

      },

      /*
       * return object
       * Widths of each thead cell and tbody cell for the first rows.
       * Used in fixing widths for the fixed header and optional footer.
       */
      _getTableProps: function($obj) {
        var tableProp = {
              thead: {},
              tbody: {},
              tfoot: {},
              border: 0,
              theadParent:{},
            },
            borderCollapse = 1;

        if (settings.borderCollapse == true) {
          borderCollapse = 2;
        }

        tableProp.border = ($obj.find('th:first-child').outerWidth() - $obj.find('th:first-child').innerWidth()) / borderCollapse;

        var _columnShows = $obj[0].settings.data.columnShows;
//      var $obj = $(''),
//      newWith;
//  $obj.addClass(settings.originalTable.attr('class'));
//  $obj.appendTo('body');
//  newWith = $obj.height();
//  $obj.remove(); 
        $obj.find('thead tr:first-child > *').each(function(index) {
        	var _str =$("<span>"+ _columnShows[index].name+"</span>");
        	_str.appendTo("body");
        	var _with = _str.width();
        	_str.remove();
         	if(_columnShows[index].order || _columnShows[index].filterType){
         		if((_with+23)>($(this).width() +8*2)){
         //			if((_with+23)>($(this).width() + tableProp.border*2+8*2)){
            		//紧凑版
//            		tableProp.thead[index] =_with+15-tableProp.border;
//            		tableProp.tbody[index] = _with+15-tableProp.border;
            		tableProp.thead[index] =_with+25;
            		tableProp.tbody[index] = _with+25;
            	}else{
            		tableProp.thead[index] = $(this).width() + tableProp.border;
                 	tableProp.tbody[index] = $(this).width() + tableProp.border;
            	}
         	}else{
         		tableProp.thead[index] = $(this).width() + tableProp.border;
         		tableProp.tbody[index] = $(this).width() + tableProp.border;
         	}
        
         	
        });
        $obj.find('tfoot tr:first-child > *').each(function(index) {
        		tableProp.tfoot[index] = $(this).width() + tableProp.border;
        });
        $obj.find('thead tr:eq(1) > *').each(function(index) {
    		tableProp.theadParent[index] = $(this).width() + tableProp.border;
        });
//        $obj.find('tbody tr:first-child > *').each(function(index) {
//        	if(_columnShows[index].order || _columnShows[index].filterType){
//         		tableProp.tbody[index] = $(this).width() + tableProp.border+23;
//         	}else{
//         		tableProp.tbody[index] = $(this).width() + tableProp.border;
//         	}
//        	tableProp.tbody[index] = $(this).width() + tableProp.border;
//        });
        return tableProp;
      },
      /*
       * return void
       * 添加checkbox列到最前面.
       */
       _addCheckColumns:function($obj){
          var $self    = $obj,
              $thead   = $self.find('thead'),
              $tbody   = $self.find('tbody'),
              $trs=$self.find("tr :first-child");
              $trs.before('<td field="ck"><input type="checkbox" name="ck" value=""></td>');
              $thead.find("input[type='checkbox']").bind("click",function(e){
                 var _ischeck=$(this).is(":checked"),
                    _rows=$tbody.children(),
                    _crows=$(this).closest(".fht-thead").next(".fht-tbody").find("tbody").children(),
                    _checks=$tbody.find("input[type='checkbox']");
                    _checks.attr("checked", _ischeck);
                    _crows.find("input[type='checkbox']").attr("checked", _ischeck);
                    if(_ischeck){
                      _rows.addClass("datagridext-row-selected");
                      _crows.addClass("datagridext-row-selected");
                    }else{
                      _rows.removeClass("datagridext-row-selected");
                      _crows.removeClass("datagridext-row-selected");
                    }
                e.stopPropagation();
          });
          // console.log($tbody.find("input[type='checkbox']"));
          $tbody.find("input[type='checkbox']").bind("click",function(e){
                var _ischeck=$(this).is(":checked"),
                    _curRow=$(this).closest("tr"),
                    _index=_curRow.attr("datagrid-row-index"),
                    _row=$obj.find("[datagrid-row-index="+_index+"]");

                if(_ischeck){
                   _row.addClass("datagridext-row-selected");
                   _curRow.addClass("datagridext-row-selected");
                }else{
                  _row.removeClass("datagridext-row-selected");
                   _curRow.removeClass("datagridext-row-selected");
                }
                e.stopPropagation();
          });

       },
       /*
       * return void
       * 设置选择不选择.
       */
       _selectRow:function($index,$bool){

       },
      /*
       * return void
       * Fix widths of each cell in the first row of obj.
       */
      _setupClone: function($obj, cellArray,theadParent) {
        var $self    = $obj,
            selector = ($self.find('thead').length) ?
              'thead tr:first-child > *' :
              ($self.find('tfoot').length) ?
              'tfoot tr:first-child > *' :
              'tbody tr:first-child > *',
            $cell;
        $self.find(selector).each(function(index) {
          $cell = ($(this).find('div.fht-cell').length) ? $(this).find('div.fht-cell') : $('<div class="fht-cell"></div>').appendTo($(this));

          $cell.css({
            'width': parseInt(cellArray[index], 10)
          });

          /*
           * Fixed Header and Footer should extend the full width
           * to align with the scrollbar of the body
           */
          if (!$(this).closest('.fht-tbody').length && $(this).is(':last-child') && !$(this).closest('.fht-fixed-column').length) {
            var padding = Math.max((($(this).innerWidth() - $(this).width()) / 2), settings.scrollbarOffset);
            $(this).css({
                'padding-right': padding + 'px'
            });
          }
        });
          if($self.find('thead').length && theadParent){
        	  selector =  'thead tr:eq(1) > *' ;
        	  $self.find(selector).each(function(index) {
                  $cell = ($(this).find('div.fht-cell').length) ? $(this).find('div.fht-cell') : $('<div class="fht-cell"></div>').appendTo($(this));

                  $cell.css({
                    'width': parseInt(theadParent[index], 10)
                  });

                  /*
                   * Fixed Header and Footer should extend the full width
                   * to align with the scrollbar of the body
                   */
                  if (!$(this).closest('.fht-tbody').length && $(this).is(':last-child') && !$(this).closest('.fht-fixed-column').length) {
                    var padding = Math.max((($(this).innerWidth() - $(this).width()) / 2), settings.scrollbarOffset);
                    $(this).css({
                        'padding-right': padding + 'px'
                    });
                  }
          });
          }
      },

      /*
       * return boolean
       * Determine how the browser calculates fixed widths with padding for tables
       * true if width = padding + width
       * false if width = width
       */
      _isPaddingIncludedWithWidth: function() {
        var $obj = $('<table class="fht-table"><tr><td style="padding: 10px; font-size: 10px;">test</td></tr></table>'),
            defaultHeight,
            newHeight;

        $obj.addClass(settings.originalTable.attr('class'));
        $obj.appendTo('body');

        defaultHeight = $obj.find('td').height();

        $obj.find('td')
          .css('height', $obj.find('tr').height());

        newHeight = $obj.find('td').height();
        $obj.remove();

        if (defaultHeight != newHeight) {
          return true;
        } else {
          return false;
        }

      },

      /*
       * return int
       * get the width of the browsers scroll bar
       */
      _getScrollbarWidth: function() {
        var scrollbarWidth = 0;

        if (!scrollbarWidth) {
          if (/msie/.test(navigator.userAgent.toLowerCase())) {
            var $textarea1 = $('<textarea cols="10" rows="2"></textarea>')
                  .css({ position: 'absolute', top: -1000, left: -1000 }).appendTo('body'),
                $textarea2 = $('<textarea cols="10" rows="2" style="overflow: hidden;"></textarea>')
                  .css({ position: 'absolute', top: -1000, left: -1000 }).appendTo('body');

            scrollbarWidth = $textarea1.width() - $textarea2.width() + 2; // + 2 for border offset
            $textarea1.add($textarea2).remove();
          } else {
            var $div = $('<div />')
                  .css({ width: 100, height: 100, overflow: 'auto', position: 'absolute', top: -1000, left: -1000 })
                  .prependTo('body').append('<div />').find('div')
                  .css({ width: '100%', height: 200 });

            scrollbarWidth = 100 - $div.width();
            $div.parent().remove();
          }
        }

        return scrollbarWidth;
      },
      /*添加排序*/
      _addColumnMenu:function(){
    	  var $self=$(this);
    	  $(".fht-thead table tr th").css("position","relative");    	 
    	  for(var i=0;j=settings.data.columnShows.length,i<j;i++){  
    		 var _tpl=$('.fht-cell').eq(i).parent('th'),
    		 	 _sec=1300,_timeOut,
    		 	 _sort_caret=$("<span class='sort_caret'  key='"+settings.data.columnShows[i].key+"'><span class='caret'></span></span>"),
    		     _sortMenu=$("<ul class='sortMenu' key='"+settings.data.columnShows[i].key+"' ></ul>"),
    		     _sor_sequence= $("<li class='sor_sequence'><ul><li class='sort_asc'><a href='javascript:void(0)'><span class='glyphicon glyphicon-arrow-up'></span>升序排序</a></li><li class='sort_desc'><a href='javascript:void(0)'><span class='glyphicon glyphicon-arrow-down'></span>降序排列</li></ul></li>"),
    		     _sort_border=$("<li style='border:1px solid #999;margin:5px 0;'></li>");
    		     _sort_filter_string=$("<li class='sort_filter'><ul><li><span class='glyphicon glyphicon-pencil' style='float: left;margin: 5px 10px;'></span><input type='text'class='form-control'key='"+settings.data.columnShows[i].key+"' value='' /></li></ul></li>");
    		     _sort_filter_number=$("<li class='sort_filter'><ul><li><span class='glyphicon glyphicon-chevron-left' style='float: left;margin: 5px 10px;'></span><input type='text'class='form-control filter-less-than'key='"+settings.data.columnShows[i].key+"'/></li><li><span class='glyphicon glyphicon-chevron-right' style='float: left;margin: 5px 10px;'></span><input type='text'class='form-control filter-greater-than'key='"+settings.data.columnShows[i].key+"'/></li></ul></li>"),
    		     _sor_mult_item=$('<li class="sort_mult_item"></li>');
    		     //filterType=null
    	    	if(settings.data.columnShows[i].order){ 
    	    	//	console.log(settings.data.columnShows[i]);
    	    		if(!$(".fht-cell").eq(i).parent("th").find("span").length){    	    		
    	    			_tpl.append(_sort_caret);
    	    			if(!$("ul[key='"+settings.data.columnShows[i].key+"']").length){
    	    				_sortMenu.append(_sor_sequence).appendTo($('body'));
    	    			}
    	    		}    	
    	    	};
    	    	//console.log(settings.data.columnShows[i].filterType);
    	    	 switch (settings.data.columnShows[i].filterType){
		 		  		case 'string':
		 		  			if(!$(".fht-cell").eq(i).parent("th").find("span").length){    	    		
		    	    			_tpl.append(_sort_caret);
		    	    			if(!$("ul[key='"+settings.data.columnShows[i].key+"']").length){
		    	    				_sortMenu.append(_sort_filter_string).appendTo($('body'));
		    	    			}
		    	    		}else{
		    	    			_sortMenu.append(_sort_border);
		    	    			_sortMenu.append(_sort_filter_string);
		    	    		};
		 		  			$("ul[key='"+settings.data.columnShows[i].key+"']").find("input").unbind().on({
								click:function(e){
									e.stopPropagation();
									return false;
								},							
			 		  			keyup:function(){
			 		  				var _t=$(this);	
			 		  				_timeOut=setTimeout(function(){
										var _val=_t.val().trim();	
										$self[0].settings.queryParam[_t.attr("key")]=_val;
										helpers._searchInfoList.call($self,"string",_t.attr("key"),"null",_val);
									},_sec);
			 		  			},
			 		  			keydown:function(){
									clearTimeout(_timeOut);
								}
		 		  			});
		 		  		break;	
//		 		  		case 'number':
//		 		  			if(!$(".fht-cell").eq(i).parent("th").find("span").length){    	    		
//		    	    			_tpl.append(_sort_caret);
//		    	    			if(!$("ul[key='"+settings.data.columnShows[i].key+"']").length){
//		    	    				_sortMenu.append(_sort_filter_number).appendTo($('body'));
//		    	    			}
//		    	    		}else{
//		    	    			_sortMenu.append(_sort_border);
//		    	    			_sortMenu.append(_sort_filter_number);
//		    	    		};
//		    	    		$("ul[key='"+settings.data.columnShows[i].key+"']").find("input").unbind().on({
//								click:function(e){
//									e.stopPropagation();
//									return false;
//								},							
//			 		  			keyup:function(){
//			 		  				var _ts=$(this);			 		  				
//			 		  				_timeOut=setTimeout(function(){
//										var _val=Number(_ts.val()),
//										_less_than=_ts.closest("ul").find(".filter-less-than"),
//										_end_val=Number(_less_than.val());							
//										if(_val<_end_val){
//											$self[0].settings.queryParam[_ts.attr("key")+"_start"]=_val;
//											$self[0].settings.queryParam[_ts.attr("key")+"_end"]=_end_val;
//										}else if(_end_val){
//											delete $self[0].settings.queryParam[_ts.attr("key")+"_start"];
//											$self[0].settings.queryParam[_ts.attr("key")+"_end"]=_val;
//										}else{
//											_less_than.val("");
//											delete $self[0].settings.queryParam[_ts.attr("key")+"_end"];
//											$self[0].settings.queryParam[_ts.attr("key")+"_start"]=_val;
//										}
//										methods.reload.apply($self);
//									},_sec);
//			 		  			},
//			 		  			keydown:function(){
//									clearTimeout(_timeOut);
//								}
//		 		  			});
//		    	    	break;	
		 		  		case 'multiselect':
		 		  			if(settings.data.columnShows[i].listValue){
		 		  					if(!settings.data.columnShows[i].order){ 
		 		  						_tpl.append(_sort_caret);
		 		  						_sortMenu.appendTo($('body'));
		 		  					}else{
		 		  						_sortMenu.append(_sort_border);
		 		  					}
		 		  					for(var list_i=0;list_j=settings.data.columnShows[i].listValue.length,list_i<list_j;list_i++){	
		 		  						if(!$("span[key='"+settings.data.columnShows[i].key+"'][data='"+settings.data.columnShows[i].listValue[list_i][0]+"']").length){
					 		  			var _sor_item=$('<ul><li><span class="menu-icon filter-unchecked"></span><span class="filter" key="'+settings.data.columnShows[i].key+'" data="'+settings.data.columnShows[i].listValue[list_i][0]+'">'+settings.data.columnShows[i].listValue[list_i][1]+'</span></ul></li>');
						 		  		_sor_mult_item.append(_sor_item);
						 		  		if($("ul[key='"+settings.data.columnShows[i].key+"']").length=="1"){
						    	    	$("ul[key='"+settings.data.columnShows[i].key+"']").append(_sor_mult_item);
						    	    	_sor_item.unbind().on({
											click:function(e){
												var _m=$(this),
													_t=_m.closest('li');
												if(_m.hasClass('item-selected')){
													_m.removeClass('item-selected');
													_m.find('.menu-icon').removeClass('filter-checked').addClass('filter-unchecked');
												}else{
													_m.addClass('item-selected');
													_m.find('.menu-icon').removeClass('filter-unchecked').addClass('filter-checked');
												}
												clearTimeout(_timeOut);
												_timeOut=setTimeout(function(){
													var _items=_t.find('.item-selected'),
														_key=_t.find(".filter").attr('key');
													var _arr=[],_obj=[];
													$.each(_items,function(){														
														var _span=$(this).find('.filter'),
															_data=_span.attr('data');
															_datahtml=_span.html();
														   _arr.push(_data),		
														   _obj.push(_datahtml);
													});	
													
													if(!_arr.length){												
														$(".filter_condition[key='"+_key+"'").remove();
														helpers._nullCondition();
													}else{
														$(".filter_condition[key='"+_key+"'").remove();
														for(var i=0;j=_obj.length,i<j;i++){		
															helpers._searchInfoList.call($self,"multiselect",_key,_arr[i],_obj[i]);													
														};
														$self[0].settings.queryParam[_key]=_arr.join(',');
													}
												},_sec);
											}
						    	    		
										});
						    	    	
						 		  		}
		 		  					};
		 		  					} 
		 		  			}else{
		 		  				console.log("假");
		 		  			}
		 		  		break;	 		  			
//		 		  		case "data":
//		 		  			if(!$(".fht-cell").eq(i).parent("th").find("span").length){    	    		
//		    	    			_tpl.append(_sort_caret);
//		    	    			if(!$("ul[key='"+settings.data.columnShows[i].key+"']").length){
//		    	    				_sortMenu.append(_sor_sequence).appendTo($('body'));
//		    	    			}
//		    	    		}    
//		 		  		break;
//		 		  		case 'select':
//		 		  			
//		 		  		break;
		 		  		case 'groupselect':
		 		  			if(settings.data.columnShows[i].listValue){
		 		  					if(!settings.data.columnShows[i].order){ 
		 		  						_tpl.append(_sort_caret);
		 		  						_sortMenu.appendTo($('body'));
		 		  					}else{
		 		  						_sortMenu.append(_sort_border);
		 		  					}
		 		  					var _group = settings.data.columnShows[i].listValue;
		 		  					if(_group.length <1){
		 		  						return;
		 		  					}
		 		  					var option = "<select>";
	 		  						var _last ="";
	 		  						for(var i=0;i<_group.length;i++){
	 		  							if(_last && _last == _group[i][2]){
	 		  								option += "<option value='" + _group[i][0] + "'>"+ _group[i][1] + "</option>";
	 		  							}else{
	 		  								if(_last){
	 		  									option += "</optgroup>";
	 		  								}
	 		  								_last =_group[i][2];
	 		  								option += "<optgroup label='" + _group[i][2] + "'><option value='" + _group[i][0] + "'>"+ _group[i][1] + "</option>";
	 		  							}
	 		  						}
		 		  						option += "</optgroup><select>";
		 		  						$("body").append(option);
		 		  						
		 		  						
//		 		  						if(!$("span[key='"+settings.data.columnShows[i].key+"'][data='"+settings.data.columnShows[i].listValue[list_i][0]+"']").length){
//					 		  			var _sor_item=$('<ul><li><span class="menu-icon filter-unchecked"></span><span class="filter" key="'+settings.data.columnShows[i].key+'" data="'+settings.data.columnShows[i].listValue[list_i][0]+'">'+settings.data.columnShows[i].listValue[list_i][1]+'</span></ul></li>');
//						 		  		_sor_mult_item.append(_sor_item);
//						 		  		if($("ul[key='"+settings.data.columnShows[i].key+"']").length=="1"){
//						    	    	$("ul[key='"+settings.data.columnShows[i].key+"']").append(_sor_mult_item);
//						    	    	_sor_item.unbind().on({
//											click:function(e){
//												var _m=$(this),
//													_t=_m.closest('li');
//												if(_m.hasClass('item-selected')){
//													_m.removeClass('item-selected');
//													_m.find('.menu-icon').removeClass('filter-checked').addClass('filter-unchecked');
//												}else{
//													_m.addClass('item-selected');
//													_m.find('.menu-icon').removeClass('filter-unchecked').addClass('filter-checked');
//												}
//												clearTimeout(_timeOut);
//												_timeOut=setTimeout(function(){
//													var _items=_t.find('.item-selected'),
//														_key=_t.find(".filter").attr('key');
//													var _arr=[],_obj=[];
//													$.each(_items,function(){														
//														var _span=$(this).find('.filter'),
//															_data=_span.attr('data');
//															_datahtml=_span.html();
//														   _arr.push(_data),		
//														   _obj.push(_datahtml);
//													});	
//													
//													if(!_arr.length){												
//														$(".filter_condition[key='"+_key+"'").remove();
//														helpers._nullCondition();
//													}else{
//														$(".filter_condition[key='"+_key+"'").remove();
//														for(var i=0;j=_obj.length,i<j;i++){		
//															console.log(_obj[i]);
//															helpers._searchInfoList.call($self,"multiselect",_key,_arr[i],_obj[i]);													
//														};
//														$self[0].settings.queryParam[_key]=_arr.join(',');
//													}
//												},_sec);
//											}
//						    	    		
//										});
//						    	    	
//						 		  		}
//		 		  					};
//		 		  					} 
		 		  			}else{
		 		  				console.log("假");
		 		  			}
		 		  		break;	 		
		 		  };
    	    }
    	  //遮罩层
    	  if(!$(".sort_mark").length){
    		  $("body").append("<div class='sort_mark'></div>");
    	  }
    	  //过滤查询
    	   $("#filter_inquiry").unbind().click(function(){
				methods.reload.apply($self);
    	   });    	   
    	   //过滤重置
    	   $("#filter_resetting").unbind().click(function(){
    		  $(".select_conditions,.select_price").hide();
    		  $(".filter_condition").remove();
    		  $("ul").removeClass("item-selected");
    		  $("li").find("span.filter-checked").removeClass("filter-checked").addClass("filter-unchecked");
    		  $(".sort_filter input").val("");
    		  $self[0].settings.queryParam={};
    		  methods.reload.apply($self);  
    	   });
    	  
//    	   sortMenuPosition();
//    	   //sortMenu定位；
//    	   function sortMenuPosition(){
//    		   $("th>.sort_caret").each(function(){	
//        		   var offsets =$(this).offset();  
//        		   $(".sortMenu[key='"+$(this).attr("key")+"']").css({"top":parseInt((offsets.top)+$(this).parent().parent().height()-2),"left":parseInt((offsets.left)-90)});
//        	       $(this).unbind().click(function(){
//        	    	  $(".fht-thead th").css("color","#333333");
//        	    	  $(this).closest("th").css("color","#f00");
//        			  $("body>.sortMenu").hide();
//        			  $("body>.sortMenu[key='"+$(this).attr("key")+"']").show();
//        			  $(".sort_mark").show();
//        		   });    		   
//        	   });
//    	   }
//    	   $(".fht-tbody").scroll(function(){  
//    		   sortMenuPosition();
//    	   });

    	   $("th>.sort_caret").each(function(){	
//    		   var offsets =$(this).offset();  
//    		   $(".sortMenu[key='"+$(this).attr("key")+"']").css({"top":parseInt((offsets.top)+$(this).parent().parent().height()-2),"left":parseInt((offsets.left)-90)});
    	       $(this).unbind().click(function(){
    	    	  var offsets =$(this).offset();  
    	    	  $(".sortMenu[key='"+$(this).attr("key")+"']").css({"top":parseInt((offsets.top)+$(this).parent().parent().height()-2),"left":parseInt((offsets.left)-70)});
    	    	  $(".fht-thead th").css("color","#333333");
    	    	  $(this).closest("th").css("color","#f00");
    			  $("body>.sortMenu").hide();
    			  $("body>.sortMenu[key='"+$(this).attr("key")+"']").show();
    			  $(".sort_mark").show();
    		   });    		   
    	   });
    	   $(".sort_mark").unbind().click(function(){
    		   $("body>.sortMenu").hide();
    		   $(this).hide();
    		   $("body>th").css("color","");
    		   $(".fht-thead th").css("color","#333333");
    	   });  
    	   $(".sort_asc").unbind().click(function (){
    		  // $("span[key='"+$(this).closest(".sortMenu").attr("key")+"']").find("span").addClass("border_red");
    		   $self[0].settings.queryParam.sort = $(this).closest(".sortMenu").attr("key");
    		   $self[0].settings.queryParam.order="asc";
    		   methods.reload.apply($self);    		   
    	   });
    	   $(".sort_desc").unbind().click(function(){
    		//   $("span[key='"+$(this).closest(".sortMenu").attr("key")+"']").find("span").addClass("border_red");
    		   $self[0].settings.queryParam.sort = $(this).closest(".sortMenu").attr("key");
    		   $self[0].settings.queryParam.order="desc";
    		   methods.reload.apply($self);
    	    });
    	   if($self[0].settings.queryParam.sort){
    		   $("span[key='"+$self[0].settings.queryParam.sort+"']").find("span").addClass("border_red");
    	   }else if($self[0].settings.data.pageModel.sort){    		   
    		   $("span[key='"+$self[0].settings.data.pageModel.sort+"']").find("span").addClass("border_red");
    	   }
    	 $(".sortMenu,.sort_mark").hide();
    	 $(".fht-thead th").css("color","#333333");
      },
      //添加搜索条件显示
      _searchInfoList:function(type,key,data,value){   
    	  var $self = $(this);
    	  switch(type){
    	  case "string":       		  
	    		$(".filter_condition[key='"+key+"']").remove();
	    		if(value!=""){
					$(".price_filter").append("<div class='filter_condition' type='"+type+"' key='"+key+"'data='"+data+"'><h1>"+value+"</h1><span class='glyphicon glyphicon-remove'></span></div>");
					$(".select_conditions,.select_price").show(); 	
					$(".filter_condition[key='"+key+"']").unbind().click(function(){
						$(this).remove();
						helpers._delQueryParam.call($self,$(this).attr("type"),$(this).attr("key"),$(this).attr("data"));
					});
	    		}else{
	    			helpers._nullCondition();
	    		}
    		   break;
    	  case "multiselect":
			  $(".price_filter").append("<div class='filter_condition' type='"+type+"' key='"+key+"' data='"+data+"'><h1>"+value+"</h1><span class='glyphicon glyphicon-remove'></span></div>");
			  $(".select_conditions,.select_price").show(); 
			  $(".filter_condition[data='"+data+"']").unbind().click(function(){
					$(this).remove();
					helpers._delQueryParam.call($self,$(this).attr("type"),$(this).attr("key"),$(this).attr("data"));
			  });
    		  break;
    	  }
    	  
      },
      //已选条件为空时
      _nullCondition:function(){
    	  if(!$(".filter_condition").length){
				$(".select_conditions,.select_price").hide();	
				location.reload();
		  }
      },
      //删除搜索条件
      _delQueryParam: function(_type,_key,_data){
    	  var $self = $(this);
    	  switch(_type){
	    	  case "string":	    		 
	    		 $self[0].settings.queryParam[_key]=null;
	    		 $("input[key='"+_key+"']").val("");
	    		 break;
	    	  case "multiselect":
	    		  var _other = $(".filter_condition[key='"+_key+"']");
	    		  if(_other.length){
	    			  var _str="";
	    			  for(var i =0;i<_other.length;i++){
	    				 _str+=$(_other[i]).attr("data")+",";
	    			  }
	    			  $self[0].settings.queryParam[_key]=_str.substring(0,_str.length-1);
	    		  }else{
	    			  $self[0].settings.queryParam[_key]=null;
	    		  }
	    		  $("span[data='"+_data+"']").closest("ul").removeClass("item-selected");
	    		  $("span[data='"+_data+"']").siblings("span").removeClass("filter-checked").addClass("filter-unchecked");
	    		  break;
    	  }
    	helpers._nullCondition();
    	  
      },
      //title分组
      _titleGroup:function(arr){    	  	  
    	  var result = [], hash = {},$self=$(this);
		    for (var i = 0, elem; (elem = arr[i]) != null; i++) {
		        if (!hash[elem]) {
		            result.push(elem);
		            hash[elem] = true;
		        }
		    }
		    
		    for(var i =0;i< result.length;i++){		    	
		    	var result_str=result[i],num_s=[];
//		    	console.log(result_str)
		    	$self.find("thead th[parentColumn="+result_str+"]").not(":first").each(function(){		    		
		    		var th_eq=$(this).index();
		    		num_s.push(th_eq);
		    	});
		    	var parent_leg=$self.find("thead th[parentColumn="+result_str+"]").length;
		    	$self.find("thead th[parentColumn="+result_str+"]").eq(0).attr("colspan",parent_leg);
		    	$self.find("thead th[parentColumn="+result_str+"]").eq(0).css("text-align","center");
		    	$self.find("thead th[parentColumn="+result_str+"]").not(":first").remove();		    	
		    };
		
      },
     
      //渲染列菜单
      _columnsMenu:function(){
          var $self=$(this),
              $trs=$self.find(".datagridext-sort");
              helpers._addColumnMenu();
      },
      //渲染分页
      _pagelist:function($obj,$tfoot){
        var $seft=$obj,$data=$seft[0].settings.data;
            if(!$data.pageModel){
              $tfoot.find("._common_page").hide();
              return;
            }
        var $page=$data.pageModel,
            $total=$page.total?$page.total:0;//总数量
            $nowPage=$page.page,//当前页
            $listNum=$page.size,//每页显示记录数
            $PagesLen=($total%$listNum==0)?$total/$listNum:(Math.ceil($total/$listNum)),//总页数
            $PageNum=9,
            $tfoot.find("td").attr('colspan',$data.columnShows.length);
            $tfoot.find("._common_page_number").html("共"+$total+"条");
            $_input=$tfoot.find("._common_page ._common_page_curpage"),
            $_btn=$tfoot.find("._common_page .btn"),
            $_ul=$tfoot.find("._common_page .pagination");
           // console.log($tfoot.find("._common_page ._common_page_len"));
            $_input.attr("data-max",$PagesLen);
            $_input.attr("data-min",1);
            $tfoot.find("._common_page ._common_page_len").html($PagesLen);
            //开始的《标签
            var strS="<li pageno='1'><a href='#' >&laquo;</a></li>";
           // $_ul.append(strS);
            //PageNum_2,PageNum_3中间
            var PageNum_2=$PageNum%2==0?Math.ceil($PageNum/2)+1:Math.ceil($PageNum/2);
            var PageNum_3=$PageNum%2==0?Math.ceil($PageNum/2):Math.ceil($PageNum/2)+1;
            var strC="",startPage=0,endPage;
            //判断显示的第一个页数和最后一个页数 
            if ($PageNum>=$PagesLen) {
              startPage=0;
              endPage=$PagesLen-1;
            }else if ($nowPage<PageNum_2){
              startPage=0;
              endPage=$PagesLen-1>$PageNum?$PageNum:$PagesLen-1;
            }else {
              startPage=$nowPage+PageNum_3>=$PagesLen?$PagesLen-$PageNum-1: $nowPage-PageNum_2;
              var t=startPage+$PageNum;
              endPage=t>$PagesLen?$PagesLen-1:t;
            }
            for (var i=startPage;i<=endPage;i++){
             if ((i+1)==$nowPage)
               strC+="<li class='active' pageno='"+(i+1)+"'><a href='#' >"+(i+1)+"<span class='sr-only'></span></a></li>";
             else 
               strC+="<li pageno='"+(i+1)+"'><a  href='#' >"+(i+1)+"</a></li>";
            // $_ul.append(strC);
            }
            strE="<li pageno='"+($PagesLen==0?1:$PagesLen)+"'><a href='#' >&raquo;</a></li>";
            //$_ul.append(strE);
            $_ul.html(strS+strC+strE);
            if(!$tfoot.is(":visible")){
            	$tfoot.show();
            }
            $_ul.find("li").not(".active").unbind().bind("click",function(){
               // var $_arr=[];
              //      $_obj={},
              //      $_size={};
//                $_obj.id="page";
//                $_obj.value=$(this).attr("pageno");
//                $_size.id="size";
//                $_size.value=$listNum;
//                $_arr.push($_obj);
//                $_arr.push($_size);
//                methods.reload.apply($seft,Array.prototype.slice.call($_arr));
//            	$_arr.push({page:$(this).attr("pageno")});
//            	$_arr.push({size:$listNum});
            	$seft[0].settings.queryParam.page=$(this).attr("pageno");
            	$seft[0].settings.queryParam.size=$listNum;
            	methods.reload.apply($seft);
                return false;
            });
            $_btn.unbind().bind("click",function(){
            	
             // var $_arr=[], 
                 //   $_obj={},
                  //  $_size={},
                    $_val=$_input.val();
              
                if(parseInt($_val) && parseInt($_val)>=1 && parseInt($_val)<=$PagesLen){
//                    $_obj.id="page";
//                    $_obj.value=parseInt($_val);
//                    $_size.id="size";
//                    $_size.value=$listNum;
                	$seft[0].settings.queryParam.page=parseInt($_val);
                	$seft[0].settings.queryParam.size=$listNum;
                   methods.reload.apply($seft);
                    //  methods.reload.apply($seft,Array.prototype.slice.call($_arr));
                }else{
                	alert("输入的页数有误！");
                }
            });
      }
    };


    // if a method as the given argument exists
    if (methods[method]) {
      // call the respective method
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));

      // if an object is given as method OR nothing is given as argument
    } else if (typeof method === 'object' || !method) {

      // call the initialization method
      return methods.init.apply(this, arguments);

      // otherwise
    } else {

      // trigger an error
      $.error('Method "' +  method + '" does not exist in fixedHeaderTable plugin!');

    }

  };

})(jQuery);

