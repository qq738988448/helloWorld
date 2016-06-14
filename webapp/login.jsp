<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>Insert title here</title>
</head>
<script type="text/javascript" src="<%=request.getContextPath() %>/js/jquery-1.8.0.js"></script>
<script type="text/javascript" src="<%=request.getContextPath() %>/js/login.js"></script>
<body style="width: 980px;height: 980px;margin: auto;">
<form id="loginform">
	<video controls="controls" Poster="images/vp_poster.jpg"  width="500" autoplay="ture">
    	<source src="video/mov_bbb.mp4" type="video/mp4" />
        <source src="video/mov_bbb.ogg" type="video/ogg" />
        您的浏览器过于老旧，不支持此视频的播放，请下载最新版本的浏览器点此<a href="http://www.microsoft.com/zh-cn/download/internet-explorer-8-details.aspx" target="_blank">升级</a>
    </video>
		<div >
			<input type="text" id="userName" name="userName"/>
			<input type="password"  id ="password" name="passWord"/>
			<button type="button" id="button">登录</button>
		</div>	
	</form>
<script type="text/javascript">

</script>
</body>
</html>