var createTable = {};
createTable.defaultName = "";
createTable.createId = "";
createTable.option = "<option value='NOT_INVESTIGATED'>未调查</option><option value='NO_ANSWERA'>无人接听</option><option value='WRONG_NUMBER'>错号</option><option value='BLIND_TONE'>忙音</option><option value='HANG_UP'>挂断</option><option value='NORMAL_SURVEY'>正常调查</option><option value='CALLED_NO_VALID_INFORMATION'>拨通无有效信息</option><option value='INTERRUPT_SURVEY'>中断调查</option><option value='RR_createTable'>再调查</option><option value='COMPLEMENT_THE_OTHER'>补充其他第三方</option>";

/**
 * 创建tr参数为id,变量名
 */
createTable.createPhoneTable = function(id,name){
	createTable.defaultName = name;
	createTable.createId = id;
	var tr = "<tr index='default'>";
	tr += "<td class='begin' onclick='public_createTime(this)'><a href='javascript:void(0)'>开始拨打</a></td>";
	tr += "<td><select name='"+createTable.defaultName+"[index].TelResult'>"+createTable.option+"</select></td>";
	tr += "<td class='small'><img src='../static/images/delete.png' onclick='remove_tr(this)'/></td>";
	tr += "</tr>";
	$("#"+id).append(tr);
	init_index();
};

/**
 * 显示创建时间
 * @param obj
 */
function public_createTime(obj){
	 $(obj).html(current);
	 $(obj).siblings(".small").html("<input type='text' name='"+createTable.defaultName+"["+$(obj).parent().attr("index")+"].desc'>");
	 function current(){
		 var d=new Date();
		 var hiddenInput = "<input name='"+createTable.defaultName+"["+$(obj).parent().attr("index")+"].phoneTime' hidden='true' value='"+d.formate("yyyy-MM-dd hh:mm:ss")+"'/>";
		 var input_ = " <div>"+d.formate("yyyy-MM-dd hh:mm:ss")+"</div>";
		 return hiddenInput+input_; 
	 }
}

/**
 * 删除当前tr
 * @param obj
 */
function remove_tr(obj){
	$(obj).parent().parent().remove();
	init_index();
}

/**
 * table创建后 初始化下标
 */
function init_index() {
	var trs = $("#" + createTable.createId + " tr");
	var index = 0;
	trs.each(function() {
		if ($(this).attr('index')) {
			var trs = $(this);
			var tds = trs.children();
			if (trs.attr('index')) {
				trs.attr('index', index);
			}
			for ( var i = 0; i < tds.length; i++) {
				var select_ = $($(tds[i]).children("select"));
				var name = select_.attr("name");
				if (name) {
					select_.attr("name", name.replace(/\[.*\]/, "["+index+"]"));
				}
				var input_ = $($(tds[i]).children("input"));
				for(var j = 0 ; j < input_.length; j ++){
					var input_name = $(input_[j]).attr("name");
					if(input_name){
						$(input_[j]).attr("name",input_name.replace(/\[.*\]/, "["+index+"]"));
					}
				}
			}
			index++;
		}
	});
}