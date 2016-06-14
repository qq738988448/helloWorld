package test;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * @author: jhgjj Date: 2016/5/27 Time: 16:42
 */
public class NullTest {
    private static final Logger logger = LoggerFactory.getLogger(NullTest.class);

    public static void main(String[] args) {
        String a = "11,22,33,44";
        String[] b ;
        for (int i = 0; i <= a.length(); i++) {
            b = a.split(",");
            System.out.println(b);
        }
    }
}
