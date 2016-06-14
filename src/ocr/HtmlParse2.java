/**
 * Copyright(c) 2013-2014 by Puhuifinance Inc.
 * All Rights Reserved
 */
package com.puhui.tools.supplement.parse.impl;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.io.StringReader;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.commons.beanutils.BeanUtils;
import org.apache.commons.lang.StringEscapeUtils;
import org.jdom2.input.SAXBuilder;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import com.puhui.model.risk.credit.RiskCreditBase;
import com.puhui.risk.enumeration.risk.credit.DeadlineStatusOfCreditCardType;
import com.puhui.risk.enumeration.risk.credit.DeadlineStatusType;
import com.puhui.risk.enumeration.risk.credit.GuaranteeWayType;
import com.puhui.risk.enumeration.risk.credit.LoanStyleType;
import com.puhui.risk.enumeration.risk.credit.MethodRepaymentType;
import com.puhui.tools.supplement.util.ParseResultTypeEnum;
import com.puhui.tools.supplement.util.ParseUtil;

/**
 * @author chenchao
 */
public class HtmlParse2 {
    /**
     * 默认的包路径
     */
    private final static String PACKAGE = "com.puhui.model.risk.credit.";
    /**
     * 贷款 贷记卡 准贷记卡 基础信息正则,这个正则也代表一条记录的开始.
     */
    private final static String HEAD_REGEX = "[\\.|:]{1}\\d{4}年\\d{1,2}月\\d{1,2}日.+发放的";
    /**
     * 配置文件的标题列表,配置的是征信报告中都有哪些标题,主要用于判断是否为结束标记
     */
    private static List<String> titleList = new ArrayList<String>();
    /**
     * 解析的结果
     */
    private Map<String, Object> resultMap = new HashMap<String, Object>();

    static {
        BufferedReader br = null;
        try {
            br = new BufferedReader(new InputStreamReader(HtmlParse2.class.getClassLoader().getResourceAsStream(
                    "html_title.list")));
            String str = null;
            while ((str = br.readLine()) != null) {
                titleList.add(str.trim());
            }
        } catch (IOException e) {

        } finally {
            if (br != null) {
                try {
                    br.close();
                } catch (IOException e) {

                }
            }
        }
    }
    /**
     * 解析的HTML文件中的代码
     */
    private String html = "";
    /**
     * 解析模板文件名
     */
    private String parseXML = null;
    /**
     * jsoup实体,html中的body对象
     */
    private Element body = null;

    /**
     * 解析征信报告
     * 
     * @author chenchao
     * @return
     */
    public Map<String, Object> parse() {
        HashMap<String, Object> requireMap = new HashMap<String, Object>();
        try {
            SAXBuilder builder = new SAXBuilder();
            // org.jdom2.Document docxml =
            // builder.build(this.getClass().getClassLoader().getResourceAsStream(parseXML));
            Reader xmlReader = new StringReader(parseXML);
            org.jdom2.Document docxml = builder.build(xmlReader);
            org.jdom2.Element root = docxml.getRootElement(); // 获取跟节点
            for (org.jdom2.Element e : root.getChildren()) {
                if (e.getName().equals("path")) {
                    parsePath(e, body.children());
                } else if (e.getName().equals("group")) {
                    parseGroup(e);
                }
            }
        } catch (Exception e) {
            // e.printStackTrace();
        }
        if (resultMap.size() == 0) {
            requireMap.put("resEnum", ParseResultTypeEnum.FILE_CAN_NOT_PARSE);
        } else {
            requireMap.put("resEnum", ParseResultTypeEnum.COMPLETE);
            List<Object> resList = new ArrayList<Object>();
            for (Entry<String, Object> entry : resultMap.entrySet()) {
                if (entry.getValue() instanceof ArrayList) {
                    resList.addAll((Collection) entry.getValue());
                } else {
                    resList.add(entry.getValue());
                }
            }
            requireMap.put("res", resList);
        }
        requireMap.put("mes", "");
        resultMap = new HashMap<String, Object>();
        return requireMap;
    }

