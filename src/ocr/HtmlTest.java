/**
 * Copyright(c) 2013-2014 by Puhuifinance Inc.
 * All Rights Reserved
 */
package com.puhui;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.Map;

import com.puhui.tools.supplement.parse.impl.HtmlParse2;
import com.puhui.tools.supplement.util.ParseTemplateType;

/**
 * @author chenchao
 */
public class HtmlTest {

    /**
     * @author chenchao
     * @param args
     * @throws IOException
     */
    // 2.0
    @SuppressWarnings({ "rawtypes", "unused" })
    public static void main(String[] args) throws IOException {
        HtmlParse2 html = new HtmlParse2();
        BufferedReader br = new BufferedReader(new InputStreamReader(HtmlTest.class.getClassLoader()
                .getResourceAsStream(ParseTemplateType.WUBIAOTOU_BANK.getFileName())));
        StringBuilder b = new StringBuilder();
        String str = null;
        while ((str = br.readLine()) != null) {
            b.append(str);
        }
        html.setParseXML(b.toString());
        html.setHtml("C:/Users/jhgjj/Desktop/测试/普兴洪---补对账单.html");
        Map map = html.parse();
        System.out.println(map.size());
    }

    // 1.0
    // @SuppressWarnings({ "rawtypes", "unused" })
    // public static void main(String[] args) throws IOException {
    // HtmlParse html = new HtmlParse();
    // BufferedReader br = new BufferedReader(new
    // InputStreamReader(html.getClass().getClassLoader()
    // .getResourceAsStream(ParseTemplateType.MINSHENG_BANK.getFileName())));
    // StringBuilder b = new StringBuilder();
    // String str = null;
    // while ((str = br.readLine()) != null) {
    // b.append(str);
    // }
    // html.setParseXML(b.toString());
    // Map map = html.parse("C:/Users/jhgjj/Desktop/79405.htm");
    // System.out.println(map.size());
    // }
}
