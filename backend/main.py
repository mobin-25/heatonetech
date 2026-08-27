from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from seed_data import SEED_PRODUCTS
from supabase import create_client, Client
import os
import urllib.request
import urllib.error
import json
import random
import smtplib
import re
import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

# Load environment variables from .env if present
env_path = os.path.join(os.path.dirname(__file__), ".env")
if os.path.exists(env_path):
    with open(env_path, "r") as f:
        for line in f:
            stripped = line.strip()
            if not stripped or stripped.startswith("#"):
                continue
            if "=" in stripped:
                k, v = stripped.split("=", 1)
                if "#" in v:
                    v = v.split("#", 1)[0].strip()
                v = v.strip().strip("'").strip('"')
                os.environ[k.strip()] = v


# 1. Initialize the FastAPI app
app = FastAPI(title="Heat One Technology API")

# --- CORS BLOCK ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://heatonetechnology.live",
        "https://www.heatonetechnology.live",
        "https://heatonetech-6kg5.vercel.app",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Set up the Supabase Connection
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://amfsxtgljegkkbkgtwpm.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "sb_publishable_QywuvEw3Hd-kPmEns1QuzA_rr_S2oP5")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


# 3. Define Pydantic Models
class ProductModel(BaseModel):
    id: Optional[str] = None
    name: str
    slug: Optional[str] = ""
    subtitle: str
    category: str
    description: str
    longDescription: Optional[str] = ""
    specifications: dict
    features: List[str] = []
    applications: List[str] = []
    imageUrl: Optional[str] = ""
    additionalImages: Optional[List[str]] = []
    order: Optional[int] = 0


class InquiryModel(BaseModel):
    id: Optional[str] = None
    name: str
    company: str
    email: str
    phone: str
    message: str
    createdAt: str
    isWhatsApp: Optional[bool] = False
    isCallback: Optional[bool] = False
    preferredTime: Optional[str] = ""
    topic: Optional[str] = ""
    products: Optional[List[str]] = []

class OtpSendModel(BaseModel):
    email: str

class OtpVerifyModel(BaseModel):
    email: str
    otp: str

class UserRegisterModel(BaseModel):
    email: str
    password: str

class UserVerifyRegisterModel(BaseModel):
    email: str
    otp: str

class UserLoginModel(BaseModel):
    email: str
    password: str

class AdminLoginModel(BaseModel):
    username: str
    password: str

# Secure Password Hashing helpers
import hashlib
import secrets
import bcrypt

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    try:
        # Legacy PBKDF2 Verification Fallback
        if ":" in hashed and not hashed.startswith("$"):
            salt_hex, hash_hex = hashed.split(":", 1)
            salt = bytes.fromhex(salt_hex)
            pwd_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
            return pwd_hash.hex() == hash_hex
        # Standard bcrypt verification
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    except Exception:
        return False


# Helper to format seed products for Supabase
def get_formatted_seed_products():
    seeded = []
    for index, p in enumerate(SEED_PRODUCTS):
        p_dict = dict(p)
        p_dict["order"] = index
        if not p_dict.get("slug"):
            name = p_dict.get("name", "")
            slug = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
            if p_dict.get("id") == "brochure-shortwave-ir":
                slug = "standard-short-wave-infrared-heaters"
            p_dict["slug"] = slug
        seeded.append(p_dict)
    return seeded


# ─────────────────────────────────────────────
#  EMAIL DISPATCH SYSTEM (RESEND & SMTP FALLBACK)
# ─────────────────────────────────────────────

