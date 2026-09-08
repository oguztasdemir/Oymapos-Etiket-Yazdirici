# -*- coding: utf-8 -*-
"""
🖨️ Termal Etiket ve Fiş Yazıcı Servisi (OYMAPOS Standart TSPL/ZPL, Windows Spooler, Çift Yazıcı & Kuyruk Yönetimi)
"""
import platform
import json
import os
import datetime
from backend.config import SETTINGS_FILE, DEFAULT_SETTINGS

def load_settings() -> dict:
    if os.path.exists(SETTINGS_FILE):
        try:
            with open(SETTINGS_FILE, 'r', encoding='utf-8') as f:
                return {**DEFAULT_SETTINGS, **json.load(f)}
        except Exception:
            pass
    return DEFAULT_SETTINGS.copy()

def save_settings(new_settings: dict) -> dict:
    current = load_settings()
    current.update(new_settings)
    with open(SETTINGS_FILE, 'w', encoding='utf-8') as f:
        json.dump(current, f, ensure_ascii=False, indent=2)
    return current

def get_installed_printers() -> list:
    """İşletim sisteminde yüklü yazıcıların listesini döner."""
    printers = []
    if platform.system() == "Windows":
        try:
            import win32print
            for p in win32print.EnumPrinters(win32print.PRINTER_ENUM_LOCAL | win32print.PRINTER_ENUM_CONNECTIONS):
                printers.append(p[2])
        except Exception:
            pass
    if not printers:
        printers = ["Termal Etiket Yazici", "Xprinter XP-365B", "Zebra ZD220", "Argox OS-214plus", "Microsoft Print to PDF"]
    return printers

def clean_turkish(text: str) -> str:
    if not text:
        return ""
    tr_map = {
        'ı': 'I', 'İ': 'I', 'i': 'I',
        'ş': 'S', 'Ş': 'S',
        'ğ': 'G', 'Ğ': 'G',
        'ü': 'U', 'Ü': 'U',
        'ö': 'O', 'Ö': 'O',
        'ç': 'C', 'Ç': 'C',
        '₺': 'TL'
    }
    res = []
    for ch in str(text):
        res.append(tr_map.get(ch, ch))
    return "".join(res)

def format_price_display(val) -> str:
    if val is None:
        return "0,00 TL"
    try:
        f = float(str(val).replace('TL', '').replace('tl', '').replace('₺', '').replace(',', '.').strip())
        return f"{f:.2f} TL".replace('.', ',')
    except Exception:
        return f"{val} TL"

