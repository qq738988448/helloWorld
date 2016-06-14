/** 问题页面*/
var riskBrainInstall = {};
/** 存储二级菜单*/
var second = [];
/** 存储三级菜单*/
var problem = [];
/** 存储产品*/
var product = [];
/** js入口*/
$(function () {
    //加载问题字典
    riskBrainInstall.initQusetList();
    //加载产品列表
    riskBrainInstall.initProductList();
    //一级菜单change事件
    riskBrainInstall.firstListChange();
    //二级菜单change事件
    riskBrainInstall.secondListChange();
    //问题模块（三级菜单）change事件
    riskBrainInstall.questionModuleChange();
    //控制选项属性为文本
    riskBrainInstall.selectChange();
    //控制页面编辑
    riskBrainInstall.editInit();
});
/**
 * 加载问题字典
 */
riskBrainInstall.initQusetList = function () {
    $.ajax({
        url: '../riskBrain/initQusetList',
        type: 'post',
        dataType: "json",
        success: function (data) {
            riskBrainInstall.package(data.result)
        },
        error: function () {

        }
    });
};
/**
 * 添加下拉框
 * @param data
 */
riskBrainInstall.package = function (data) {
    var firstList = "";
    var secondList = "";
    var problemList = "";
    for (var i = 0; i < data.length; i++) {
        if (data[i].modelType == "first_type") {
            firstList += "<option value='" + data[i].modelCode + "'>" + data[i].modelName + "</option>";
        }
        if (data[i].modelType == "second_type") {
            secondList += "<option value='" + data[i].modelCode + "'>" + data[i].modelName + "</option>";
            second.push(data[i]);
        }
        if (data[i].modelType == "problem_module") {
            problemList += "<option value='" + data[i].modelCode + "'>" + data[i].modelName + "</option>";
            problem.push(data[i]);
        }
    }

    $('#firstDegreeType').append(firstList);
    $('#secondDegreeType').append(secondList);
    $('#questionModule').append(problemList);
    $('#firstDegreeType').change();
};
/**
 * 一级菜单change事件
 */
riskBrainInstall.firstListChange = function () {
    //标识第一次加载
    var isInit = false;
    $('#firstDegreeType').change(function () {
        var firstDegreeTypeList = $('#firstDegreeType option');
        if (isInit) {
            var firstDegreeType = $('#firstDegreeType').val();
            for (var a = 0; a < firstDegreeTypeList.length; a++) {
                if (firstDegreeTypeList[a].value == firstDegreeType) {
                    firstDegreeTypeList[a].selected = true;
                }
            }
            riskBrainInstall.initSelect('firstDegreeType', 'secondDegreeType', second);
            $('#secondDegreeType').change();
        } else {
            var firstDegreeTypeHidden = $('#firstDegreeTypeHidden').val();
            for (var a = 0; a < firstDegreeTypeList.length; a++) {
                if (firstDegreeTypeList[a].value == firstDegreeTypeHidden) {
                    firstDegreeTypeList[a].selected = true;
                }
            }
            isInit = true;
            $('#secondDegreeType').change();
        }
    });
};
/**
 * 二级菜单change事件
 */
riskBrainInstall.secondListChange = function () {
    //标识第一次加载
    var isInit = false;
    $('#secondDegreeType').change(function () {
        var secondDegreeTypeList = $('#secondDegreeType option');
        if (isInit) {
            var secondDegreeType = $('#secondDegreeType').val();
            riskBrainInstall.initSelect('secondDegreeType', 'questionModule', problem);
            for (var a = 0; a < secondDegreeTypeList.length; a++) {
                if (secondDegreeTypeList[a].value == secondDegreeType) {
                    secondDegreeTypeList[a].selected = true;
                }
            }
            $('#questionModule').change();
        } else {
            var secondDegreeTypeHidden = $('#secondDegreeTypeHidden').val();
            for (var a = 0; a < secondDegreeTypeList.length; a++) {
                if (secondDegreeTypeList[a].value == secondDegreeTypeHidden) {
                    secondDegreeTypeList[a].selected = true;
                }
            }
            isInit = true;
            $('#questionModule').change();
        }
    });
};
/**
 *问题模块（三级菜单）change事件
 */
riskBrainInstall.questionModuleChange = function () {
    //标识第一次加载
    var isInit = false;
    $('#questionModule').change(function () {
        var questionModuleList = $('#questionModule option');
        if (isInit) {
            var questionModule = $('#questionModule').val();
            for (var a = 0; a < questionModuleList.length; a++) {
                if (questionModuleList[a].value == questionModule) {
                    questionModuleList[a].selected = true;
                }
            }
        } else {
            var questionModuleHidden = $('#questionModuleHidden').val();
            for (var a = 0; a < questionModuleList.length; a++) {
                if (questionModuleList[a].value == questionModuleHidden) {
                    questionModuleList[a].selected = true;
                }
            }
            isInit = true;
        }
    });
};
/**
 * 加载对应选项
 */