    /**
     * 解析单独节点
     * 
     * @author chenchao
     * @param e
     *            模板节点对象
     * @param html
     *            要解析的HTML
     */
    private void parsePath(org.jdom2.Element e, Elements html, Object obj) {
        String start = e.getAttributeValue("start");
        String startIndex = e.getAttributeValue("startIndex");
        String parent = e.getAttributeValue("parent");
        String skip = e.getAttributeValue("skip");
        String tag = e.getAttributeValue("tag");
        String startStr = e.getAttributeValue("startStr");
        Elements elList = html.select(start);
        if (start.equals("征信空白")) {
            RiskCreditBase base = (RiskCreditBase) createPOJO("RiskCreditBase", false);
            base.setQuerydate(new Date());
            resultMap.put("RiskCreditBase", base);
        }

        if (elList.size() > 0) {
            int index = 0;
            try {
                index = Integer.parseInt(startIndex);
            } catch (Exception ex) {

            }
            /**
             * @author wanghan 如果elList为多条
             */
            int elListNum = elList.size();
            for (int i = 0; i < elListNum; i++) {
                Element elListString = elList.get(i);
                Element data = getParent(elListString, parent);
                data = skipParent(data, skip);
                loadData(e, getTag(data, tag, startStr), obj);
            }
            // 原来
            // Element data = getParent(elList.get(index), parent);
            // data = skipParent(data, skip);
            // loadData(e, getTag(data, tag), obj);
        }
    }

    private void parsePath(org.jdom2.Element e, Elements html) {
        parsePath(e, html, null);
    }

    /**
     * 解析多个节点
     * 
     * @author chenchao
     * @param e
     *            模板节点对象
     */
    private void parseGroup(org.jdom2.Element e) {
        String id = e.getAttributeValue("id");
        String start = e.getAttributeValue("start");
        String startIndex = e.getAttributeValue("startIndex");
        String parent = e.getAttributeValue("parent");
        String skip = e.getAttributeValue("skip");
        String tag = e.getAttributeValue("tag");
        int titleIndex = 0;
        for (int i = 0; i < titleList.size(); i++) {
            Pattern pattern = Pattern.compile(titleList.get(i));
            Matcher mat = pattern.matcher(id);
            if (mat.matches()) {
                titleIndex = i;
                break;
            }
        }
        Elements elList = body.select(start);
        if (elList.size() > 0) {
            int index = 0;
            try {
                index = Integer.parseInt(startIndex);
            } catch (Exception ex) {

            }
            Element data = getParent(elList.get(index), parent);
            data = skipParent(data, skip);
            Element elParent = data.parent();
            Elements dataList = new Elements();
            /**
             * @author wanghan 原值为：int htmlIndex =
             *         elParent.children().indexOf(data)+1; 用来判断是否为下一个节点
             */
            int htmlIndex = elParent.children().indexOf(data);
            for (; htmlIndex < elParent.children().size(); htmlIndex++) {
                if (checkIsEnd(elParent.children().get(htmlIndex), titleIndex)) {
                    break;
                } else {
                    dataList.add(elParent.children().get(htmlIndex));
                }
            }
            /**
             * @author chenchao tag != null
             */
            if (tag != null) {
                dataList = dataList.select(tag);
            }
            List<Elements> finalData = splitData(dataList, e);
            List<Object> resultList = new ArrayList<Object>();
            for (Elements html : finalData) {
                // 加载基础信息 未完成
                Object obj = initBase(e, html);
                if (obj != null) {
                    resultList.add(obj);
                }
                for (org.jdom2.Element path : e.getChildren("path")) {
                    parsePath(path, html, obj);
                }
            }
            String className = e.getAttributeValue("class");
            if (!resultMap.containsKey(className)) {
                resultMap.put(className, resultList);
            }
        }
    }

