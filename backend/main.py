from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from typing import List, Optional
from bson import ObjectId
from seed_data import SEED_PRODUCTS
import os
import urllib.request
import urllib.error
import json
import random
import smtplib
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

# 2. Set up the MongoDB Connection
MONGO_DETAILS = os.getenv("MONGODB_URI", "mongodb://127.0.0.1:27017")

client = AsyncIOMotorClient(MONGO_DETAILS)
database = client.heat_one_db
product_collection = database.get_collection("products")
inquiry_collection = database.get_collection("inquiries")
user_collection = database.get_collection("users")
admin_collection = database.get_collection("admins")

# 3. Define Pydantic Models
class ProductModel(BaseModel):
    id: Optional[str] = None
    name: str
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

# Helper serializer
def serialize_doc(doc) -> dict:
    if not doc:
        return doc
    doc["id"] = str(doc["_id"])
    if "_id" in doc:
        del doc["_id"]
    return doc


# ─────────────────────────────────────────────
#  EMAIL DISPATCH SYSTEM (RESEND & SMTP FALLBACK)
# ─────────────────────────────────────────────

def _resend_send(to_email: str, subject: str, html_body: str) -> bool:
    """Low-level helper: sends one email via the Resend HTTPS API, trying multiple fallbacks."""
    api_key = os.getenv("RESEND_API_KEY")
    if not api_key:
        print("WARNING: RESEND_API_KEY not set. Skipping Resend email dispatch.")
        return False

    # Try different potential verified domains in order
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
                "Content-Type": "application/json"
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
    """Sends email using Resend (with multiple domain fallbacks), falling back to SMTP if it fails."""
    # 1. Try Resend if API key is provided
    if os.getenv("RESEND_API_KEY"):
        resend_success = _resend_send(to_email, subject, html_body)
        if resend_success:
            return True
    
    # 2. Try SMTP fallback
    return _smtp_send(to_email, subject, html_body)


def send_otp_email(email: str, otp: str) -> bool:
    """Sends OTP verification email via Resend."""
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
    """Sends inquiry notification email to the admin via Resend."""
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


# 4. Startup event to seed the database if empty
@app.on_event("startup")
async def seed_db():
    count = await product_collection.count_documents({})
    if count == 0:
        print("Seeding MongoDB database with initial catalog products...")
        seeded = []
        for index, p in enumerate(SEED_PRODUCTS):
            p_dict = dict(p)
            p_dict["_id"] = p_dict["id"]
            p_dict["order"] = index
            seeded.append(p_dict)
        await product_collection.insert_many(seeded)
        print(f"Successfully seeded {len(SEED_PRODUCTS)} products.")
    else:
        missing_order_count = await product_collection.count_documents({"order": {"$exists": False}})
        if missing_order_count > 0:
            print(f"Migrating {missing_order_count} products to add 'order' field...")
            cursor = product_collection.find({})
            index = 0
            async for doc in cursor:
                await product_collection.update_one(
                    {"_id": doc["_id"]},
                    {"$set": {"order": doc.get("order", index)}}
                )
                index += 1
            print("Successfully migrated product orders.")

    admin_count = await admin_collection.count_documents({})
    if admin_count == 0:
        print("Seeding admins into database...")
        admins_to_seed = [
            {"username": "salman", "password": hash_password("salman@HOTT2026!")},
            {"username": "mobin",  "password": hash_password("mobin@HOTT2026!")}
        ]
        await admin_collection.insert_many(admins_to_seed)
        print("Successfully seeded admins.")


# 5. API Routes for Products
@app.get("/")
async def read_root():
    return {"message": "Welcome to the Heat One API! The engine is running."}

@app.get("/test-openapi")
async def test_openapi():
    return {
        "openapi_url": app.openapi_url,
        "docs_url": app.docs_url,
        "redoc_url": app.redoc_url
    }

@app.get("/api/products")
async def get_all_products():
    products = []
    cursor = product_collection.find({}).sort("order", 1)
    async for document in cursor:
        products.append(serialize_doc(document))
    return {"products": products}