riskBrainInstall.initSelect = function (parent, child, data) {
    var degreeType = $("#" + parent).val();
    var str = "";
    $("#" + child).empty();
    for (var i = 0; i < data.length; i++) {
        if (data[i].parentModelCode == degreeType) {
            str += "<option value='" + data[i].modelCode + "'>" + data[i].modelName + "</option>";
        }
    }
    $("#" + child).append(str);
};
/**
 * 加载产品列表
 */
riskBrainInstall.initProductList = function () {
    $.ajax({
        url: '../riskBrain/initProductList',
        type: 'post',
        dataType: "json",
        success: function (data) {
            riskBrainInstall.packageProduct(data.result);
        },
        error: function () {

        }
    });
};
/**
 * 生成下拉多选框
 * @param data
 */
riskBrainInstall.packageProduct = function (data) {
    $('#riskBrainProductMappings').empty()
    var str = "";
    for (var i = 0; i < data.length; i++) {
        str += "<option value='" + data[i].id + "'>" + data[i].productName + "</option>";
        product.push(data[i]);
    }
    $('#riskBrainProductMappings').append(str);
    $("#riskBrainProductMappings").multiselect({
        noneSelectedText: "==请选择==",
        checkAllText: "全选",
        uncheckAllText: '全不选',
        selectedList: 4
    });
    //产品列表回显
    riskBrainInstall.multiselectShow();
};
/**
 * 下拉多选框数据回显
 */
riskBrainInstall.multiselectShow = function () {
    var data = $('.hiddenRiskBrainProduct');
    var ids = [];
    for (var i = 0; i < data.length; i++) {
        for (var y = 0; y < product.length; y++) {
            if (data[i].value == product[y].id) {
                ids.push(product[y].id);
            }
        }
    }
    $('#riskBrainProductMappings').val(ids);
    $('#riskBrainProductMappings').multiselect("refresh");
}
/**
 * 添加div
 * @param id
 */
function add(id) {
    var index = 0;
    var label = " <div class='col-md-12 padd'>"
        + "<div class='col-md-4 padd'>"
        + "<label class='col-md-3 padd altright'>选项显示：</label>"
        + "<label class='col-md-6 padd altleft'>"
        + "<input class='form-control input-md detailKeyList' name='riskBrainQuestionDetail[" + index + "].detailKey' type='text'/>"
        + "</label>"
        + "</div>"
        + "<div class='col-md-4 padd'>"
        + "<label class='col-md-5 padd altright'>数据库存储：</label>"
        + "<label class='col-md-7 padd altleft'>"
        + "<input class='form-control input-md detailValueList' name='riskBrainQuestionDetail[" + index + "].detailValue' type='text'/>"
        + "</label>"
        + "</div>"
        + "<div class='col-sm-1 padd addbtn raise'>"
        + "<a class='btn btn-primary btn-sm add' onclick='add()'>增</a>"
        + "<a class='btn btn-primary btn-sm add deleteList' onclick='deleteDiv(this," + index + ")'>删</a>"
        + "</div>"
        + "</div>"
    $('#append').append(label)
    $('#hiddenIndex').val(index);
    resetIndex();
}
/**
 * 重置下标
 */
function resetIndex() {
    var nameList = new Array();
    nameList.push("input.detailKeyList");
    nameList.push("input.detailValueList");
    $.each(nameList, function (i, o) {
        var i = 0;
        $(o).each(function () {
            $this = $(this);
            name = $this.attr("name");
            _name = name.replace(/\[\d*\]/, "[" + i + "]");
            $this.attr("name", _name);
            i++;
        });
    });
    var a = 0;
    $("a.deleteList").each(function () {
        var onclick = $(this).attr("onclick");
        _onclick = onclick.replace(/\(this,\d*\)/, "(this," + a + ")");
        $(this).attr("onclick", _onclick);
        a++
    });
}
/**
 * 控制选项属性为文本
 */
riskBrainInstall.selectChange = function () {
    var test = $('#optionPropertie').val();
    if (test == 'text') {
        $('#riskBrainQuestionDetailsShow').hide();
        $('#preinstallTestShow').show();
    } else {
        $('#riskBrainQuestionDetailsShow').show();
        $('#preinstallTestShow').hide();
    }
    $('#optionPropertie').change(function () {
        var test = $('#optionPropertie').val();
        if (test == 'text') {
            $('#riskBrainQuestionDetailsShow').hide();
            $('#riskBrainQuestionDetailsShow input').attr("disabled", true);
            $('#preinstallTestShow').show();
            $('#preinstallTestShow input').attr("disabled", false);
            $('#preinstallTestShow input').val("");
        } else {
            $('#riskBrainQuestionDetailsShow').show();
            $('#riskBrainQuestionDetailsShow input').attr("disabled", false);
            $('#preinstallTestShow').hide();
            $('#preinstallTestShow input').attr("disabled", true);
            $('#riskBrainQuestionDetailsShow input').val("");
        }
    });
}
/**
 * 保存问题添加页
 */