    /**
     * 初始化 贷款 贷记卡 基本信息
     * 
     * @author chenchao
     * @param e
     *            group节点
     * @param html
     *            解析的HTML代码
     * @return
     */
    private Object initBase(org.jdom2.Element e, Elements html) {
        String headTag = e.getAttributeValue("headTag");
        if (headTag == null) {
            return null;
        }
        String headRegex = e.getAttributeValue("headRegex");
        if (headRegex == null) {
            headRegex = HEAD_REGEX;
        }
        String className = e.getAttributeValue("class");
        Object obj = createPOJO(className, true);
        String data = html.select(headTag + ":matches(" + headRegex + ")").text().replace(" ", "");
        String headImit = e.getAttributeValue("headImit");
        if (headImit != null && headImit.equals("true")) {
            return obj;
        } else {
            Pattern pattern = Pattern.compile(headRegex);
            Matcher mat = pattern.matcher(data);
            if (mat.find()) {
                String str = mat.group().trim();
                // if (str.length() < 4) {
                // convertData(obj, str, "");
                // break;
                // } else {
                String value = str.substring(1, str.indexOf("日") + 1).replace(" ", "");
                convertData(obj, value, "grantDate", "date", "yyyy年MM月dd日");
                // }
            }
            if (className.equals("RiskCreditLoanDetail")) {
                // 贷款金额
                pattern = Pattern.compile("发放的\\d+(,\\d{3})*元");
                mat = pattern.matcher(data);
                if (mat.find()) {
                    convertData(obj, mat.group().substring(3, mat.group().lastIndexOf("元")), "amount", "double", null);
                }
                // 发放机构
                pattern = Pattern.compile(headRegex);
                mat = pattern.matcher(data);
                if (mat.find()) {
                    String str = mat.group().trim().replace("\"", "").replace("＂", "").replace("“", "")
                            .replace("”", "");
                    int start = str.indexOf("机构");
                    int end = str.indexOf("发放的");
                    if (start == -1) {
                        start = str.indexOf("日") + 1;
                    } else {
                        start += 2;
                    }
                    convertData(obj, str.substring(start, end), "grantOrgainzation");
                }
                // 期数
                pattern = Pattern.compile("[，|,]{1}\\d+期[，|,]{1}");
                mat = pattern.matcher(data);
                if (mat.find()) {
                    convertData(obj, mat.group().substring(1, mat.group().lastIndexOf("期")), "periods");
                }
                // 还款方式
                for (MethodRepaymentType type : MethodRepaymentType.values()) {
                    if (data.indexOf(type.toString()) != -1) {
                        convertData(obj, type.name(), "repayMentType");
                        break;
                    }
                }
                // 到期日
                pattern = Pattern.compile("\\d{4}年\\d{1,2}月\\d{1,2}日到期");
                mat = pattern.matcher(data);
                if (mat.find()) {
                    String value = mat.group();
                    convertData(obj, value, "outTime", "date", "yyyy年MM月dd日到期");
                }

                // 贷款类型
                for (LoanStyleType type : LoanStyleType.values()) {
                    if (data.indexOf(type.toString()) != -1) {
                        convertData(obj, type.name(), "loanType");
                        break;
                    }
                }
                // 担保方式
                String tempStr = data.replace("担保", "");
                for (int index = GuaranteeWayType.values().length - 1; index > -1; index--) {
                    GuaranteeWayType type = GuaranteeWayType.values()[index];
                    pattern = Pattern.compile("[,|，]{1}" + type.toString().replace("担保", "") + "(担保)?[,|，]{1}");
                    mat = pattern.matcher(tempStr);
                    if (mat.find()) {
                        convertData(obj, type.name(), "ensureType");
                        break;
                    }
                }
                String status = ParseUtil.getStatusData(data);
                // 贷款状态
                convertData(obj, DeadlineStatusType.OUTSTANDING.name(), "status");
                for (int index = 0; index < DeadlineStatusType.values().length; index++) {
                    DeadlineStatusType type = DeadlineStatusType.values()[index];
                    if (status.indexOf(type.toString()) != -1) {
                        convertData(obj, type.name(), "status");
                        break;
                    }
                }

                // } else if (cardType == PDFTableCardTypeEnum.CREDIT_CARD) {
            } else {
                // 发放机构
                pattern = Pattern.compile(headRegex);
                mat = pattern.matcher(data);
                String org = "";
                if (mat.find()) {
                    String str = mat.group().trim().replace("\"", "").replace("＂", "").replace("“", "")
                            .replace("”", "");
                    int start = str.indexOf("机构");
                    if (start == -1) {
                        start = str.indexOf("日") + 1;
                    } else {
                        start += 2;
                    }
                    int end = str.indexOf("发放的");
                    org = str.substring(start, end);
                    convertData(obj, org, "grantOrganization");
                }

                // 授信额度
                pattern = Pattern.compile("信额度\\d+(,\\d{3})*元");
                mat = pattern.matcher(data);
                if (mat.find()) {
                    convertData(obj, mat.group().substring(3, mat.group().lastIndexOf("元")), "creditAmount", "double",
                            null);
                }
                // 授信额度--美元账户
                pattern = Pattern.compile("信额度折合人民币\\d+(,\\d{3})*元");
                mat = pattern.matcher(data);
                if (mat.find()) {
                    convertData(obj, mat.group().substring("信额度折合人民币".length(), mat.group().lastIndexOf("元")),
                            "creditAmount", "double", null);
                }
                // 担保方式
                String ensureType = "其他";
                if (data.indexOf("信用/免担保") != -1) {
                    ensureType = "信用/免担保";
                }
                convertData(obj, ensureType, "ensureType");
                String status = ParseUtil.getStatusData(data);
                // 截止日状态
                convertData(obj, DeadlineStatusOfCreditCardType.NORMAL.name(), "status");
                for (DeadlineStatusOfCreditCardType type : DeadlineStatusOfCreditCardType.values()) {
                    if (status.indexOf(type.toString()) != -1) {
                        convertData(obj, type.name(), "status");
                        break;
                    }
                }

            }

            // 截止日
            pattern = Pattern.compile("截[至|止]{1}\\d{4}年\\d{1,2}月\\d{1,2}日");
            mat = pattern.matcher(data);
            if (mat.find()) {
                String value = mat.group();
                convertData(obj, value.substring(2, value.length()), "endTime", "date", "yyyy年MM月dd日");
            }
        }
        return obj;
    }

