/**
 * Copyright(c) 2013-2015 by Puhuifinance Inc.
 * All Rights Reserved
 */
package com.test;

/**
 * 连接点，相当于车厢
 * 
 * @author wanghan
 */
public class Node {
	// 数据域
	public long data;
	// 指针域
	public Node next;

	public Node(long value) {
		this.data = value;
	}

	/**
	 * 显示方法
	 */
	public void display() {
		System.out.print(data + " ");
	}
}
