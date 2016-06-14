<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>Insert title here</title>
</head>
<script type="text/javascript" src="<%=request.getContextPath() %>/js/jquery-1.8.0.js"></script>
<script type="text/javascript" src="<%=request.getContextPath() %>/js/main.js"></script>
<body style="width: 980px;height: 980px;margin: auto;">
<div>
<h1>躺在花瓣中的女孩</h1>
<span>风呼一夜，夜显得很不宁静，篱笆墙下的那一株剑兰、己被折腾至摇摇欲坠，那态势，貌似一花样少女被人灌醉的感觉 ，如果换一角度打量，仿佛是在舞蹈，正因这种触感，撩拨了心弦。

走出农舍迈向湖边方向，一路呼吸着晨曦清新气息，隐约听到春天的脚步，事实上，它己来临，看周边的一切，都呈现盎然生机。或许，春天的绿，是每一个清晨的苏醒，也是大自然给予人类慷慨的馈赠。

湖边，薄雾如纱，若隐若现，这种朦胧，不其然、依稀的产生着美感。仰望远山，就如雨后春笋的缩影。近观平湖，那抹蓝，静谧天地之间浑然一色，纵然用笔墨描摹，也难以形容“水连天，山水如画''之优美场景。

不远处，有一群人在喧哗。出于好奇，上前观看，原来是拍摄电影，我没打听这剧叫什么名字，只看到布景是铺满一地鲜花，导演一声令下，一女孩，走进花瓣中躺下，然后，灯光师，摄影师等人、各就各位开始拍摄。被花瓣包围的少女，散发着一股清新，那纯美娇柔，正如她的芳龄一样，花样年华。是青春、赋予她的无敌，尽是鲜红的色彩，是年华、盘起她发髻，走进一个时代。

盯着人家家干活，总是感觉不好意思，于是，我就迈步往前去寻找其它的景点，一路上，我在思索，刚刚的眼前场景，“躺在花瓣中的女孩''或许，是她一生的梦，满心欢喜踏入花瓣，摄尽浪漫情怀，岂不是，情窦初开一出花语？那青涩流露，不也是、棒着书本的女孩吗？</span>
</div>
<br>
<span>留言板：</span>
<div id="messageShow">
	<c:forEach items="${ messageList}" var="messageList" varStatus="status">
		<div  style="width: 300px;height: 30px;border-top:1px dotted;">
			<span>${messageList.message}</span>
		</div>
	</c:forEach>
</div>
<div>
	<textarea rows="" cols="" id="message"></textarea><button type="button" id="submitMessage">发表</button>
</div>
</body>
</html>