def _resend_send(to_email: str, subject: str, html_body: str) -> bool:
    """Low-level helper: sends one email via the Resend HTTPS API, trying multiple fallbacks."""
    api_key = os.getenv("RESEND_API_KEY")
    if not api_key:
        print("WARNING: RESEND_API_KEY not set. Skipping Resend email dispatch.")
        return False

    senders = [
        "Heat One Technology <noreply@send.heatonetechnology.live>",
        "Heat One Technology <noreply@heatonetechnology.live>",
        "Heat One Technology <onboarding@resend.dev>"
    ]

    for sender in senders:
        print(f"[RESEND] Attempting email dispatch from '{sender}' to '{to_email}'")
        payload = json.dumps({
            "from": sender,
            "to": [to_email],
            "subject": subject,
            "html": html_body
        }).encode("utf-8")

        req = urllib.request.Request(
            "https://api.resend.com/emails",
            data=payload,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            },
            method="POST"
        )

        try:
            with urllib.request.urlopen(req, timeout=15) as response:
                result = json.loads(response.read())
                print(f"[RESEND] ✅ Email sent successfully from {sender} to {to_email}. ID: {result.get('id')}")
                return True
        except urllib.error.HTTPError as e:
            body = e.read().decode()
            print(f"[RESEND] ❌ HTTP error {e.code} for sender {sender}: {body}")
        except urllib.error.URLError as e:
            print(f"[RESEND] ❌ URL error (network issue?) for sender {sender}: {e.reason}")
        except Exception as e:
            print(f"[RESEND] ❌ Unexpected error for sender {sender}: {repr(e)}")

    print("[RESEND] ❌ All Resend sender configurations failed.")
    return False

def _smtp_send(to_email: str, subject: str, html_body: str) -> bool:
    """Fallback helper: sends email via Gmail SMTP using credentials in environment or .env."""
    smtp_user = os.getenv("SMTP_USER")
    smtp_pass = os.getenv("SMTP_PASSWORD")
    smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    smtp_port_str = os.getenv("SMTP_PORT", "587")

    if not smtp_user or not smtp_pass:
        print("WARNING: SMTP credentials not set. Skipping SMTP fallback.")
        return False

    print(f"[SMTP] Attempting email dispatch via SMTP to '{to_email}'")
    try:
        msg = MIMEMultipart()
        msg['From'] = smtp_user
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(html_body, 'html'))

        port = int(smtp_port_str)
        if port == 465:
            server = smtplib.SMTP_SSL(smtp_server, port, timeout=15)
        else:
            server = smtplib.SMTP(smtp_server, port, timeout=15)
            server.starttls()
        
        server.login(smtp_user, smtp_pass)
        server.sendmail(smtp_user, to_email, msg.as_string())
        server.quit()
        print(f"[SMTP] ✅ Email sent successfully via SMTP to {to_email}")
        return True
    except Exception as e:
        print(f"[SMTP] ❌ Failed to send email via SMTP to {to_email}: {repr(e)}")
        return False

def send_email_hub(to_email: str, subject: str, html_body: str) -> bool:
    if os.getenv("RESEND_API_KEY"):
        resend_success = _resend_send(to_email, subject, html_body)
        if resend_success:
            return True
    return _smtp_send(to_email, subject, html_body)


