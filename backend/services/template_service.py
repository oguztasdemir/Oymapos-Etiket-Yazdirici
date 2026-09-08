# -*- coding: utf-8 -*-
"""
🏷️ Etiket Şablonları ve Varsayılan Etiket Yönetim Servisi
"""
import os
import json
import uuid
from backend.config import DATA_DIR, SETTINGS_FILE
from backend.services.printer_service import load_settings, save_settings

TEMPLATES_FILE = os.path.join(DATA_DIR, 'etiket_sablonlari.json')

DEFAULT_TEMPLATES = [
    {
        "id": "tpl-standart-76x40",
        "name": "Standart Raf Modeli (76x40 mm)",
        "preset": "size-76x40",
        "width_mm": 76,
        "height_mm": 40,
        "top_right_mode": "empty",
        "price_size": 26,
        "title_size": 12,
        "show_barcode": True,
        "show_unit_price": True,
        "show_origin": True,
        "show_date": True,
        "is_default": True,
        "custom_layers": [],
        "offsets": {}
    },
    {
        "id": "tpl-kompakt-60x40",
        "name": "Kompakt Raf Etiketi (60x40 mm)",
        "preset": "size-60x40",
        "width_mm": 60,
        "height_mm": 40,
        "top_right_mode": "empty",
        "price_size": 24,
        "title_size": 11,
        "show_barcode": True,
        "show_unit_price": True,
        "show_origin": True,
        "show_date": True,
        "is_default": False,
        "custom_layers": [],
        "offsets": {}
    },
    {
        "id": "tpl-kampanya-85x45",
        "name": "Büyük Kampanya & İndirim (85x45 mm)",
        "preset": "size-85x45",
        "width_mm": 85,
        "height_mm": 45,
        "top_right_mode": "discount",
        "price_size": 32,
        "title_size": 14,
        "show_barcode": True,
        "show_unit_price": True,
        "show_origin": True,
        "show_date": True,
        "is_default": False,
        "custom_layers": [],
        "offsets": {}
    },
    {
        "id": "tpl-mini-40x20",
        "name": "Mini Barkod Etiketi (40x20 mm)",
        "preset": "size-40x20",
        "width_mm": 40,
        "height_mm": 20,
        "top_right_mode": "empty",
        "price_size": 18,
        "title_size": 9,
        "show_barcode": True,
        "show_unit_price": False,
        "show_origin": False,
        "show_date": False,
        "is_default": False,
        "custom_layers": [],
        "offsets": {}
    }
]

def load_all_templates() -> list[dict]:
    """Tüm kayıtlı etiket şablonlarını getirir."""
    if os.path.exists(TEMPLATES_FILE):
        try:
            with open(TEMPLATES_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if isinstance(data, list) and len(data) > 0:
                    return data
        except Exception:
            pass
    
    # Dosya yoksa veya bozuksa varsayılanları kaydet ve dön
    save_all_templates(DEFAULT_TEMPLATES)
    return [dict(t) for t in DEFAULT_TEMPLATES]

def save_all_templates(templates: list[dict]) -> bool:
    """Tüm şablonları JSON dosyasına yazar."""
    try:
        with open(TEMPLATES_FILE, 'w', encoding='utf-8') as f:
            json.dump(templates, f, ensure_ascii=False, indent=2)
        return True
    except Exception:
        return False

def get_default_template() -> dict:
    """Varsayılan aktif şablonu döner."""
    templates = load_all_templates()
    for t in templates:
        if t.get("is_default"):
            return t
    if templates:
        templates[0]["is_default"] = True
        save_all_templates(templates)
        return templates[0]
    return DEFAULT_TEMPLATES[0]

def set_default_template(template_id: str) -> dict:
    """Belirtilen şablonu sistem varsayılanı yapar ve yazıcı ayarlarıyla senkronize eder."""
    templates = load_all_templates()
    found = None
    for t in templates:
        if t["id"] == template_id:
            t["is_default"] = True
            found = t
        else:
            t["is_default"] = False
    
    if found:
        save_all_templates(templates)
        # Yazıcı ayarlarında etiket boyutunu da güncelle
        save_settings({
            "label_size_preset": found.get("preset", "76x40").replace("size-", ""),
            "width_mm": found.get("width_mm", 76),
            "height_mm": found.get("height_mm", 40)
        })
        return found
    raise ValueError(f"Şablon bulunamadı: {template_id}")

def save_or_update_template(template_data: dict) -> dict:
    """Şablonu günceller veya yeni olarak kaydeder."""
    templates = load_all_templates()
    t_id = template_data.get("id") or f"tpl-{uuid.uuid4().hex[:8]}"
    template_data["id"] = t_id

    # Boyut mm hesapla
    preset = template_data.get("preset", "size-76x40")
    if preset == "size-60x40":
        template_data["width_mm"] = 60
        template_data["height_mm"] = 40
    elif preset == "size-85x45":
        template_data["width_mm"] = 85
        template_data["height_mm"] = 45
    elif preset == "size-40x20":
        template_data["width_mm"] = 40
        template_data["height_mm"] = 20
    else:
        template_data["width_mm"] = template_data.get("width_mm", 76)
        template_data["height_mm"] = template_data.get("height_mm", 40)

    idx = next((i for i, t in enumerate(templates) if t["id"] == t_id), -1)
    if idx >= 0:
        # Mevcut varsayılan durumunu koru
        if "is_default" not in template_data:
            template_data["is_default"] = templates[idx].get("is_default", False)
        templates[idx] = template_data
    else:
        if template_data.get("is_default"):
            for t in templates:
                t["is_default"] = False
        templates.append(template_data)

    save_all_templates(templates)
    return template_data

def create_new_template(name: str, base_id: str = None) -> dict:
    """Yeni özel etiket şablonu oluşturur."""
    templates = load_all_templates()
    base = None
    if base_id:
        base = next((t for t in templates if t["id"] == base_id), None)
    if not base:
        base = get_default_template()

    new_id = f"tpl-custom-{uuid.uuid4().hex[:8]}"
    new_tpl = {
        **base,
        "id": new_id,
        "name": (name or "Yeni Özel Şablon").strip(),
        "is_default": False
    }
    templates.append(new_tpl)
    save_all_templates(templates)
    return new_tpl

def delete_template(template_id: str) -> bool:
    """Kullanıcı şablonunu siler (varsayılan silinirse ilk kalan varsayılan yapılır)."""
    templates = load_all_templates()
    if len(templates) <= 1:
        raise ValueError("Son kalan etiket şablonu silinemez.")

    to_delete = next((t for t in templates if t["id"] == template_id), None)
    if not to_delete:
        raise ValueError(f"Şablon bulunamadı: {template_id}")

    was_default = to_delete.get("is_default", False)
    templates = [t for t in templates if t["id"] != template_id]

    if was_default and templates:
        templates[0]["is_default"] = True

    save_all_templates(templates)
    return True
