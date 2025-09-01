import os
import json
import base64
import hashlib
from typing import Dict, Any, Optional

import httpx


class PhonePeClient:
    """Lightweight PhonePe PG client for creating payments and checking status."""

    def __init__(self) -> None:
        # Environment/config
        self.merchant_id = os.getenv("PHONEPE_MERCHANT_ID", "")
        self.salt_key = os.getenv("PHONEPE_SALT_KEY", "")
        self.key_index = os.getenv("PHONEPE_SALT_INDEX", "1")

        # Default to sandbox if not specified
        base_url = os.getenv(
            "PHONEPE_BASE_URL",
            "https://api-preprod.phonepe.com/apis/pg-sandbox",
        )
        self.base_url = base_url.rstrip("/")

        # URLs
        self.pay_endpoint = "/pg/v1/pay"
        self.status_endpoint_prefix = "/pg/v1/status"

        # Redirects/callbacks
        self.redirect_url = os.getenv("PHONEPE_REDIRECT_URL", "")
        self.callback_url = os.getenv("PHONEPE_CALLBACK_URL", self.redirect_url)

        # HTTP client
        self._client = httpx.Client(timeout=30.0)

        if not self.merchant_id or not self.salt_key:
            raise ValueError("PhonePe credentials not configured")

    def _compute_x_verify_for_pay(self, payload_b64: str) -> str:
        to_hash = f"{payload_b64}{self.pay_endpoint}{self.salt_key}"
        checksum = hashlib.sha256(to_hash.encode()).hexdigest()
        return f"{checksum}###{self.key_index}"

    def _compute_x_verify_for_status(self, merchant_transaction_id: str) -> str:
        path = f"{self.status_endpoint_prefix}/{self.merchant_id}/{merchant_transaction_id}"
        to_hash = f"{path}{self.salt_key}"
        checksum = hashlib.sha256(to_hash.encode()).hexdigest()
        return f"{checksum}###{self.key_index}"

    def create_pay_page(
        self,
        *,
        merchant_transaction_id: str,
        merchant_user_id: str,
        amount_in_inr: float,
        package_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Create a PhonePe Pay Page transaction and return redirect URL + metadata."""
        amount_paise = int(round(amount_in_inr * 100))

        payload = {
            "merchantId": self.merchant_id,
            "merchantTransactionId": merchant_transaction_id,
            "merchantUserId": merchant_user_id,
            "amount": amount_paise,
            "redirectUrl": self.redirect_url,
            "redirectMode": "GET",
            "callbackUrl": self.callback_url,
            "paymentInstrument": {
                "type": "PAY_PAGE",
            },
        }

        # Optional metadata
        if package_id:
            payload["deviceContext"] = {"provider": "MOTIONFALCON", "packageId": package_id}

        payload_str = json.dumps(payload, separators=(",", ":"))
        payload_b64 = base64.b64encode(payload_str.encode()).decode()

        headers = {
            "Content-Type": "application/json",
            "X-VERIFY": self._compute_x_verify_for_pay(payload_b64),
            "X-MERCHANT-ID": self.merchant_id,
        }

        url = f"{self.base_url}{self.pay_endpoint}"
        response = self._client.post(url, json={"request": payload_b64}, headers=headers)
        response.raise_for_status()
        data = response.json()

        # Extract redirect URL defensively
        redirect_url = None
        if isinstance(data, dict):
            d = data.get("data") or {}
            # Possible paths
            redirect_url = (
                d.get("redirectUrl")
                or (d.get("instrumentResponse", {}).get("redirectUrl") if isinstance(d.get("instrumentResponse"), dict) else None)
                or (d.get("instrumentResponse", {}).get("redirectInfo", {}).get("url") if isinstance(d.get("instrumentResponse"), dict) else None)
                or d.get("url")
            )

        return {
            "raw": data,
            "redirect_url": redirect_url,
            "merchant_transaction_id": merchant_transaction_id,
            "amount_paise": amount_paise,
        }

    def get_status(self, merchant_transaction_id: str) -> Dict[str, Any]:
        """Fetch transaction status from PhonePe."""
        path = f"{self.status_endpoint_prefix}/{self.merchant_id}/{merchant_transaction_id}"
        url = f"{self.base_url}{path}"
        headers = {
            "Content-Type": "application/json",
            "X-VERIFY": self._compute_x_verify_for_status(merchant_transaction_id),
            "X-MERCHANT-ID": self.merchant_id,
        }
        response = self._client.get(url, headers=headers)
        response.raise_for_status()
        return response.json()


