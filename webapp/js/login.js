
$(function(){
	$("#button").click(function(){
		var para=$("#loginform").serializeArray();
		$.ajax({
			type:"post",
			url:"user/login",
			data:para,
			dataType:"json",
			async:'false',
			success:function(data){
				if(data==null){
					
					window.location.href='user/main';
				}		
			}
			
		});
	});
	
})