@app.post("/api/products")
async def create_product(product: ProductModel):
    product_dict = product.dict()
    if product_dict.get("id"):
        product_dict["_id"] = product_dict["id"]
    else:
        product_dict.pop("id", None)

    try:
        if "_id" in product_dict:
            existing = await product_collection.find_one({"_id": product_dict["_id"]})
            if existing:
                if "order" in existing and (product_dict.get("order") is None or product_dict.get("order") == 0):
                    product_dict["order"] = existing["order"]
                await product_collection.replace_one({"_id": product_dict["_id"]}, product_dict)
                return {"message": "Product updated successfully", "id": product_dict["_id"]}

        if product_dict.get("order") is None or product_dict.get("order") == 0:
            cursor = product_collection.find({}).sort("order", -1).limit(1)
            max_order_doc = await cursor.to_list(1)
            if max_order_doc:
                product_dict["order"] = max_order_doc[0].get("order", 0) + 1
            else:
                product_dict["order"] = 0

        new_product = await product_collection.insert_one(product_dict)
        return {"message": "Product added successfully", "id": str(new_product.inserted_id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/products/{product_id}")
async def update_product(product_id: str, product: ProductModel):
    product_dict = product.dict()
    product_dict.pop("id", None)
    product_dict["_id"] = product_id
    try:
        existing = await product_collection.find_one({"_id": product_id})
        if existing:
            if "order" in existing and (product_dict.get("order") is None or product_dict.get("order") == 0):
                product_dict["order"] = existing["order"]
            await product_collection.replace_one({"_id": product_id}, product_dict)
            return {"message": "Product updated successfully", "id": product_id}
        else:
            if product_dict.get("order") is None or product_dict.get("order") == 0:
                cursor = product_collection.find({}).sort("order", -1).limit(1)
                max_order_doc = await cursor.to_list(1)
                if max_order_doc:
                    product_dict["order"] = max_order_doc[0].get("order", 0) + 1
                else:
                    product_dict["order"] = 0
            await product_collection.insert_one(product_dict)
            return {"message": "Product created successfully", "id": product_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ReorderPayload(BaseModel):
    product_ids: List[str]

@app.post("/api/products/reorder")
async def reorder_products(payload: ReorderPayload):
    try:
        for index, product_id in enumerate(payload.product_ids):
            await product_collection.update_one(
                {"_id": product_id},
                {"$set": {"order": index}}
            )
        return {"message": "Products reordered successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/products/{product_id}")
async def delete_product(product_id: str):
    try:
        result = await product_collection.delete_one({"_id": product_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Product not found")
        return {"message": "Product deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/products")
async def reset_products_catalog():
    try:
        await product_collection.delete_many({})
        seeded = []
        for index, p in enumerate(SEED_PRODUCTS):
            p_dict = dict(p)
            p_dict["_id"] = p_dict["id"]
            p_dict["order"] = index
            seeded.append(p_dict)
        await product_collection.insert_many(seeded)
        return {"message": "Catalog reset to default"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/users")
async def get_all_users():
    users = []
    try:
        cursor = user_collection.find({})
        async for document in cursor:
            doc = serialize_doc(document)
            if "password" in doc:
                del doc["password"]
            users.append(doc)
        return {"users": users}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 6. API Routes for Inquiries
@app.get("/api/inquiries")
async def get_all_inquiries(email: Optional[str] = None):
    inquiries = []
    try:
        query = {}
        if email:
            query["email"] = email.strip()
        cursor = inquiry_collection.find(query).sort("_id", -1)
        async for document in cursor:
            inquiries.append(serialize_doc(document))
        return {"inquiries": inquiries}
    except Exception as e:
        print(f"Database error: {e}")
        return {"inquiries": []}

@app.post("/api/inquiries")
async def create_inquiry(inquiry: InquiryModel, background_tasks: BackgroundTasks):
    inquiry_dict = inquiry.dict()
    inquiry_dict.pop("id", None)
    try:
        new_inquiry = await inquiry_collection.insert_one(inquiry_dict)
        inquiry_dict["id"] = str(new_inquiry.inserted_id)

        background_tasks.add_task(send_inquiry_email, inquiry_dict)

        return {
            "status": "success",
            "message": "Inquiry submitted successfully.",
            "inquiry_id": str(new_inquiry.inserted_id)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/inquiries/{inquiry_id}")
async def delete_inquiry(inquiry_id: str):
    try:
        query = {"_id": inquiry_id}
        try:
            query = {"$or": [{"_id": inquiry_id}, {"_id": ObjectId(inquiry_id)}]}
        except:
            pass
        result = await inquiry_collection.delete_one(query)
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Inquiry not found")
        return {"message": "Inquiry deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/inquiries")
async def clear_all_inquiries():
    try:
        await inquiry_collection.delete_many({})
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

    existing = await user_collection.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email address already exists.")

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

    import datetime
    new_user = {
        "email": email,
        "password": password_hash,
        "is_verified": True,
        "createdAt": datetime.datetime.utcnow().isoformat()
    }

    try:
        await user_collection.insert_one(new_user)
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

    user = await user_collection.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    if not verify_password(password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    return {
        "status": "success",
        "message": "Authentication successful.",
        "user": {"email": email}
    }

@app.post("/api/admin/login")
async def login_admin(data: AdminLoginModel):
    username = data.username.strip()
    password = data.password.strip()

    admin = await admin_collection.find_one({"username": username})
    if not admin:
        raise HTTPException(status_code=401, detail="Invalid Tech ID or security Passkey code.")

    if not verify_password(password, admin["password"]):
        raise HTTPException(status_code=401, detail="Invalid Tech ID or security Passkey code.")

    return {
        "status": "success",
        "message": "Admin authentication successful.",
        "username": username
    }