def send_otp_email(email: str, otp: str) -> bool:
    subject = "Verification Code - Heat One Technology"
    html_body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; background-color: #fafafa; padding: 20px; color: #18181b;">
      <div style="max-width: 460px; margin: 0 auto; background-color: #ffffff;
                  border: 1px solid #e4e4e7; border-radius: 12px; padding: 30px;
                  box-shadow: 0 4px 10px rgba(0,0,0,0.03);">
        <h2 style="color: #ea580c; font-size: 18px; font-weight: bold; text-transform: uppercase;
                   margin-top: 0; border-bottom: 2px solid #ea580c; padding-bottom: 10px;
                   letter-spacing: 1px;">Heat One Technology</h2>
        <p style="font-size: 14px; line-height: 1.5; color: #3f3f46; margin-top: 20px;">
          Dear Valued Customer,
        </p>
        <p style="font-size: 14px; line-height: 1.5; color: #3f3f46;">
          Thank you for contacting Heat One Technology. To complete your verification,
          please use the following 6-digit verification code:
        </p>
        <div style="background-color: #f9fafb; border: 2px dashed #ea580c; border-radius: 8px;
                    padding: 15px; text-align: center; margin: 25px 0;">
          <span style="font-size: 34px; font-weight: 900; letter-spacing: 5px;
                       color: #ea580c; font-family: 'Courier New', Courier, monospace;">
            {otp}
          </span>
        </div>
        <p style="font-size: 12px; line-height: 1.5; color: #71717a; margin-bottom: 20px;">
          If you did not initiate this request, please ignore this email.
        </p>
        <div style="border-top: 1px solid #e4e4e7; padding-top: 15px;
                    font-size: 11px; color: #a1a1aa; margin-top: 25px;">
          This is an automated security message. Please do not reply directly to this mail.<br/>
          &copy; Heat One Technology Team
        </div>
      </div>
    </body>
    </html>
    """
    return send_email_hub(email, subject, html_body)


def send_inquiry_email(inquiry_data: dict) -> bool:
    products = inquiry_data.get("products", [])
    attached_prods = ", ".join(products) if isinstance(products, list) else str(products)

    subject = f"New Inquiry Alert - {inquiry_data.get('name')}"
    html_body = f"""
    <html>
      <body style="font-family: sans-serif; line-height: 1.6;">
        <p>Dear Heat One Technology Team,</p>
        <p><b>You have received a new inquiry on the website:</b></p>
        <ul style="list-style-type: none; padding-left: 0;">
            <li><b>ID:</b> {inquiry_data.get('id', 'N/A')}</li>
            <li><b>Name:</b> {inquiry_data.get('name')}</li>
            <li><b>Company:</b> {inquiry_data.get('company')}</li>
            <li><b>Email:</b> <a href="mailto:{inquiry_data.get('email')}">{inquiry_data.get('email')}</a></li>
            <li><b>Phone:</b> {inquiry_data.get('phone')}</li>
            <li><b>Timestamp:</b> {inquiry_data.get('createdAt')}</li>
            <li><b>Attached Products:</b> {attached_prods or 'None'}</li>
        </ul>
        <p><b>Inquiry Message / Request Details:</b></p>
        <hr style="border: none; border-top: 1px solid #ccc;" />
        <p>{inquiry_data.get('message')}</p>
        <hr style="border: none; border-top: 1px solid #ccc;" />
        <p style="color: #666; font-size: 0.9em;">
          This is an automated notification. Please reply directly to the client at
          <a href="mailto:{inquiry_data.get('email')}">{inquiry_data.get('email')}</a>.
        </p>
      </body>
    </html>
    """
    return send_email_hub("heatonetechnology@gmail.com", subject, html_body)


# 4. Startup event to seed Supabase database if empty
@app.on_event("startup")
async def seed_db():
    try:
        res = supabase.table("products").select("id").execute()
        if not res.data:
            print("Seeding Supabase database with initial catalog products...")
            seeded = get_formatted_seed_products()
            supabase.table("products").upsert(seeded).execute()
            print(f"Successfully seeded {len(seeded)} products into Supabase.")
    except Exception as e:
        print(f"[SUPABASE DB SEED] Products check/seed: {e}")

    try:
        res = supabase.table("admins").select("id").execute()
        if not res.data:
            print("Seeding admins into Supabase...")
            admins_to_seed = [
                {"username": "salman", "password": hash_password("salman@HOTT2026!")},
                {"username": "mobin",  "password": hash_password("mobin@HOTT2026!")}
            ]
            supabase.table("admins").upsert(admins_to_seed).execute()
            print("Successfully seeded admins into Supabase.")
    except Exception as e:
        print(f"[SUPABASE DB SEED] Admins check/seed: {e}")


# 5. API Routes for Products
@app.get("/")
async def read_root():
    return {"message": "Welcome to the Heat One API! The Supabase engine is running."}

@app.get("/test-openapi")
async def test_openapi():
    return {
        "openapi_url": app.openapi_url,
        "docs_url": app.docs_url,
        "redoc_url": app.redoc_url
    }

@app.get("/api/test-email")
async def test_email_endpoint():
    res = []
    api_key = os.getenv("RESEND_API_KEY")
    res.append(f"RESEND_API_KEY configured: {bool(api_key)}")
    
    subject = "Test Email - Heat One Technology"
    html_body = "<h3>This is a test email to verify your email configurations.</h3>"
    to_email = "heatonetechnology@gmail.com"
    
    senders = [
        "Heat One Technology <noreply@send.heatonetechnology.live>",
        "Heat One Technology <noreply@heatonetechnology.live>",
        "Heat One Technology <onboarding@resend.dev>"
    ]
    
    resend_worked = False
    if api_key:
        for sender in senders:
            res.append(f"Trying Resend with sender '{sender}' to '{to_email}'...")
            payload = json.dumps({
                "from": sender,
                "to": [to_email],
                "subject": subject,
                "html": html_body
            }).encode("utf-8")

            req = urllib.request.Request(
                "https://api.resend.com/emails",
                data=payload,
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                },
                method="POST"
            )

            try:
                with urllib.request.urlopen(req, timeout=15) as response:
                    result = json.loads(response.read())
                    res.append(f"✅ Resend Success with sender '{sender}'. ID: {result.get('id')}")
                    resend_worked = True
                    break
            except urllib.error.HTTPError as e:
                body = e.read().decode()
                res.append(f"❌ Resend HTTPError {e.code} for sender '{sender}': {body}")
            except Exception as e:
                res.append(f"❌ Resend Unexpected Error for sender '{sender}': {str(e)}")
    else:
        res.append("Skipping Resend (no API key)")

    if resend_worked:
        return {"status": "success", "logs": res}

    res.append("Trying SMTP fallback...")
    smtp_user = os.getenv("SMTP_USER")
    smtp_pass = os.getenv("SMTP_PASSWORD")
    smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    smtp_port_str = os.getenv("SMTP_PORT", "587")
    
    if smtp_user and smtp_pass:
        try:
            msg = MIMEMultipart()
            msg['From'] = smtp_user
            msg['To'] = to_email
            msg['Subject'] = subject
            msg.attach(MIMEText(html_body, 'html'))

            port = int(smtp_port_str)
            if port == 465:
                server = smtplib.SMTP_SSL(smtp_server, port, timeout=15)
            else:
                server = smtplib.SMTP(smtp_server, port, timeout=15)
                server.starttls()
            
            server.login(smtp_user, smtp_pass)
            server.sendmail(smtp_user, to_email, msg.as_string())
            server.quit()
            res.append("✅ SMTP Success")
            return {"status": "success", "logs": res}
        except Exception as e:
            res.append(f"❌ SMTP Error: {str(e)}")
    else:
        res.append("Skipping SMTP (no credentials)")

    return {"status": "failed", "logs": res}

@app.get("/api/products")
async def get_all_products():
    try:
        res = supabase.table("products").select("*").order("order", desc=False).execute()
        if res.data and len(res.data) > 0:
            return {"products": res.data}
    except Exception as e:
        print(f"[SUPABASE READ WARNING] {e}")
    # Return static seed products fallback if table not populated
    return {"products": get_formatted_seed_products()}

@app.post("/api/products")
async def create_product(product: ProductModel):
    product_dict = product.dict()
    if not product_dict.get("id"):
        product_dict["id"] = f"product-{int(datetime.datetime.utcnow().timestamp()*1000)}"

    if not product_dict.get("slug"):
        name = product_dict.get("name", "")
        product_dict["slug"] = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')

    try:
        # Check order
        if product_dict.get("order") is None or product_dict.get("order") == 0:
            existing = supabase.table("products").select("order").order("order", desc=True).limit(1).execute()
            if existing.data and len(existing.data) > 0:
                product_dict["order"] = (existing.data[0].get("order") or 0) + 1
            else:
                product_dict["order"] = 0

        res = supabase.table("products").upsert(product_dict).execute()
        return {"message": "Product saved successfully", "id": product_dict["id"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase write error: {str(e)}")

@app.put("/api/products/{product_id}")
async def update_product(product_id: str, product: ProductModel):
    product_dict = product.dict()
    product_dict["id"] = product_id

    if not product_dict.get("slug"):
        name = product_dict.get("name", "")
        product_dict["slug"] = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')

    try:
        existing = supabase.table("products").select("*").eq("id", product_id).execute()
        if existing.data and len(existing.data) > 0:
            if "order" in existing.data[0] and (product_dict.get("order") is None or product_dict.get("order") == 0):
                product_dict["order"] = existing.data[0]["order"]
        res = supabase.table("products").upsert(product_dict).execute()
        return {"message": "Product updated successfully", "id": product_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Supabase update error: {str(e)}")

class ReorderPayload(BaseModel):
    product_ids: List[str]

@app.post("/api/products/reorder")
async def reorder_products(payload: ReorderPayload):
    try:
        for index, product_id in enumerate(payload.product_ids):
            supabase.table("products").update({"order": index}).eq("id", product_id).execute()
        return {"message": "Products reordered successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/products/{product_id}")
async def delete_product(product_id: str):
    try:
        res = supabase.table("products").delete().eq("id", product_id).execute()
        return {"message": "Product deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/products")
async def reset_products_catalog():
    try:
        # Delete all products
        supabase.table("products").delete().neq("id", "___dummy___").execute()
        seeded = get_formatted_seed_products()
        supabase.table("products").upsert(seeded).execute()
        return {"message": "Catalog reset to default"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/users")
async def get_all_users():
    try:
        res = supabase.table("users").select("id, email, is_verified, createdAt").execute()
        return {"users": res.data or []}
    except Exception as e:
        return {"users": []}


# 6. API Routes for Inquiries
@app.get("/api/inquiries")
async def get_all_inquiries(email: Optional[str] = None):
    try:
        query = supabase.table("inquiries").select("*")
        if email:
            query = query.eq("email", email.strip())
        res = query.order("createdAt", desc=True).execute()
        return {"inquiries": res.data or []}
    except Exception as e:
        print(f"[SUPABASE INQUIRY READ ERROR] {e}")
        return {"inquiries": []}

@app.post("/api/inquiries")
async def create_inquiry(inquiry: InquiryModel, background_tasks: BackgroundTasks):
    inquiry_dict = inquiry.dict()
    inquiry_dict.pop("id", None)
    try:
        res = supabase.table("inquiries").insert(inquiry_dict).execute()
        inserted_id = "unknown"
        if res.data and len(res.data) > 0:
            inserted_id = res.data[0].get("id", "unknown")
            inquiry_dict["id"] = str(inserted_id)

        background_tasks.add_task(send_inquiry_email, inquiry_dict)

        return {
            "status": "success",
            "message": "Inquiry submitted successfully.",
            "inquiry_id": str(inserted_id)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inquiry save error: {str(e)}")

@app.delete("/api/inquiries/{inquiry_id}")
async def delete_inquiry(inquiry_id: str):
    try:
        supabase.table("inquiries").delete().eq("id", inquiry_id).execute()
        return {"message": "Inquiry deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/inquiries")
async def clear_all_inquiries():
    try:
        supabase.table("inquiries").delete().neq("id", "___dummy___").execute()
        return {"message": "Inquiry ledger cleared successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────
#  OTP VERIFICATION SYSTEM
# ─────────────────────────────────────────────
otp_store = {}

@app.post("/api/otp/send")
async def send_otp(data: OtpSendModel):
    code = f"{random.randint(100000, 999999)}"
    email = data.email.strip()
    otp_store[email] = code
    print(f"[OTP SERVICE] Generated OTP '{code}' for '{email}'")

    send_otp_email(email, code)

    dev_mode = os.getenv("DEV_MODE", "false").lower() == "true"
    response_payload = {"status": "success", "message": "OTP sent."}
    if dev_mode:
        response_payload["demo_otp"] = code

    return response_payload

@app.post("/api/otp/verify")
async def verify_otp(data: OtpVerifyModel):
    email = data.email.strip()
    otp   = data.otp.strip()

    stored = otp_store.get(email)
    if stored and stored == otp:
        del otp_store[email]
        return {"status": "success", "message": "Email address successfully verified."}
    else:
        raise HTTPException(status_code=400, detail="Invalid verification code. Please check and try again.")


# ─────────────────────────────────────────────
#  USER ACCOUNTS AUTH SYSTEM
# ─────────────────────────────────────────────
unverified_users = {}

@app.post("/api/auth/register")
async def register_user(data: UserRegisterModel):
    email    = data.email.strip().lower()
    password = data.password.strip()

    if len(password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long.")

    try:
        existing = supabase.table("users").select("id").eq("email", email).execute()
        if existing.data and len(existing.data) > 0:
            raise HTTPException(status_code=400, detail="An account with this email address already exists.")
    except HTTPException:
        raise
    except Exception:
        pass

    code = f"{random.randint(100000, 999999)}"
    otp_store[email] = code
    print(f"[AUTH REGISTRY] Generated signup OTP '{code}' for '{email}'")

    unverified_users[email] = hash_password(password)
    send_otp_email(email, code)

    dev_mode = os.getenv("DEV_MODE", "false").lower() == "true"
    payload = {"status": "success", "message": "OTP verification email dispatched."}
    if dev_mode:
        payload["demo_otp"] = code

    return payload

@app.post("/api/auth/verify-register")
async def verify_register(data: UserVerifyRegisterModel):
    email = data.email.strip().lower()
    otp   = data.otp.strip()

    stored_otp = otp_store.get(email)
    if not stored_otp or stored_otp != otp:
        raise HTTPException(status_code=400, detail="Invalid verification code. Please try again.")

    password_hash = unverified_users.get(email)
    if not password_hash:
        raise HTTPException(status_code=400, detail="Registration session expired or not found. Please sign up again.")

    new_user = {
        "email": email,
        "password": password_hash,
        "is_verified": True,
        "createdAt": datetime.datetime.utcnow().isoformat()
    }

    try:
        supabase.table("users").insert(new_user).execute()
        if email in otp_store:
            del otp_store[email]
        if email in unverified_users:
            del unverified_users[email]
        return {
            "status": "success",
            "message": "Account successfully verified and created.",
            "user": {"email": email}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database insert error: {str(e)}")

@app.post("/api/auth/login")
async def login_user(data: UserLoginModel):
    email    = data.email.strip().lower()
    password = data.password.strip()

    try:
        res = supabase.table("users").select("*").eq("email", email).execute()
        if not res.data or len(res.data) == 0:
            raise HTTPException(status_code=401, detail="Invalid email or password.")

        user = res.data[0]
        if not verify_password(password, user["password"]):
            raise HTTPException(status_code=401, detail="Invalid email or password.")

        return {
            "status": "success",
            "message": "Authentication successful.",
            "user": {"email": email}
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/admin/login")
async def login_admin(data: AdminLoginModel):
    username = data.username.strip()
    password = data.password.strip()

    # Hardcoded admin emergency fallback if DB not populated yet
    if username in ["salman", "mobin"]:
        expected_pass = "salman@HOTT2026!" if username == "salman" else "mobin@HOTT2026!"
        if password == expected_pass:
            return {
                "status": "success",
                "message": "Admin authentication successful.",
                "username": username
            }

    try:
        res = supabase.table("admins").select("*").eq("username", username).execute()
        if res.data and len(res.data) > 0:
            admin = res.data[0]
            if verify_password(password, admin["password"]):
                return {
                    "status": "success",
                    "message": "Admin authentication successful.",
                    "username": username
                }
    except Exception as e:
        print(f"[ADMIN AUTH DB NOTICE] {e}")

    raise HTTPException(status_code=401, detail="Invalid Tech ID or security Passkey code.")