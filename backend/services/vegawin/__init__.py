# -*- coding: utf-8 -*-
"""
📊 VegaWin Subpackage Exporter
Tüm VegaWin ayrıştırma ve senkronizasyon araçlarını dışa aktarır.
"""
from backend.services.vegawin.parser import (
    parse_vegawin_file, parse_raw_text_products, parse_sonsatishareket_file, scan_vegawin_directory
)
from backend.services.vegawin.sync_core import (
    preview_vegawin_comparison, sync_vegawin_items, get_price_changes_list, mark_changes_as_printed
)
