#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
为水印图片生成白底占位图
- 白底
- 中心显示大号 SKU 编码
- 顶部小 TSIANFAN 品牌标识
- 底部小规格标签
"""
import cv2
import numpy as np
from pathlib import Path

PRODUCT_DIR = Path("C:/Users/Sean xiao/WorkBuddy/2026-08-04-09-49-32/qianfan-website/public/images/products")
WATERMARK_LIST = Path("C:/Users/Sean xiao/WorkBuddy/2026-08-04-09-49-32/qianfan-website/scripts/output/watermark-list.txt")


def generate_placeholder(sku_code, target_size=(850, 850)):
    """生成白底占位图 (保持原图尺寸)"""
    width, height = target_size
    img = np.ones((height, width, 3), dtype=np.uint8) * 255

    # 顶部品牌标识
    cv2.putText(img, "TSIANFAN", (40, 60),
                cv2.FONT_HERSHEY_SIMPLEX, 1.0, (80, 80, 80), 2, cv2.LINE_AA)
    cv2.putText(img, "Display Rack Manufacturer", (40, 88),
                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (140, 140, 140), 1, cv2.LINE_AA)

    # 中间分隔线
    cv2.line(img, (40, 110), (width - 40, 110), (200, 200, 200), 1)

    # 中心 SKU 编码 (主视觉) - 用 TRIPLEX (粗体)
    # 根据宽度自适应字体大小
    if width >= 1000:
        font_scale = 4.5
        thickness = 10
    elif width >= 800:
        font_scale = 3.5
        thickness = 8
    else:
        font_scale = 2.5
        thickness = 6

    text_size = cv2.getTextSize(sku_code, cv2.FONT_HERSHEY_TRIPLEX, font_scale, thickness)[0]
    text_x = (width - text_size[0]) // 2
    text_y = (height + text_size[1]) // 2
    cv2.putText(img, sku_code, (text_x, text_y),
                cv2.FONT_HERSHEY_TRIPLEX, font_scale, (40, 40, 40), thickness, cv2.LINE_AA)

    # SKU 下方小标签
    label = "Product Image"
    label_size = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 1.0, 2)[0]
    label_x = (width - label_size[0]) // 2
    cv2.putText(img, label, (label_x, text_y + 60),
                cv2.FONT_HERSHEY_SIMPLEX, 1.0, (150, 150, 150), 2, cv2.LINE_AA)

    # 底部边框 + 标语
    cv2.line(img, (40, height - 100), (width - 40, height - 100), (200, 200, 200), 1)
    cv2.putText(img, "Please contact us for product details", (40, height - 60),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (120, 120, 120), 1, cv2.LINE_AA)
    cv2.putText(img, "Email: info@tsianfan.com  |  www.tsianfan.com", (40, height - 30),
                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (140, 140, 140), 1, cv2.LINE_AA)

    return img


def get_target_size(original_path):
    """获取原图尺寸以保持一致"""
    img = cv2.imread(str(original_path))
    if img is None:
        return (850, 850)
    h, w = img.shape[:2]
    return (w, h)


def main():
    if not WATERMARK_LIST.exists():
        print(f"找不到水印清单: {WATERMARK_LIST}")
        return

    filenames = WATERMARK_LIST.read_text(encoding="utf-8").strip().split("\n")
    filenames = [f.strip() for f in filenames if f.strip()]
    print(f"准备生成 {len(filenames)} 张白底占位图")

    success = 0
    skip = 0
    for filename in filenames:
        original = PRODUCT_DIR / filename
        if not original.exists():
            print(f"  [SKIP] {filename} 不存在")
            skip += 1
            continue

        sku = Path(filename).stem
        target_size = get_target_size(original)
        img = generate_placeholder(sku, target_size)

        # 覆盖原图
        cv2.imwrite(str(original), img, [cv2.IMWRITE_JPEG_QUALITY, 90])
        success += 1

        if success % 20 == 0:
            print(f"  进度: {success}/{len(filenames)}")

    print(f"\n完成 {success}/{len(filenames)} 张 (跳过 {skip})")
    print(f"原图备份保留在 public/images/products.backup-2026-08-07/")


if __name__ == "__main__":
    main()