riskBrainInstall.save = function () {
    var param = $("#questFrom").serializeArray();
    $.ajax({
        url: '../riskBrain/saveQuest',
        data: param,
        type: 'post',
        dataType: "json",
        success: function (data) {
            alert(data.msg)
        },
        error: function () {
            alert(data.msg)
        }
    });
}
/**
 * 保存问题添加页
 */
function save() {
    var result = riskBrainInstall.checkFrom();
    if (result) {
        riskBrainInstall.save();
    }
}
/**
 * 删除div
 */
function deleteDiv(val, id) {
    var keyId = $('#riskBrainQuestionDetailsHidden' + id).val();
    if (keyId != null) {
        $.ajax({
            url: '../riskBrain/deleteRiskBrainQuestionDetail',
            data: {"id": keyId},
            type: 'post',
            dataType: "json",
            success: function (data) {
                $(val).parent().parent().remove();
                resetIndex();
            },
            error: function (data) {
                alert(data.responseText);
            }
        });
    } else {
        $(val).parent().parent().remove();
        resetIndex();
    }
}
/**
 * 验证表单数据有效性
 * @returns {boolean}
 */
riskBrainInstall.checkFrom = function () {
    if ($('#questionCode').val() == null || $('#questionCode').val() == "") {
        alert("请输入问题码");
        return false;
    } else if ($('#questionName').val() == null || $('#questionName').val() == "") {
        alert("请输入问题显示");
        return false;
    } else if ($('#optionPropertie').val() == null || $('#optionPropertie').val() == "") {
        alert("请输入选项属性");
        return false;
    } else if ($('#firstDegreeType').val() == null || $('#firstDegreeType').val() == "") {
        alert("请输入一级类别");
        return false;
    } else if ($('#secondDegreeType').val() == null || $('#secondDegreeType').val() == "") {
        alert("请输入二级类别");
        return false;
    } else if ($('#questionModule').val() == null || $('#questionModule').val() == "") {
        alert("请输入问题模块");
        return false;
    } else if ($('#riskBrainProductMappings').val() == null || $('#riskBrainProductMappings').val() == "") {
        alert("请输入所属产品");
        return false;
    } else if ($('#riskBrainProductMappings').val() == null || $('#riskBrainProductMappings').val() == "") {
        alert("请输入所属产品");
        return false;
    } else if ($('#answer').val() == null || $('#answer').val() == "") {
        alert("请输入答案");
        return false;
    }
    var detailKeyList = $('.detailKeyList');
    for (var i = 0; i < detailKeyList.length; i++) {
        if (detailKeyList[i].value == null || detailKeyList[i].value == "") {
            alert("请输入选项显示");
            return false;
        }
    }
    var detailValueList = $('.detailValueList');
    for (var x = 0; x < detailValueList.length; x++) {
        if (detailValueList[x].value == null || detailValueList[x].value == "") {
            alert("请输入数据库存储");
            return false;
        }
    }
    var test = $('#optionPropertie').val();
    if (test == 'text') {
        var companyCheck = $('.companyCheck').val();
        if (companyCheck == null || companyCheck == "") {
            alert("请输入单位");
            return false;
        }
    }
    var attributes = $("[name='riskBrainQuestion.attribute']");
    var attributesCheck = false;
    for (var y = 0; y < attributes.length; y++) {
        if (attributes[y].checked == true) {
            attributesCheck = true;
        }
    }
    if (attributesCheck == false) {
        alert("请输入状态");
        return false;
    }
    return true;

}
/**
 * 控制页面编辑
 */
riskBrainInstall.editInit = function () {
    $("input,button,select").attr("disabled", true);
    $('#riskBrainInstallEdit').attr("disabled", false);
    $('#riskBrainInstallEdit').click(function () {
        $("input,button,select").attr("disabled", false);
        $('.multiselect_btn').attr("disabled", false);
        $('.ui-state-disabled').removeAttr("disabled");
        $('.ui-state-disabled').removeClass('ui-state-disabled');
        var test = $('#optionPropertie').val();
        if (test == 'text') {
            $('#riskBrainQuestionDetailsShow input').attr("disabled", true);
            $('#preinstallTestShow input').attr("disabled", false);
        } else {
            $('#riskBrainQuestionDetailsShow input').attr("disabled", false);
            $('#preinstallTestShow input').attr("disabled", true);
        }

    });
}

function close() {
    alert("aa");
    window.close();
}
