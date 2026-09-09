# -*- coding: utf-8 -*-
"""
🎨 Template Controller
Etiket şablonları yönetimi, yeni şablon oluşturma, varsayılan ayarlama ve silme
"""
from fastapi import APIRouter, Request

from backend.services.template_service import (
    load_all_templates, get_default_template, save_or_update_template,
    set_default_template, create_new_template, delete_template
)
from backend.utils.response_utils import success_response, error_response

router = APIRouter(prefix="/api/templates", tags=["Templates"])

@router.get("")
async def get_templates():
    templates = load_all_templates()
    default_tpl = get_default_template()
    return success_response(
        data={
            "templates": templates,
            "active_template_id": default_tpl.get("id")
        },
        message="Şablonlar listelendi"
    )

@router.post("")
async def save_template(req: Request):
    body = await req.json()
    saved = save_or_update_template(body)
    return success_response(data={"template": saved}, message="Etiket şablonu kaydedildi")

@router.post("/new")
async def new_template(req: Request):
    body = await req.json()
    name = body.get("name", "Yeni Özel Şablon")
    base_id = body.get("base_id")
    created = create_new_template(name=name, base_id=base_id)
    return success_response(data={"template": created}, message="Yeni şablon oluşturuldu")

@router.post("/{template_id}/set-default")
async def make_default_template(template_id: str):
    try:
        updated = set_default_template(template_id)
        return success_response(data={"template": updated}, message="Varsayılan etiket şablonu güncellendi")
    except ValueError as e:
        return error_response(str(e))

@router.delete("/{template_id}")
async def remove_template(template_id: str):
    try:
        delete_template(template_id)
        return success_response(message="Şablon silindi")
    except ValueError as e:
        return error_response(str(e))