    /**
     * 解析数据,讲处理好的HTML代码,进行解析,并且封装成对象.
     * 
     * @author chenchao
     * @param e
     * @param data
     * @param obj
     *            用来封装数据的对象,
     *            1.如果对象为null,方法会自动创建对象,当程序判定数据为单条时,对象已存在则复用对象,否则创建新对象.
     *            2.如果对象不为null
     *            ,配置节点中,描述的对象与当前对象相同时,贼使用参数对象,否则创建新对象,创建规则与对象为null相同.
     */
    private void loadData(org.jdom2.Element e, Elements data, Object obj) {
        Set<String> titleSet = new HashSet<String>();
        for (org.jdom2.Element el : e.getChildren()) {
            if (el.getAttributeValue("title") != null) {
                titleSet.add(el.getAttributeValue("title"));
            }
        }
        for (org.jdom2.Element el : e.getChildren()) {
            String tag = el.getAttributeValue("tag");// 抓取数据的选择器表达式
            String className = el.getAttributeValue("class");// 对象名称
            String bind = el.getAttributeValue("bind");// 是否绑定一对多对象
            String title = el.getAttributeValue("title");// 开始表头
            List<org.jdom2.Element> items = el.getChildren();
            int col = 1;// 一行对应几组数据
            try {
                col = Integer.parseInt(el.getAttributeValue("col"));
            } catch (Exception ex) {

            }
            Elements rowData = null;
            if (tag == null) {
                rowData = data;
            } else {
                rowData = data.select(tag.trim());
            }
            int startIndex = 0;
            if (title != null) {
                title = title.trim();
                for (Element dataEl : rowData) {
                    if (removeSpac(dataEl.text()).equals(title)) {
                        startIndex = startIndex + (items.size() * col);
                        break;
                    }
                    startIndex++;
                }
            }
            int endIndex = startIndex;
            for (; endIndex < rowData.size(); endIndex++) {
                if (titleSet.contains(removeSpac(rowData.get(endIndex).text()))) {
                    break;
                }
            }
            boolean isMultiterm = false;

            // startIndex 表示开始的节点数
            // endIndex 表示结束的节点数，比如取了10个td，值为10
            // item.size()表示在配置文件里的节点数
            // col表示横着（并排）的一组或几组数据
            // 如果endIndex - startIndex小于配置文件里的节点数==抓取的值少了（数据对应不上）
            // 如果endIndex - startIndex大于配置文件里的节点数==抓取的值多了
            // 在抓取的值多了的情况下，startIndex-endIndex是配置文件里的节点数的整倍数则可以按照配置文件里的节点一一对应的循环抓取存数
            // 在抓取的值多了的情况下，如果配置文件里的节点数的不是整倍数就是抓取的值少了或抓取的值多了。优先检查配置文件是否正确
            if ((endIndex - startIndex) < (items.size() * col)) {
                return;
            } else if ((endIndex - startIndex) > (items.size() * col)) {
                if ((startIndex - endIndex) % (items.size() * col) == 0) {
                    isMultiterm = true;
                } else {
                    return;
                }
            }
            if (isMultiterm) {
                // 处理多行解析 未完成
                multitermData(rowData, startIndex, endIndex, className, items, bind, obj);
            } else {
                // 处理单行解析
                singleData(rowData, startIndex, endIndex, className, items, obj, bind);
            }

        }
    }

    /**
     * 解析的数据是多条时,解析数据方法
     * 
     * @author chenchao
     * @param rowData
     *            解析的数据源
     * @param startIndex
     *            数据源开始标记
     * @param endIndex
     *            数据源结束标记
     * @param className
     *            对象名称
     * @param items
     *            对象填充字段列表
     * @param bind
     *            绑定字段
     * @param bindObj
     *            绑定对象
     */
    @SuppressWarnings("unchecked")
    private void multitermData(Elements rowData, int startIndex, int endIndex, String className,
            List<org.jdom2.Element> items, String bind, Object bindObj) {
        List<Object> dataList = new ArrayList<Object>();
        int rowIndex = 0;
        if (resultMap.containsKey(className)) {
            dataList = (List<Object>) resultMap.get(className);
            if (items.size() > 0) {
                String listCreate = items.get(0).getParentElement().getParentElement().getAttributeValue("listCreate");
                if (listCreate != null && listCreate.trim().equals("true")) {
                    rowIndex = dataList.size();
                }
            }
        }
        // 拼装数据
        for (; startIndex < endIndex;) {
            Object operObj = null;
            if (rowIndex < dataList.size()) {
                operObj = dataList.get(rowIndex);
            } else {
                operObj = createPOJO(className, true);
            }
            boolean isAdd = false;
            for (org.jdom2.Element itemEl : items) {
                isAdd = fillData(itemEl, rowData.get(startIndex).text(), operObj) ? true : isAdd;
                startIndex++;
            }
            if (isAdd) {
                if (rowIndex >= dataList.size()) {
                    dataList.add(operObj);
                }
            }
            rowIndex++;
        }
        if (bindObj != null && bind != null) {
            // 绑定数据
            try {
                BeanUtils.setProperty(bindObj, bind, dataList);
            } catch (Exception e) {

            }
        } else {
            if (dataList.size() > 0 && !resultMap.containsKey(className)) {
                resultMap.put(className, dataList);
            }
        }

    }