def generate_tspl_command(data: dict, width_mm=None, height_mm=None, darkness=None, orientation=None, x_offset=None, y_offset=None, copies=1, template_data=None) -> bytes:
    """OYMAPOS Dinamik ve Şablon Duyarlı TSPL-II etiket komutunu üretir."""
    from backend.services.template_service import get_default_template

    settings = load_settings()
    tpl = template_data or get_default_template() or {}

    # Öncelik: Fonksiyon parametresi > Şablon ayarı > Genel ayarlar
    w_mm = int(width_mm if width_mm is not None else tpl.get("width_mm", settings.get("width_mm", 76)))
    h_mm = int(height_mm if height_mm is not None else tpl.get("height_mm", settings.get("height_mm", 40)))
    dark = int(darkness if darkness is not None else settings.get("darkness", 22))
    orient = str(orientation if orientation is not None else settings.get("orientation", "POR"))
    x_off = int(x_offset if x_offset is not None else settings.get("x_offset", 0))
    y_off = int(y_offset if y_offset is not None else settings.get("y_offset", 0))

    # 203 DPI = 8 dots / mm
    total_w = w_mm * 8
    total_h = h_mm * 8

    lines = []
    lines.append(f"SIZE {w_mm} mm, {h_mm} mm")
    lines.append("GAP 2 mm, 0 mm")
    direction = "1" if orient == "POR" else "0"
    lines.append(f"DIRECTION {direction}")
    lines.append(f"DENSITY {dark}")
    lines.append("CLS")

    # Başlık ve metin ayrıştırma
    full_title = clean_turkish((data.get('title') or data.get('title1') or '').strip().upper())
    max_char_per_line = max(18, int(w_mm * 0.45))
    if len(full_title) <= max_char_per_line:
        title1 = full_title
        title2 = ""
    else:
        words = full_title.split()
        t1_words, t2_words = [], []
        cur_len = 0
        for w in words:
            if cur_len + len(w) <= max_char_per_line and not t2_words:
                t1_words.append(w)
                cur_len += len(w) + 1
            else:
                t2_words.append(w)
        title1 = " ".join(t1_words) if t1_words else full_title[:max_char_per_line]
        title2 = " ".join(t2_words) if t2_words else full_title[max_char_per_line:]

    default_market = clean_turkish(str(settings.get("market_name", "YARENLER")).strip().upper())
    brand = clean_turkish(str(data.get("brand") or default_market).strip().upper())
    origin = clean_turkish((data.get('origin') or 'TURKIYE').strip().upper())
    date_str = str(data.get('date') or datetime.datetime.now().strftime("%d.%m.%Y")).strip()
    barcode = str(data.get('barcode') or '').strip()
    price_str = format_price_display(data.get('price'))

    show_barcode = tpl.get("show_barcode", True)
    show_origin = tpl.get("show_origin", True)
    show_date = tpl.get("show_date", True)
    top_right_mode = tpl.get("top_right_mode", "empty")

    # 1. Mini Etiket Düzeni (40x20mm veya küçük)
    if w_mm <= 45 or h_mm <= 25:
        # Mini başlık
        lines.append(f'TEXT {8 + x_off},{4 + y_off},"2",0,1,1,"{title1[:20]}"')
        if barcode and show_barcode:
            if barcode.isdigit() and len(barcode) == 13:
                lines.append(f'BARCODE {8 + x_off},{40 + y_off},"EAN13",35,1,0,2,2,"{barcode}"')
            else:
                lines.append(f'BARCODE {8 + x_off},{40 + y_off},"128",35,1,0,2,2,"{barcode}"')
            # Fiyat sağda
            price_x = int(total_w * 0.55) + x_off
            lines.append(f'TEXT {price_x},{45 + y_off},"3",0,1,1,"{price_str}"')
        else:
            # Sadece büyük fiyat
            lines.append(f'TEXT {8 + x_off},{40 + y_off},"4",0,1,1,"{price_str}"')

    # 2. Standart ve Geniş Etiket Düzeni (60x40, 76x40, 85x45 mm)
    else:
        # 1. Satır Ürün Adı
        title_font = "3" if w_mm >= 70 else "2"
        lines.append(f'TEXT {12 + x_off},{8 + y_off},"{title_font}",0,1,1,"{title1[:36]}"')
        
        # 2. Satır Ürün Adı
        if title2:
            lines.append(f'TEXT {12 + x_off},{32 + y_off},"2",0,1,1,"{title2[:42]}"')
            info_box_y = 60
        else:
            info_box_y = 42

        # Bilgi Kutucukları (Market, Menşei, Tarih, Rozet)
        box_h = 24
        box_y1 = info_box_y + y_off
        box_y2 = box_y1 + box_h

        # 1. Kutu: Market Adı
        b1_w = int(total_w * 0.30)
        lines.append(f'BOX {12 + x_off},{box_y1},{12 + b1_w + x_off},{box_y2},2')
        lines.append(f'TEXT {16 + x_off},{box_y1 + 4},"1",0,1,1,"MKT: {brand[:10]}"')

        # 2. Kutu: Menşei (Gösteriliyorsa)
        if show_origin:
            b2_x1 = 18 + b1_w + x_off
            b2_w = int(total_w * 0.28)
            lines.append(f'BOX {b2_x1},{box_y1},{b2_x1 + b2_w},{box_y2},2')
            lines.append(f'TEXT {b2_x1 + 4},{box_y1 + 4},"1",0,1,1,"MEN: {origin[:8]}"')
        else:
            b2_x1 = 18 + b1_w + x_off
            b2_w = 0

        # 3. Kutu: Tarih (Gösteriliyorsa)
        if show_date:
            b3_x1 = b2_x1 + b2_w + (6 if b2_w > 0 else 0)
            b3_w = int(total_w * 0.32)
            lines.append(f'BOX {b3_x1},{box_y1},{b3_x1 + b3_w},{box_y2},2')
            lines.append(f'TEXT {b3_x1 + 4},{box_y1 + 4},"1",0,1,1,"TAR: {date_str}"')

        # Sağ Üst Rozet (Yerli, İndirim vb.)
        if top_right_mode == "yerli":
            lines.append(f'TEXT {total_w - 110 + x_off},{8 + y_off},"1",0,1,1,"[YERLI URETIM]"')
        elif top_right_mode == "discount":
            lines.append(f'TEXT {total_w - 95 + x_off},{8 + y_off},"1",0,1,1,"[INDIRIMLI]"')

        # Alt Bölüm: Barkod ve Fiyat
        bottom_y = box_y2 + 12
        price_box_w = max(160, int(total_w * 0.42))
        price_box_x1 = total_w - price_box_w - 12 + x_off
        price_box_y2 = total_h - 12 + y_off
        price_box_h = price_box_y2 - bottom_y

        # Barkod Çizgileri
        if barcode and show_barcode:
            bc_h = max(35, int(price_box_h * 0.8))
            if barcode.isdigit() and len(barcode) == 13:
                lines.append(f'BARCODE {12 + x_off},{bottom_y},"EAN13",{bc_h},1,0,2,2,"{barcode}"')
            else:
                lines.append(f'BARCODE {12 + x_off},{bottom_y},"128",{bc_h},1,0,2,2,"{barcode}"')

        # Fiyat Kutusu ve Değeri
        lines.append(f'BOX {price_box_x1},{bottom_y},{total_w - 12 + x_off},{price_box_y2},2')
        
        # Fiyat Yazısı Fontu (Büyük ve Net)
        price_font = "4"
        price_font_y = bottom_y + int((price_box_h - 32) / 2)
        lines.append(f'TEXT {price_box_x1 + 8},{price_font_y},"{price_font}",0,2,2,"{price_str}"')

    # Özel Eklenen Katmanlar (Varsa)
    custom_layers = tpl.get("custom_layers", [])
    for lyr in custom_layers:
        l_type = lyr.get("type", "text")
        l_x = int(lyr.get("x", 0)) + x_off
        l_y = int(lyr.get("y", 0)) + y_off
        l_content = clean_turkish(str(lyr.get("content", "")).upper())
        if l_type == "text" and l_content:
            lines.append(f'TEXT {l_x},{l_y},"2",0,1,1,"{l_content}"')
        elif l_type == "box":
            l_w = int(lyr.get("width", 50))
            l_h = int(lyr.get("height", 20))
            lines.append(f'BOX {l_x},{l_y},{l_x + l_w},{l_y + l_h},2')

    lines.append(f"PRINT {copies},1")
    cmd_str = "\r\n".join(lines) + "\r\n"
    return cmd_str.encode('latin1', errors='replace')

