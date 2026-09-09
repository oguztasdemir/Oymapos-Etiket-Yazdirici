# -*- coding: utf-8 -*-
"""
🛠️ API Yanıt ve UTF-8 Konsol Yardımcıları
"""
import sys
from typing import Any, Dict, Optional
from fastapi.responses import JSONResponse

def safe_log(msg: str):
    """Windows terminallerinde çökme olmadan UTF-8 log basar."""
    try:
        print(msg)
    except Exception:
        try:
            print(msg.encode('ascii', errors='replace').decode('ascii'))
        except Exception:
            pass

def success_response(data: Any = None, message: str = "İşlem başarılı", **kwargs) -> Dict[str, Any]:
    """Standart başarılı API yanıt formatı."""
    res = {"status": "success", "message": message}
    if data is not None:
        res["data"] = data
    res.update(kwargs)
    return res

def error_response(message: str = "Bir hata oluştu", status_code: int = 400, **kwargs) -> JSONResponse:
    """Standart hatalı API yanıt formatı."""
    content = {"status": "error", "message": message}
    content.update(kwargs)
    return JSONResponse(status_code=status_code, content=content)
