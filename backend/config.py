# -*- coding: utf-8 -*-
"""
⚙️ Çekirdek Konfigürasyon ve Ayarlar
"""
import os
import sys

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
FRONTEND_DIR = os.path.join(BASE_DIR, 'frontend')
DATA_DIR = os.path.join(BASE_DIR, 'data')
UPLOADS_DIR = os.path.join(DATA_DIR, 'uploads')

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(UPLOADS_DIR, exist_ok=True)

DB_PATH = os.path.join(DATA_DIR, 'market_sistemi.db')
SETTINGS_FILE = os.path.join(DATA_DIR, 'ayarlar.json')

DEFAULT_SETTINGS = {
    "market_name": "YARENLER",
    "printer": "Termal Etiket Yazici",
    "width_mm": 60,
    "height_mm": 40,
    "darkness": 22,
    "x_offset": 0,
    "y_offset": 0,
    "currency_symbol": "₺",
    "auto_print_on_scan": True,
    "default_copies": 1
}
