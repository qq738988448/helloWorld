/*! 基于jQuery 实现复选框 */
;(function($) {

	//加载
	$.fn.checkbox = function(options,_64e) {
		if (typeof options == "string") {
			return $.fn.checkbox.methods[options](this, _64e);
		}

		//默认值
		var defaults = {
			name : 'dxg', //复选组名称
			isMultiple : false, //单选
			defaultVal : new Array(), //默认值
			names : new Array(),
			values : new Array(),
			Selected : function(value){},
		    Cancel : function(value){}
        };
		var o = $.extend(defaults,options);//以传参覆盖
		var $div = $(this);	//选定操作的jquery元素为当前选中的元素
		
		//生成复选组
		for(var i=0; i<o.names.length; i++){
			var name = o.names[i];
			var value = o.values[i];
			//选中默认值
			var isDefault = false;
			for(var j=0; j<o.defaultVal.length; j++){
				var dv = o.defaultVal[j];
				if(dv == value){
					isDefault = true;
					break;
				}
			}
			var id = $div.attr("id")+i;
			var checkbox = "<input type='checkbox' id='"+id+"' name='"+o.name+"' value='"+value+"'> "+name+" ";
			if(isDefault){
				checkbox = "<input type='checkbox' id='"+id+"' name='"+o.name+"' value='"+value+"' checked='checked'> "+name+" ";
			}
			$div.append(checkbox);
		}
		
		//选中时触发
		var checkbox = $("[name='"+o.name+"']");
		checkbox.change(function(){
			//触发回调函数
			if($(this).is(':checked')){
				o.Selected($(this).val());
			}else{
				o.Cancel($(this).val());
			}
		});
		
		//是否单选
		if(!o.isMultiple){
			var checkbox = $("[name='"+o.name+"']");
			checkbox.change(function(){
				var check = $(this);
				//互斥
				checkbox.each(function() { 
					var c = $(this);
					if(c.val()!=check.val()){
						c.attr("checked", false);
						o.Cancel(c.val());
					}
				}); 
			});
		}

    };

	$.fn.checkbox.methods = {
		getValue : function(a,b) {	//获取选中值
			var id = a.attr("id");
			var cb = $("#"+id+" input[type='checkbox']");
			
			var str = "";
			cb.each(function(){ 
		        if($(this).is(':checked')){
		            str += $(this).val()+",";
		        }
		    })
		    if(str.length>0){
		    	str = str.substring(0,str.length-1);
		    }
		    return str.split(",");
		}
	}

})(jQuery);