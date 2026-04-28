"""
LEX Sample — Python / FastAPI

Demonstrates multi-industry lead exchange using the LEX Python library.
Each industry loads its canonical e2e scenario, builds a LEAD message via
the fluent DSL, validates it, then submits it to the LEX sandbox API.

Routes:
    GET  /industries            — list supported industries
    GET  /examples/{industry}   — raw e2e scenario for an industry
    POST /leads/{industry}      — build + validate + submit a lead
    POST /validate              — validate any raw LEX message body

Run:
    uvicorn app.main:app --reload
"""

import json
import os
from pathlib import Path
from typing import Any

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse

from lexstandard import (
    LexClient,
    lex,
    AssetClass,
    LeadStatus,
    LexCustomer,
    LexAssetSpec,
    ProductType,
)


def _safe_product_type(raw: str | None) -> ProductType:
    """Convert a raw string to ProductType, falling back to VEHICLE."""
    if not raw:
        return ProductType.VEHICLE
    try:
        return ProductType(raw.upper())
    except ValueError:
        return ProductType.VEHICLE

# ── App and LEX client ────────────────────────────────────────────────────
app = FastAPI(
    title="LEX Sample API",
    description="Multi-industry lead exchange demo using the LEX Python library",
    version="1.0.0",
)

client = LexClient(
    sender_id=os.getenv("LEX_SENDER_ID",   "SAMPLE-PYTHON-001"),
    receiver_id=os.getenv("LEX_RECEIVER_ID", "LEX-PLATFORM"),
    api_base=os.getenv("LEX_API_BASE",     "https://sandbox.lexstandard.org/v1"),
    api_key=os.getenv("LEX_API_KEY",       ""),
)

# ── Industry registry ─────────────────────────────────────────────────────
EXAMPLES_DIR = Path(__file__).parent.parent.parent.parent / "examples"

INDUSTRIES: dict[str, dict[str, Any]] = {
    "automotive":     {"asset_class": AssetClass.VEHICLE,         "scenario": "automotive/json/automotive_e2e_scenario.json"},
    "aviation":       {"asset_class": AssetClass.AVIATION,        "scenario": "aviation/json/aviation_e2e_scenario.json"},
    "maritime":       {"asset_class": AssetClass.MARITIME,        "scenario": "maritime/json/maritime_e2e_scenario.json"},
    "heavy-equipment":{"asset_class": AssetClass.HEAVY_EQUIPMENT, "scenario": "heavy-equipment/json/heavy_equipment_e2e_scenario.json"},
    "real-estate":    {"asset_class": AssetClass.GENERAL_GOODS,   "scenario": "real-estate/json/real_estate_e2e_scenario.json"},
    "technology":     {"asset_class": AssetClass.TECHNOLOGY,      "scenario": "technology/json/technology_e2e_scenario.json"},
}


def _load_scenario(industry: str) -> dict:
    path = EXAMPLES_DIR / INDUSTRIES[industry]["scenario"]
    with path.open(encoding="utf-8-sig") as f:
        return json.load(f)


def _first_lead(scenario: dict) -> dict:
    for msg in scenario.get("messages", []):
        lead = msg.get("lex", {}).get("payload", {}).get("lead")
        if lead:
            return lead
    raise ValueError("No LEAD message found in scenario")


# ── Routes ────────────────────────────────────────────────────────────────

@app.get("/industries", summary="List supported industries")
def list_industries():
    return {"industries": list(INDUSTRIES)}


@app.get("/examples/{industry}", summary="Raw e2e scenario for an industry")
def get_example(industry: str):
    if industry not in INDUSTRIES:
        raise HTTPException(status_code=404, detail=f"Unknown industry: {industry}")
    return _load_scenario(industry)


@app.post("/leads/{industry}", summary="Build, validate and submit a lead")
async def submit_lead(industry: str, body: dict[str, Any] | None = None):
    if industry not in INDUSTRIES:
        raise HTTPException(status_code=404, detail=f"Unknown industry: {industry}")

    body = body or {}
    meta = INDUSTRIES[industry]

    try:
        scenario    = _load_scenario(industry)
        source_lead = _first_lead(scenario)
        src_customer = source_lead.get("customer", {})
        contacts     = src_customer.get("contacts", [{}])

        def _contact(key: str):
            return contacts[0].get(key) if contacts else None

        desired = source_lead.get("desiredProduct") or source_lead.get("desiredAsset") or {}

        # Build via DSL
        message = (
            lex.lead()
            .sender(client.sender_id)
            .receiver(client.receiver_id)
            .lead_status(LeadStatus.EXPRESSED_INTEREST)
            .customer(LexCustomer(
                first_name=   body.get("firstName")   or src_customer.get("firstName")   or ((_contact("name") or "").split(" ") + [""])[0] or None,
                last_name=    body.get("lastName")    or src_customer.get("lastName")    or ((_contact("name") or "").split(" ") + [""])[-1] or None,
                email_address=body.get("email")       or src_customer.get("emailAddress") or src_customer.get("email") or _contact("email"),
                phone_number= body.get("phone")       or src_customer.get("phoneNumber")  or src_customer.get("phone") or _contact("phone"),
            ))
            .desired_asset(LexAssetSpec(
                asset_class=  meta["asset_class"],
                product_type= _safe_product_type(desired.get("productType")),
                year=         desired.get("year"),
                make=         desired.get("make"),
                model=        desired.get("model"),
            ))
            .build()
        )

        # Validate locally
        validation = client.validate(message)
        if not validation.valid:
            return JSONResponse(
                status_code=422,
                content={"stage": "validation", "valid": False, "errors": validation.errors},
            )

        # Submit to LEX API
        api_response = await client.submit_async(message)

        return {
            "industry":   industry,
            "scenario":   scenario.get("_metadata", {}).get("title"),
            "messageId":  message["lex"]["header"]["messageId"],
            "valid":      True,
            "apiResponse": api_response,
        }

    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.post("/validate", summary="Validate any raw LEX message")
def validate_message(body: dict[str, Any]):
    result = client.validate(body)
    status = 200 if result.valid else 422
    return JSONResponse(status_code=status, content={"valid": result.valid, "errors": result.errors})