    /**
     * 单条数据拼装
     * 
     * @author chenchao
     * @param startIndex
     * @param endIndex
     * @param className
     * @param items
     */
    private void singleData(Elements rowData, int startIndex, int endIndex, String className,
            List<org.jdom2.Element> items, Object obj, String bind) {
        Object operObj = null;
        List<Object> list = new ArrayList<Object>();
        // 拼装数据
        for (; startIndex < endIndex;) {
            if (obj != null && (bind == null || bind.trim().equals(""))) {
                operObj = obj;
            } else {
                operObj = createPOJO(className, false);
            }
            boolean isAdd = false;
            for (org.jdom2.Element itemEl : items) {
                isAdd = fillData(itemEl, rowData.get(startIndex).text(), operObj) ? true : isAdd;
                startIndex++;
            }
            if (isAdd && (obj == null || bind != null && !bind.trim().equals(""))) {
                if (obj != null && bind != null) {
                    // 绑定数据
                    try {
                        list.add(operObj);
                        BeanUtils.setProperty(obj, bind, list);
                    } catch (Exception e) {

                    }
                } else {
                    insertResult(className, operObj);
                }
            }
        }
    }

    /**
     * 获取指定包含指定选择器(tag) 内容集合,当tag为空时,不做任何选择筛选
     * 
     * @author chenchao
     * @param data
     *            要查找的数据节点
     * @param tag
     *            选择器表达式
     * @return
     */
    private Elements getTag(Element data, String tag, String startStr) {
        Elements list = new Elements();
        if (startStr != null) {
            if (startStr.equals("repayMentAmount") && data != null) {
                Elements eleList = new Elements();
                Elements subList = new Elements();
                String strList = null;
                Document doc = new Document("");
                Element e = null;
                eleList.add(data);
                strList = eleList.get(0).text();
                StringBuffer str = new StringBuffer();
                str.append(strList.replaceAll("|", "").replace("|", ""));
                for (int i = 0; i < str.length(); i++) {
                    e = doc.createElement("td");
                    e.append(String.valueOf(str.charAt(i)));
                    list.add(e);
                }
                return list;
            }
        }
        if (tag == null) {
            list.add(data);
        } else {
            // @author chenchao
            // 剔除一行为空的tr
            for (Element e : data.select(tag)) {
                if (!removeSpac(e.text()).equals("")) {
                    list.add(e);
                }
            }
        }
        return list;
    }

    /**
     * 将多条数据 按照表头拆分成小组,每一组数据对应的是一条贷款数据
     * 
     * @author chenchao
     * @param dataList
     * @param e
     * @return
     */
    private List<Elements> splitData(Elements dataList, org.jdom2.Element e) {
        List<Elements> result = new ArrayList<Elements>();
        String headTag = e.getAttributeValue("headTag");
        if (headTag == null) {
            result.add(dataList);
        } else {
            String headRegex = e.getAttributeValue("headRegex");
            String removeEmpty = e.getAttributeValue("removeEmpty");
            if (headRegex == null) {
                headRegex = HEAD_REGEX;
            }
            Elements groupData = new Elements();
            result.add(groupData);
            boolean isFirst = true;
            for (Element data : dataList) {
                String text = removeSpac(data.text());
                if (!("true".equals(removeEmpty) && text.trim().equals(""))) {
                    String head = removeSpac(data.select(headTag).text());
                    Pattern pattern = Pattern.compile(headRegex);
                    Matcher mat = pattern.matcher(head);
                    if (mat.find()) {
                        if (isFirst) {
                            isFirst = false;
                        } else {
                            groupData = new Elements();
                            result.add(groupData);
                        }
                    }
                    groupData.add(data);
                }
            }
        }
        return result;
    }