def send_raw_to_printer(printer_name: str, raw_data: bytes) -> tuple:
    if platform.system() != "Windows":
        return True, "Simülasyon modu (Windows dışı)"

    try:
        import win32print
        handle = win32print.OpenPrinter(printer_name)
        try:
            job = win32print.StartDocPrinter(handle, 1, ("Etiket_Baskisi", None, "RAW"))
            win32print.StartPagePrinter(handle)
            win32print.WritePrinter(handle, raw_data)
            win32print.EndPagePrinter(handle)
            win32print.EndDocPrinter(handle)
            return True, "Yazıcıya başarıyla iletildi."
        finally:
            win32print.ClosePrinter(handle)
    except Exception as e:
        return False, f"Yazıcı hatası: {str(e)}"

def purge_printer_queue(printer_name: str = None) -> tuple:
    """Yazıcı kuyruğundaki bekleyen tüm yazdırma işlerini temizler/iptal eder."""
    if platform.system() != "Windows":
        return True, "Kuyruk temizlendi (Simülasyon)"
    if not printer_name:
        settings = load_settings()
        printer_name = settings.get("printer", "Termal Etiket Yazici")
    try:
        import win32print
        handle = win32print.OpenPrinter(printer_name, {"DesiredAccess": win32print.PRINTER_ALL_ACCESS})
        try:
            win32print.SetPrinter(handle, 0, None, win32print.PRINTER_CONTROL_PURGE)
            return True, f"'{printer_name}' kuyruğu başarıyla temizlendi."
        finally:
            win32print.ClosePrinter(handle)
    except Exception as e:
        return False, f"Kuyruk temizleme hatası: {str(e)}"

def print_single_label(product: dict, copies=1, template_data=None) -> tuple:
    settings = load_settings()
    printer_name = settings.get("printer", "Termal Etiket Yazici")
    raw_tspl = generate_tspl_command(
        product,
        copies=copies,
        template_data=template_data
    )
    return send_raw_to_printer(printer_name, raw_tspl)

