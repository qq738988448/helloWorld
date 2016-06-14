
$(function(){
	$('#submitMessage').click(function(){
		$.ajax({
			type:"post",
			url:"messageSave",
			data:{"message":$("#message").val()},
			dataType:"json",
			async:'false',
			success:function(data){
				appendDiv();	
			}
			
		});
	});
});

function appendDiv(){
	$.ajax({
		type:"post",
		url:"messageSelect",
		data:{"message":$("#message").val()},
		dataType:"json",
		async:'false',
		success:function(data){
			var str="<div style='width: 300px;height: 30px;border-top:1px dotted;'>" +
					"<span>" +
					data.message +
					"</span>" +
					"</div>";
			$('#messageShow').append(str);
		}
		
	});
};