    /**
     * 判断当前内容是否为下一个节点
     * 
     * @author chenchao
     * @param data
     * @param titleIndex
     *            开始索引
     * @return
     */
    private boolean checkIsEnd(Element data, int titleIndex) {
        String text = removeSpac(data.text());
        for (int i = titleIndex + 1; i < titleList.size(); i++) {
            Pattern pattern = Pattern.compile(titleList.get(i));
            Matcher mat = pattern.matcher(text);
            if (mat.matches()) {
                return true;
            }
        }
        return false;
    }

    /**
     * 获取指定的父节点
     * 
     * @author chenchao
     * @param el
     *            节点对象
     * @param parent
     *            当是数字的时候,为父节点的层级,例如2,当前节点父亲的父亲,以此类推
     *            当节点是文字时,为节点名称,如table,向上一直去父节点,直到找到table为止
     * @return
     */
    @SuppressWarnings("unused")
    private Element getParent(Element el, String parent) {
        if (parent == null || parent.trim().equals(""))
            return el;
        int count = -1;
        try {
            count = Integer.parseInt(parent);
        } catch (Exception e) {

        }
        boolean doWhile = true;
        while (doWhile) {
            el = el.parent();
            if (count != -1) {
                doWhile = --count != 0;
            } else if (el.tagName().equals(parent.trim())) {
                doWhile = false;
            } else if (el == null) {
                doWhile = false;
            }
        }
        return el;
    }

    /**
     * 获取指定的父节点对象
     * 
     * @author chenchao
     * @param el
     * @param skip
     *            参数可以是节点名或数字,数字代表向上多少级,节点名则检查第一个符合节点名的父节点.
     * @return
     */
    private Element skipParent(Element el, String skip) {
        if (skip == null || skip.trim().equals(""))
            return el;
        int count = -1;
        try {
            count = Integer.parseInt(skip);
        } catch (Exception e) {

        }
        Elements list = el.parent().children();
        int index = list.indexOf(el);
        if (count != -1) {
            return list.get(index + count);
        } else {
            while (!list.get(++index).tagName().equals(skip.trim())) {

            }
            return list.get(index);
        }
    }

    /**
     * 剔除对应的内容
     * 
     * @author chenchao
     * @param str
     * @return
     */
    private String removeSpac(String str) {
        if (str == null)
            return "";
        return str.replaceAll("\\s+", "").replace(" ", "");
    }

    public void setParseXML(String parseXML) {
        this.parseXML = parseXML;
    }

    public String setHtml(String file) {
        File input = new File(file);
        Document dochtml = null;
        try {
            dochtml = Jsoup.parse(input, getCharset(input));
            body = dochtml.body();
            String result = body.html().trim();
            setHtmlStr(result);
        } catch (IOException e) {

        }
        return this.html;
    }

    public String setHtmlStr(String html) {
        this.html = StringEscapeUtils.unescapeHtml(html);
        // if (body == null) {
        Document dochtml = Jsoup.parse(this.html);
        body = dochtml.body();
        // }
        return this.html;
    }

    private void insertResult(String className, Object obj) {
        if (!resultMap.containsKey(className)) {
            resultMap.put(className, obj);
        }
    }

    /**
     * 创建对象
     * 
     * @author chenchao
     * @param className
     * @param isCreate
     *            当为true时,创建新对象,当为false时,先查询记录是否存在,不存在再创建
     * @return
     */
    private Object createPOJO(String className, boolean isCreate) {
        String finalClassName = "";
        if (className.indexOf(".") == -1) {
            finalClassName = PACKAGE + className;
        } else {
            finalClassName = className;
        }
        if (!isCreate && resultMap.containsKey(className)) {
            return resultMap.get(className);
        }
        Class<?> objClass;
        try {
            objClass = Class.forName(finalClassName);
            return objClass.newInstance();
        } catch (Exception e) {
            // TODO Auto-generated catch block
            // e.printStackTrace();
        }
        return null;
    }

    /**
     * 填充数据
     * 
     * @author chenchao
     * @param item
     *            填充配置节点
     * @param data
     *            被填充的数据
     * @return
     */
    private boolean fillData(org.jdom2.Element item, String data, Object pojo) {
        String value = item.getAttributeValue("value");
        String type = item.getAttributeValue("type");
        String format = item.getAttributeValue("format");
        String find = item.getAttributeValue("find");
        String replace = item.getAttributeValue("replace") == null ? "" : item.getAttributeValue("replace");
        String start = item.getAttributeValue("start");
        String end = item.getAttributeValue("end");
        data = removeSpac(data);
        // @author wanghan
        // 当一个标签里包含想要的信息时，在item标签里配置start，end为开始结束截取信息
        if (start != null && end != null && !start.trim().equals("") && !end.trim().equals("")) {
            int startIndex = -1;
            int endIndex = -1;
            startIndex = data.indexOf(start) + start.length();
            endIndex = data.indexOf(end);
            if (startIndex != -1 && endIndex != -1) {
                data = data.substring(startIndex, endIndex);
            }

        }

        if (find != null && !find.trim().equals("")) {
            data = data.replace(find, replace);
            data = data.replaceAll(find, replace);
        }
        if ("".equals(data) || "--".equals(data)) {
            return false;
        }
        if (value != null) {
            return convertData(pojo, data, value, type, format);
        }
        return false;
    }

