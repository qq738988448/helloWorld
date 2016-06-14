package com.tree;

public class test {
	public static void main(String[] args) {
		tree tree = new tree();
		tree.insert(12, "wang");
		tree.insert(11, "Li");
		tree.insert(10, "zhao");
		tree.insert(13, "qian");
		tree.insert(14, "Sun");
		System.out.println(tree.root.data);
		System.out.println(tree.root.rightChild.data + "," + tree.root.rightChild.sData);
		System.out.println(tree.root.rightChild.rightChild.data);
		System.out.println(tree.root.leftChild.data);
		System.out.println(tree.root.leftChild.leftChild.data);
	}
}
