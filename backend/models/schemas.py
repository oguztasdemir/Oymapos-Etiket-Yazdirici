# -*- coding: utf-8 -*-
"""
📐 Pydantic Veri Modelleri ve Şemalar (taslak copy/02_KLASOR_HIYERARSISI_VE_MODULERLIK)
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class PrinterSettingsRequest(BaseModel):
    market_name: Optional[str] = Field("MARKET", description="Market / Ticari Ünvan")
    printer: Optional[str] = Field(None, description="Termal Etiket Yazıcısı")
    receipt_printer: Optional[str] = Field(None, description="Kasa Bilgi Fişi Yazıcısı")
    label_size_preset: Optional[str] = Field("60x40", description="Etiket Boyut Şablonu")
    width_mm: Optional[int] = Field(60, description="Etiket genişliği (mm)")
    height_mm: Optional[int] = Field(40, description="Etiket yüksekliği (mm)")
    darkness: Optional[int] = Field(22, description="Baskı koyuluğu / Density (10-30)")
    orientation: Optional[str] = Field("POR", description="Kağıt besleme yönü (POR/PON)")
    x_offset: Optional[int] = Field(0, description="X Ofset (dot)")
    y_offset: Optional[int] = Field(0, description="Y Ofset (dot)")
    auto_print_on_scan: Optional[bool] = Field(True, description="Okutmada otomatik bas")

class PrintSingleRequest(BaseModel):
    barcode: Optional[str] = Field(None, description="Ürün barkodu")
    title: Optional[str] = Field(None, description="Ürün adı / başlığı")
    price: Optional[float] = Field(None, description="Satış fiyatı")
    brand: Optional[str] = Field(None, description="Marka")
    copies: Optional[int] = Field(1, description="Kopya sayısı")
    source_device: Optional[str] = Field(None, description="Kaynak Cihaz / PC Adı")

class PrintBatchRequest(BaseModel):
    products: List[PrintSingleRequest] = Field(default_factory=list, description="Yazdırılacak ürün listesi")
    copies: Optional[int] = Field(1, description="Her ürün için kopya sayısı")

class MobileScanRequest(BaseModel):
    barcode: str = Field(..., description="Taranan barkod")
    auto_print: Optional[bool] = Field(True, description="Bulunduğunda otomatik yazdırılsın mı")
    copies: Optional[int] = Field(1, description="Kopya sayısı")
    device_name: Optional[str] = Field("Mobil Terminal", description="İsteği yapan mobil cihaz adı")

class ProductResponse(BaseModel):
    barcode: str
    title: str
    price: float
    brand: Optional[str] = ""
    stock_code: Optional[str] = ""
    unit: Optional[str] = "ADET"
    source_device: Optional[str] = "OYMAPOS Barkod Sistemi"
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class DeviceSummaryItem(BaseModel):
    device: str
    count: int
    is_all: bool = False

class PriceChangeItem(BaseModel):
    id: int
    barcode: str
    title: str
    old_price: float
    new_price: float
    diff_amount: float
    diff_percent: float
    source_device: Optional[str] = "OYMAPOS Barkod Sistemi"
    changed_at: str
    is_printed: int

class VegaWinConfirmRequest(BaseModel):
    items: List[Dict[str, Any]] = Field(..., description="Senkronize edilecek ürün listesi")
    source_name: Optional[str] = Field("VegaWin Dosyası", description="Kaynak dosya adı")
    device_name: Optional[str] = Field("VegaWin PC", description="Kaynak cihaz adı")