    /**
     * 转换数据并填充
     * 
     * @author chenchao
     * @param pojo
     *            填充的对象
     * @param data
     *            填充的数据
     * @param field
     *            字段名
     * @param type
     *            数据类型
     * @param format
     *            格式化规则
     * @return
     */
    private boolean convertData(Object pojo, String data, String field, String type, String format) {
        try {
            Object result = removeSpac(data);
            if ("date".equals(type)) {
                DateFormat dd = new SimpleDateFormat(format);
                result = dd.parse(data);
            } else if ("double".equals(type)) {
                result = new Double(data.replace(",", ""));
            }
            BeanUtils.setProperty(pojo, field, result);
            return true;
        } catch (Exception e) {

        }
        return false;
    }

    /**
     * 转换数据并填充
     * 
     * @author chenchao
     * @param pojo
     *            填充的对象
     * @param data
     *            填充的数据
     * @param field
     *            字段名
     * @return
     */
    private boolean convertData(Object pojo, String data, String field) {
        return convertData(pojo, data, field, null, null);
    }

    /**
     * 检测字符集
     * 
     * @author wanghan
     * @param input
     * @return
     */
    private String getCharset(File input) {
        String[] charsets = new String[] { "GBK", "UTF8", "unicode" };
        for (String charset : charsets) {
            try {
                Document doc = Jsoup.parse(input, charset);
                Elements eles = doc.select("meta[http-equiv=Content-Type]");
                if (eles.size() > 0) {
                    String content = eles.attr("content");
                    if (content != null) {
                        for (String str : content.split(";")) {
                            if (str.trim().indexOf("charset") != -1) {
                                charset = str.split("=")[1].trim();
                                if (charset.equals("x-cp20936")) {
                                    charset = "GBK";
                                }
                            }
                        }
                    }
                    return charset;
                }

            } catch (IOException e) {

            }
        }
        return "GBK";
    }

