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
 * @author wanghan
 */
public class HtmlTest {

    /**
     * @author wanghan
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

}
