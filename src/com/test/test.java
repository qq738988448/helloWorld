/**
 * Copyright(c) 2013-2016 by Puhuifinance Inc.
 * All Rights Reserved
 */
package com.test;

/**
 * @author wanghan
 */
public class test {
	public static void sort(long[] arr) {
		long tmp = 0;
		for (int i = 1; i < arr.length; i++) {
			tmp = arr[i];
			int j = i;
			while (j > 0 && arr[j] >= tmp) {
				arr[j] = arr[j - 1];
				j--;
			}
			arr[j] = tmp;
		}
	}

	public static void main(String[] args) {
		long[] arr = new long[5];
		arr[0] = 31;
		arr[1] = 1;
		arr[2] = 3;
		arr[3] = 23;
		arr[4] = -4;
		System.out.print("[");
		for (long a : arr) {
			System.out.print(" " + a);
		}
		System.out.print("]");
		sort(arr);
		System.out.print("[");
		for (long a : arr) {
			System.out.print(" " + a);
		}
		System.out.print("]");
	}

}