    // public Boolean fillStr(Object pojo, List list) {
    // if (list.size() == 24) {
    // if (pojo.getClass().equals(RiskCreditLoanDetail.class)) {
    // RiskCreditLoanDetail riskCreditLoanDetail = (RiskCreditLoanDetail) pojo;
    // riskCreditLoanDetail.setRepayMentAmount1(list.get(0).toString());
    // riskCreditLoanDetail.setRepayMentAmount2(list.get(1).toString());
    // riskCreditLoanDetail.setRepayMentAmount3(list.get(2).toString());
    // riskCreditLoanDetail.setRepayMentAmount4(list.get(3).toString());
    // riskCreditLoanDetail.setRepayMentAmount5(list.get(4).toString());
    // riskCreditLoanDetail.setRepayMentAmount6(list.get(5).toString());
    // riskCreditLoanDetail.setRepayMentAmount7(list.get(6).toString());
    // riskCreditLoanDetail.setRepayMentAmount8(list.get(7).toString());
    // riskCreditLoanDetail.setRepayMentAmount9(list.get(8).toString());
    // riskCreditLoanDetail.setRepayMentAmount10(list.get(9).toString());
    // riskCreditLoanDetail.setRepayMentAmount11(list.get(10).toString());
    // riskCreditLoanDetail.setRepayMentAmount12(list.get(11).toString());
    // riskCreditLoanDetail.setRepayMentAmount13(list.get(12).toString());
    // riskCreditLoanDetail.setRepayMentAmount14(list.get(13).toString());
    // riskCreditLoanDetail.setRepayMentAmount15(list.get(14).toString());
    // riskCreditLoanDetail.setRepayMentAmount16(list.get(15).toString());
    // riskCreditLoanDetail.setRepayMentAmount17(list.get(16).toString());
    // riskCreditLoanDetail.setRepayMentAmount18(list.get(17).toString());
    // riskCreditLoanDetail.setRepayMentAmount19(list.get(18).toString());
    // riskCreditLoanDetail.setRepayMentAmount20(list.get(19).toString());
    // riskCreditLoanDetail.setRepayMentAmount21(list.get(20).toString());
    // riskCreditLoanDetail.setRepayMentAmount22(list.get(21).toString());
    // riskCreditLoanDetail.setRepayMentAmount23(list.get(22).toString());
    // riskCreditLoanDetail.setRepayMentAmount24(list.get(23).toString());
    // resultMap.put("RiskCreditLoanDetail", riskCreditLoanDetail);
    // } else if (pojo.getClass().equals(RiskLoanCard.class)) {
    // RiskLoanCard riskLoanCard = (RiskLoanCard) pojo;
    // riskLoanCard.setRepayMentAmount1(list.get(0).toString());
    // riskLoanCard.setRepayMentAmount2(list.get(1).toString());
    // riskLoanCard.setRepayMentAmount3(list.get(2).toString());
    // riskLoanCard.setRepayMentAmount4(list.get(3).toString());
    // riskLoanCard.setRepayMentAmount5(list.get(4).toString());
    // riskLoanCard.setRepayMentAmount6(list.get(5).toString());
    // riskLoanCard.setRepayMentAmount7(list.get(6).toString());
    // riskLoanCard.setRepayMentAmount8(list.get(7).toString());
    // riskLoanCard.setRepayMentAmount9(list.get(8).toString());
    // riskLoanCard.setRepayMentAmount10(list.get(9).toString());
    // riskLoanCard.setRepayMentAmount11(list.get(10).toString());
    // riskLoanCard.setRepayMentAmount12(list.get(11).toString());
    // riskLoanCard.setRepayMentAmount13(list.get(12).toString());
    // riskLoanCard.setRepayMentAmount14(list.get(13).toString());
    // riskLoanCard.setRepayMentAmount15(list.get(14).toString());
    // riskLoanCard.setRepayMentAmount16(list.get(15).toString());
    // riskLoanCard.setRepayMentAmount17(list.get(16).toString());
    // riskLoanCard.setRepayMentAmount18(list.get(17).toString());
    // riskLoanCard.setRepayMentAmount19(list.get(18).toString());
    // riskLoanCard.setRepayMentAmount20(list.get(19).toString());
    // riskLoanCard.setRepayMentAmount21(list.get(20).toString());
    // riskLoanCard.setRepayMentAmount22(list.get(21).toString());
    // riskLoanCard.setRepayMentAmount23(list.get(22).toString());
    // riskLoanCard.setRepayMentAmount24(list.get(23).toString());
    // resultMap.put("RiskLoanCard", riskLoanCard);
    // } else if (pojo.getClass().equals(RiskPrepLoanCard.class)) {
    // RiskPrepLoanCard riskPrepLoanCard = (RiskPrepLoanCard) pojo;
    // riskPrepLoanCard.setRepayMentAmount1(list.get(0).toString());
    // riskPrepLoanCard.setRepayMentAmount2(list.get(1).toString());
    // riskPrepLoanCard.setRepayMentAmount3(list.get(2).toString());
    // riskPrepLoanCard.setRepayMentAmount4(list.get(3).toString());
    // riskPrepLoanCard.setRepayMentAmount5(list.get(4).toString());
    // riskPrepLoanCard.setRepayMentAmount6(list.get(5).toString());
    // riskPrepLoanCard.setRepayMentAmount7(list.get(6).toString());
    // riskPrepLoanCard.setRepayMentAmount8(list.get(7).toString());
    // riskPrepLoanCard.setRepayMentAmount9(list.get(8).toString());
    // riskPrepLoanCard.setRepayMentAmount10(list.get(9).toString());
    // riskPrepLoanCard.setRepayMentAmount11(list.get(10).toString());
    // riskPrepLoanCard.setRepayMentAmount12(list.get(11).toString());
    // riskPrepLoanCard.setRepayMentAmount13(list.get(12).toString());
    // riskPrepLoanCard.setRepayMentAmount14(list.get(13).toString());
    // riskPrepLoanCard.setRepayMentAmount15(list.get(14).toString());
    // riskPrepLoanCard.setRepayMentAmount16(list.get(15).toString());
    // riskPrepLoanCard.setRepayMentAmount17(list.get(16).toString());
    // riskPrepLoanCard.setRepayMentAmount18(list.get(17).toString());
    // riskPrepLoanCard.setRepayMentAmount19(list.get(18).toString());
    // riskPrepLoanCard.setRepayMentAmount20(list.get(19).toString());
    // riskPrepLoanCard.setRepayMentAmount21(list.get(20).toString());
    // riskPrepLoanCard.setRepayMentAmount22(list.get(21).toString());
    // riskPrepLoanCard.setRepayMentAmount23(list.get(22).toString());
    // riskPrepLoanCard.setRepayMentAmount24(list.get(23).toString());
    // resultMap.put("RiskPrepLoanCard", riskPrepLoanCard);
    // }
    // }
    // return true;
    // }

}
