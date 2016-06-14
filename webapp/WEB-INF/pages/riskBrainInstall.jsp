<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="shiro" uri="http://shiro.apache.org/tags" %>
<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<html>
<head>
    <title>问题库设置</title>
</head>
<link href="<%=request.getContextPath()%>/static/css/bootstrap.min.css" rel="stylesheet"/>
<link href="<%=request.getContextPath()%>/static/css/bootstrap/easyui.css" rel="stylesheet"/>
<link href="<%=request.getContextPath()%>/static/css/style.css" rel="stylesheet"/>
<link href="<%=request.getContextPath()%>/static/css/jquery-ui.css" rel="stylesheet"/>
<link href="<%=request.getContextPath()%>/static/css/jquery.multiselect.css" rel="stylesheet"/>
<link href="<%=request.getContextPath()%>/static/bootstrap/css/common.style.css" rel="stylesheet"/>
<script type="text/javascript" src="<%=request.getContextPath()%>/static/js/jquery-1.8.0.js"></script>
<script type="text/javascript" src="<%=request.getContextPath()%>/static/js/jquery-ui.js"></script>
<script type="text/javascript" src="<%=request.getContextPath()%>/static/js/jquery.easyui.min.js"></script>
<script type="text/javascript" src="<%=request.getContextPath()%>/static/js/jquery.multiselect.js"></script>
<script type="text/javascript" src="<%=request.getContextPath()%>/static/js/jquery.checkbox.js"></script>
<script type="text/javascript" src="<%=request.getContextPath()%>/static/js/bootstrap.min.js"></script>
<script type="text/javascript" src="<%=request.getContextPath()%>/static/js/riskbrain/riskBrainInstall.js"></script>
<body>
<div id="mains">
    <div class="ContentS">
        <input type="hidden" id="firstDegreeTypeHidden" value="${riskBrainQuestion.firstDegreeType}"/>
        <input type="hidden" id="secondDegreeTypeHidden" value="${riskBrainQuestion.secondDegreeType}"/>
        <input type="hidden" id="questionModuleHidden" value="${riskBrainQuestion.questionModule}"/>
        <form role="form" class="form-horizontal" id="questFrom">
            <input type="hidden" name="riskBrainQuestion.id" value="${riskBrainQuestion.id}"/>
            <fieldset>
                <h1 class="H1_legend">基本设置</h1>
                <div style="width: 40%;float: left;">
                    <div class="col-md-12 padd">
                        <label class="col-md-4 padd altright">问题码：</label>
                        <label class="col-md-4 padd altleft">
                            <input class="form-control input-md" name="riskBrainQuestion.questionCode" id="questionCode" value="${riskBrainQuestion.questionCode}"/>
                        </label>
                    </div>
                    <div class="col-md-12 padd">
                        <label class="col-md-4 padd altright">问题显示：</label>
                        <label class="col-md-4 padd altleft">
                            <input class="form-control input-md" name="riskBrainQuestion.questionName" id="questionName" value="${riskBrainQuestion.questionName}"/>
                        </label>
                    </div>
                    <div class="col-md-12 padd">
                        <label class="col-md-4 padd altright">选项属性：</label>
                        <label class="col-md-4 padd altleft">
                            <select class="form-control input-md initial" name="riskBrainQuestion.optionPropertie" id="optionPropertie">
                                <option <c:if test="${riskBrainQuestion.optionPropertie =='single'}">selected</c:if> value="single">单选</option>
                                <option <c:if test="${riskBrainQuestion.optionPropertie =='more'}">selected</c:if> value="more">多选</option>
                                <option <c:if test="${riskBrainQuestion.optionPropertie =='list'}">selected</c:if> value="list">列表</option>
                                <option <c:if test="${riskBrainQuestion.optionPropertie =='text'}">selected</c:if> value="text">文本</option>
                            </select>
                        </label>
                    </div>
                </div>
                <div style="width: 60%; float: right;">
                    <div class="col-md-12 padd">
                        <label class="col-md-2 padd altright">一级类别：</label>
                        <label class="col-md-4 padd altleft">
                            <select class="form-control input-md initial" name="riskBrainQuestion.firstDegreeType" id="firstDegreeType">
                            </select>
                        </label>
                    </div>
                    <div class="col-md-12 padd">
                        <label class="col-md-2 padd altright">二级类别：</label>
                        <label class="col-md-4 padd altleft">
                            <select class="form-control input-md initial" name="riskBrainQuestion.secondDegreeType" id="secondDegreeType">
                            </select>
                        </label>
                    </div>
                    <div class="col-md-12 padd">
                        <label class="col-md-2 padd altright">问题模块：</label>
                        <label class="col-md-4 padd altleft">
                            <select class="form-control input-md initial" name="riskBrainQuestion.questionModule" id="questionModule">
                            </select>
                        </label>
                    </div>
                    <div class="col-md-12 padd">
                        <label class="col-md-2 padd altright">所属产品：</label>
                        <label class="col-md-4 padd altleft">
                            <select class="form-control input-md initial" multiple="multiple" id="riskBrainProductMappings" name="productIds">
                                <c:forEach var="riskBrainProductMappings" items="${riskBrainProductMappings }" varStatus="index">
                                    <input type="hidden" class="hiddenRiskBrainProduct" value="${riskBrainProductMappings.productId }"/>
                                </c:forEach>
                            </select>
                        </label>
                    </div>
                </div>
                <div id="riskBrainQuestionDetailsShow">
                <c:if test="${empty riskBrainQuestionDetails}">
                <div id="append" style="width: 100%;float: right;padding-left: 70px">
                    <div class="col-md-12 padd">
                        <div class="col-md-4 padd">
                            <label class="col-md-3 padd altright">选项显示：</label>
                            <label class="col-md-6 padd altleft">
                                <input class="form-control input-md detailKeyList" disabled="disabled" value="${riskBrainQuestionDetails[0].detailKey}" name="riskBrainQuestionDetail[0].detailKey"/>
                            </label>
                        </div>
                        <div class="col-md-4 padd">
                            <label class="col-md-5 padd altright">数据库存储：</label>
                            <label class="col-md-7 padd altleft">
                                <input class="form-control input-md detailValueList" disabled="disabled" value="${riskBrainQuestionDetails[0].detailValue}" name="riskBrainQuestionDetail[0].detailValue"/>
                            </label>
                        </div>
                        <div class="col-sm-1 padd addbtn raise">
                            <a class="btn btn-primary btn-sm add" onclick="add('append')">增</a>
                            <a class="btn btn-primary btn-sm add deleteList" onclick="deleteDiv(this,0)">删</a>
                        </div>
                    </div>
                </div>
                </c:if>
                <c:if test="${!empty riskBrainQuestionDetails}">
                    <div id="append" style="width: 100%;float: right;padding-left: 70px">
                        <c:forEach var="riskBrainQuestionDetails" items="${riskBrainQuestionDetails }" varStatus="index">
                            <input type="hidden" id="riskBrainQuestionDetailsHidden${index.count-1 }" value="${riskBrainQuestionDetails.id}"/>
                        <div class="col-md-12 padd">
                            <div class="col-md-4 padd">
                                <label class="col-md-3 padd altright">选项显示：</label>
                                <label class="col-md-6 padd altleft">
                                    <input class="form-control input-md detailKeyList" disabled="disabled" name="riskBrainQuestionDetail[${index.count-1 }].detailKey" value="${riskBrainQuestionDetails.detailKey}"/>
                                </label>
                            </div>
                            <div class="col-md-4 padd">
                                <label class="col-md-5 padd altright">数据库存储：</label>
                                <label class="col-md-7 padd altleft">
                                    <input class="form-control input-md detailValueList" disabled="disabled" name="riskBrainQuestionDetail[${index.count-1 }].detailValue" value="${riskBrainQuestionDetails.detailValue}"/>
                                </label>
                            </div>
                            <div class="col-sm-1 padd addbtn raise">
                                <a class="btn btn-primary btn-sm add" onclick="add('append')">增</a>
                                <a class="btn btn-primary btn-sm add deleteList" onclick="deleteDiv(this,${index.count-1 })">删</a>
                            </div>
                        </div>
                        </c:forEach>
                    </div>
                </c:if>
                </div>
                <div id="preinstallTestShow" style="width: 100%;float: right;padding-left: 70px;display: none">
                    <div class="col-md-12 padd">
                        <div class="col-md-4 padd">
                            <label class="col-md-3 padd altright">预设文本（可空）：</label>
                            <label class="col-md-6 padd altleft">
                                <input class="form-control input-md" disabled="disabled" value="${riskBrainQuestionDetails[0].detailKey}" name="riskBrainQuestionDetail[0].detailKey"/>
                            </label>
                        </div>
                        <div class="col-md-4 padd">
                            <label class="col-md-5 padd altright">单位：</label>
                            <label class="col-md-7 padd altleft">
                                <input class="form-control input-md companyCheck" disabled="disabled" value="${riskBrainQuestionDetails[0].detailValue}" name="riskBrainQuestionDetail[0].detailValue"/>
                            </label>
                        </div>
                    </div>
                </div>
                <div style="width: 100%;float: right;padding-left: 70px">
                    <label class="col-md-1 padd altright">状态：</label>
                    <label class="col-md-4 padd altleft">
                        <label class="left_F_r" style="padding-left: 30px;">启用
                            <input type="radio" value="true" <c:if test="${riskBrainQuestion.attribute == 'true'}">checked</c:if> name="riskBrainQuestion.attribute" class="left_F">
                        </label>
                        <label class="left_F_r" style="padding-left: 30px;">停用
                            <input type="radio" value="false" <c:if test="${riskBrainQuestion.attribute == 'false'}">checked</c:if> name="riskBrainQuestion.attribute" class="left_F">
                        </label>
                        <label class="left_F_r" style="padding-left: 30px;">必抽
                            <input type="radio" value="must" <c:if test="${riskBrainQuestion.attribute == 'must'}">checked</c:if> name="riskBrainQuestion.attribute" class="left_F">
                        </label>
                    </label>
                </div>
                <div style="width: 100%;float: right;padding-left: 70px">
                    <label class="col-md-1 padd altright">答案：</label>
                    <label class="col-md-4 padd altleft">
                        <input class="form-control input-md" name="riskBrainQuestion.answer" id="answer" value="${riskBrainQuestion.answer}"/>
                    </label>
                </div>
                <div style="width: 100%;float: right;padding-left: 70px">
                    <div class="col-md-12" style="text-align: center;">
                        <button type="button" class="btn btn-info altright" onclick="save()">保存</button>
                        <button type="button" class="btn btn-info altleft" onclick="close()">取消</button>
                        <button type="button" class="btn btn-info altleft" id="riskBrainInstallEdit">编辑</button>
                    </div>
                </div>
            </fieldset>
        </form>
    </div>
</div>
</body>
</html>
