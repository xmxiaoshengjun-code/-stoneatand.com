#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
水印检测与去除脚本
- 检测带 TSIANFAN 橙色水印的产品图片
- 用 cv2.inpaint + 颜色阈值去除水印
"""
import os
import sys
import cv2
import numpy as np
from pathlib import Path

PRODUCT_DIR = Path("C:/Users/Sean xiao/WorkBuddy/2026-08-04-09-49-32/qianfan-website/public/images/products")
TEST_OUTPUT_DIR = Path("C:/Users/Sean xiao/WorkBuddy/2026-08-04-09-49-32/qianfan-website/scripts/output/watermark-test")
TEST_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def detect_watermark_mask(img):
    """
    检测图片中的橙色水印区域，返回二值 mask。
    橙色水印颜色特征: 高 R, 中 G, 低 B (HSV 中为暖色调)
    """
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

    # 橙色范围: H 在 0-25 或 160-180 (覆盖红橙到橙黄)
    # S 和 V 都要足够高才是显眼的橙色文字
    lower_orange1 = np.array([0, 80, 100])
    upper_orange1 = np.array([25, 255, 255])
    lower_orange2 = np.array([160, 80, 100])
    upper_orange2 = np.array([180, 255, 255])

    mask1 = cv2.inRange(hsv, lower_orange1, upper_orange1)
    mask2 = cv2.inRange(hsv, lower_orange2, upper_orange2)
    mask = cv2.bitwise_or(mask1, mask2)

    return mask


def has_watermark(mask, min_pixels=500):
    """判断 mask 中是否有足够多的橙色像素 (避免误报)"""
    return cv2.countNonZero(mask) > min_pixels


def remove_watermark(img, mask):
    """
    使用 inpaint 去除水印
    - 先膨胀 mask 以覆盖水印的边缘过渡像素
    - 然后用 cv2.inpaint 填充
    """
    # 膨胀 mask，连接断开的笔画，扩展边缘
    kernel = np.ones((3, 3), np.uint8)
    dilated = cv2.dilate(mask, kernel, iterations=2)

    # inpaint：周围像素插值填充
    # inpaintRadius 越大，平滑效果越强 (3-5 通常够用)
    result = cv2.inpaint(img, dilated, inpaintRadius=5, flags=cv2.INPAINT_TELEA)

    return result


def process_image(img_path, output_dir, verbose=False):
    """处理单张图片: 检测 + 去除 + 保存"""
    img = cv2.imread(str(img_path))
    if img is None:
        if verbose:
            print(f"  [SKIP] {img_path.name}: 无法读取")
        return None

    mask = detect_watermark_mask(img)
    pixel_count = cv2.countNonZero(mask)

    if not has_watermark(mask):
        if verbose:
            print(f"  [CLEAN] {img_path.name}: 无水印 ({pixel_count} 像素)")
        return "clean"

    # 有水印，去除
    result = remove_watermark(img, mask)

    # 保存原图 mask 预览和处理结果
    out_path = output_dir / img_path.name
    cv2.imwrite(str(out_path), result)

    if verbose:
        print(f"  [WATERMARK] {img_path.name}: {pixel_count} 橙色像素 -> {out_path}")

    return "watermark"


def scan_and_process(verbose=True):
    """扫描所有图片，统计有/无水印的数量"""
    stats = {"clean": 0, "watermark": 0, "error": 0}
    watermark_files = []

    img_files = sorted([f for f in PRODUCT_DIR.iterdir() if f.suffix.lower() in (".jpg", ".jpeg", ".png")])
    print(f"扫描 {len(img_files)} 张图片...")

    for i, img_path in enumerate(img_files, 1):
        result = process_image(img_path, TEST_OUTPUT_DIR, verbose=False)
        if result is None:
            stats["error"] += 1
        else:
            stats[result] += 1
            if result == "watermark":
                watermark_files.append(img_path.name)

        if verbose and i % 20 == 0:
            print(f"  进度: {i}/{len(img_files)}")

    print(f"\n扫描结果:")
    print(f"  无水印: {stats['clean']}")
    print(f"  有水印: {stats['watermark']}")
    print(f"  读取错误: {stats['error']}")
    print(f"\n水印文件清单已写入 scripts/output/watermark-list.txt")

    with open("C:/Users/Sean xiao/WorkBuddy/2026-08-04-09-49-32/qianfan-website/scripts/output/watermark-list.txt", "w") as f:
        for name in watermark_files:
            f.write(name + "\n")

    return stats


if __name__ == "__main__":
    scan_and_process()