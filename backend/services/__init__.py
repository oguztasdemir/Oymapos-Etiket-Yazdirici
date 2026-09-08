# -*- coding: utf-8 -*-
from backend.services.db_service import (
    init_db, get_all_products, search_products, get_product_by_barcode,
    get_products_count, get_new_products_list, mark_new_products_as_printed
)
from backend.services.printer_service import get_installed_printers, print_single_label, load_settings, save_settings
from backend.services.vegawin_service import parse_vegawin_file, sync_vegawin_items, get_price_changes_list, mark_changes_as_printed
