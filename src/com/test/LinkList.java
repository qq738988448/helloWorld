/**
 * Copyright(c) 2013-2015 by Puhuifinance Inc.
 * All Rights Reserved
 */
package com.test;

import java.text.DecimalFormat;
import java.util.ArrayList;

/**
 * 链表，相当于火车头
 * 
 * @author wanghan
 */
public class LinkList {
	private Node first;

	public LinkList() {
		first = null;
	}

	/**
	 * 插入一个节点。在头结点后进行插入
	 */
	public void insertFirst(long value) {
		Node node = new Node(value);
		if (first == null) {
			first = node;
		} else {
			node.next = first;
			first = node;
		}

	}

	/**
	 * 删除一个节点，早头结点后进行删除
	 */
	public Node deleteFirst() {
		Node tmp = first;
		first = tmp.next;
		return tmp;
	}

	/**
	 * 显示方法
	 */
	public void display() {
		Node current = first;
		while (current != null) {
			current.display();
			current = current.next;
		}
		System.out.println();
	}

	/**
	 * 查找方法
	 */
	public Node find(long value) {
		Node current = first;
		while (current.data != value) {
			if (current.next == null) {
				return null;
			}
		}
		return current;
	}

	public static void main(String[] args) {
		for (int x = 0; x < 100_000; x++) {
			ArrayList<Integer> list = new ArrayList<Integer>();
			list.add(1);
			list.add(2);
			list.add(3);
			list.add(4);
			list.add(5);
			list.add(6);
			list.add(7);
			list.add(8);
			list.add(9);
			list.add(10);
			list.add(11);
			list.add(12);
			DecimalFormat df = new DecimalFormat("#");
			String index = null;
			int index_ = 0;
			for (int i = 0; i < list.size(); i++) {
				System.out.print("[" + list.get(i) + "]");
			}
			System.out.println();
			int i = list.size();
			for (; i > 0; i--) {
				index = df.format(Math.random() * list.size());
				if (Integer.valueOf(index) > 0) {
					index_ = Integer.valueOf(index) - 1;
				} else {
					index_ = 0;
				}
				System.out.println("[" + list.get(index_) + "]");
				list.remove(index_);
			}
			System.out.println();
			for (int j = 0; j < list.size(); j++) {
				System.out.print("[" + list.get(j) + "]");
			}
			System.out.println("---------------------->" + x);
		}
	}
}
