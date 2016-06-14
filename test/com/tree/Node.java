package com.tree;

public class Node {

	public long data;

	public String sData;

	public Node leftChild;

	public Node rightChild;

	public Node(long data) {
		this.data = data;
	}

	public Node(long data, String sData) {
		this.data = data;
		this.sData = sData;
	}
}
