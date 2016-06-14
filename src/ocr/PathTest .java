/**
 * Copyright(c) 2013-2015 by Puhuifinance Inc.
 * All Rights Reserved
 */
package NIO;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.io.StringReader;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.beanutils.BeanUtils;
import org.apache.commons.lang.StringEscapeUtils;
import org.jdom2.input.SAXBuilder;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import com.puhui.model.risk.credit.RiskCreditBase;
import com.puhui.tools.supplement.util.ParseTemplateType;

/**
 * @author wanghan
 */
public class PathTest {
    // 文件夹路径
    static String filePath = "C:/Users/jhgjj/Desktop/ocr/";
    // 默认的包路径
    static String PACKAGE = "com.puhui.model.risk.credit.";
    // html文本
    static String html = "";
    // 解析需要的配置文件
    static String xml = "";
    // 用来储存结果集,向后兼容
    static Map mapRuselt = new HashMap<String, Object>();

    public static void main(String[] args) {
        Path p = Paths.get(filePath);
        // html
        String body = "";
        // 创建jsoup，Document对象
        Document dochtml = null;
        // 利用TWR自动关闭资源
        try (DirectoryStream<Path> stream = Files.newDirectoryStream(p, "*.*")) {
            for (Path entry : stream) {
                body = setHtml(entry.getParent().toString() + "\\" + entry.getFileName());
                dochtml = Jsoup.parse(body);
                HtmlParse(dochtml, setXml());
            }
        } catch (final Exception e) {
            e.printStackTrace();
        }
    }

    // 获得html文本信息
    public static String setHtml(String file) {
        File input = new File(file);
        Document dochtml = null;
        Element body = null;
        try {
            dochtml = Jsoup.parse(input, "GBK");
            if (dochtml != null) {
                body = dochtml.body();
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return html = StringEscapeUtils.unescapeHtml(body.html());
    }

    // 获得解析配置文件
    public static String setXml() {
        StringBuilder b = new StringBuilder();
        try (BufferedReader br = new BufferedReader(new InputStreamReader(PathTest.class.getClassLoader()
                .getResourceAsStream(ParseTemplateType.YINHANGZHUANYEC_BANK.getFileName())));) {
            String str = null;
            while ((str = br.readLine()) != null) {
                b.append(str);
            }
        } catch (final Exception e) {
            e.printStackTrace();
        }
        return xml = String.valueOf(b);

    }

    // 解析器
    public static void HtmlParse(Document dochtml, String xmlhtml) {
        // 使用SAXBuilder操作xml
        SAXBuilder builder = new SAXBuilder();
        try (Reader xmlReader = new StringReader(xmlhtml)) {
            org.jdom2.Document docxml = builder.build(xmlReader);
            org.jdom2.Element root = docxml.getRootElement(); // 获取跟节点
            for (org.jdom2.Element e : root.getChildren()) {
                if (e.getName().equals("path")) {
                    parsePath(e, dochtml.children());
                }
            }
        } catch (final Exception e) {
            e.printStackTrace();
        }
    }

    // 通过几点属性解析文本
    public static void parsePath(org.jdom2.Element e, Elements elementHtml) {
        String start = e.getAttributeValue("start");
        String parent = e.getAttributeValue("parent");
        String skip = e.getAttributeValue("skip");
        String tag = e.getAttributeValue("tag");
        Elements elList = elementHtml.select(start);
        int elListNum = elList.size();
        for (int i = 0; i < elListNum; i++) {
            Element elListString = elList.get(i);
            Element data = getParent(elListString, parent);
            data = skipParent(data, skip);
            loadData(e, getTag(data, tag));
        }

    }

    // 获取父节点
    public static Element getParent(Element el, String parent) {
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

    // 向下跳节点
    public static Element skipParent(Element el, String skip) {
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

    // 过滤标签
    public static Elements getTag(Element data, String tag) {
        Elements list = new Elements();
        if (tag == null) {
            list.add(data);
        } else {
            for (Element e : data.select(tag)) {
                if (!e.text().equals("")) {
                    list.add(e);
                }
            }
        }
        return list;
    }

    // 通过配置子标签过虐文本
    public static void loadData(org.jdom2.Element e, Elements data) {
        for (org.jdom2.Element el : e.getChildren()) {
            String tag = el.getAttributeValue("tag");// 抓取数据的选择器表达式
            String className = el.getAttributeValue("class");// 对象名称
            java.util.List<org.jdom2.Element> items = el.getChildren();
            Elements rowData = null;
            if (tag == null) {
                rowData = data;
            } else {
                rowData = data.select(tag.trim());
            }
            // 绑定元素
            singleData(className, rowData, el, items);

        }
    }

    // 绑定元素
    public static void singleData(String className, Elements rowData, org.jdom2.Element e, List<org.jdom2.Element> items) {
        try {
            // 动态创建对象
            Object pojo = createPOJO(className);
            // 用来储存值
            Object result = null;
            // 用来接收值
            String data = null;
            if (pojo == null) {
                // 返回false或不进行组装
            }
            // 通过孙子标签属性定位值
            for (int i = 0; i < items.size(); i++) {
                String value = items.get(i).getAttributeValue("value");
                String type = items.get(i).getAttributeValue("type");
                String format = items.get(i).getAttributeValue("format");
                data = rowData.get(i).text();
                if ("date".equals(type)) {
                    DateFormat dd = new SimpleDateFormat(format);
                    result = dd.parse(data);
                } else if ("double".equals(type)) {
                    result = new Double(data.replace(",", ""));
                } else {
                    result = data;
                }
                BeanUtils.setProperty(pojo, value, result);
            }
            mapRuselt.put(className, pojo);
            display(mapRuselt);
        } catch (Exception ee) {
            ee.printStackTrace();
        }
    }

    public static Object createPOJO(String className) {
        // 用来存储类文件路径
        String finalClassName = "";
        if (className.indexOf(".") == -1) {
            finalClassName = PACKAGE + className;
        } else {
            finalClassName = className;
        }
        Class<?> objClass;
        try {
            // 通过反射动态加载类
            objClass = Class.forName(finalClassName);
            return objClass.newInstance();
        } catch (Exception e) {
 		e.printStackTrace();
        }
        return null;
    }

    public static void display(Map<String, Object> map) {
        for (String s : map.keySet()) {
            if (s.equals("RiskCreditBase")) {
                RiskCreditBase riskCreditBase = (RiskCreditBase) map.get(s);
                System.out.println("增删改查等操作---------------------");
                System.out.println(riskCreditBase.getName());
                System.out.println(riskCreditBase.getType());
                System.out.println(riskCreditBase.getCredentialsNo());
            }
        }

    }
}
