import os
import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from pymongo import MongoClient
import base64

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'test_database')

client = MongoClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI(title="السوق المفتوح API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data models
class User(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    region: str
    created_at: datetime
    is_admin: bool = False

class Category(BaseModel):
    id: str
    name: str
    name_en: str
    icon: str
    created_at: datetime

class Region(BaseModel):
    id: str
    name: str
    name_en: str
    created_at: datetime

class Listing(BaseModel):
    id: str
    title: str
    description: str
    price: float
    condition: str  # new, used
    category_id: str
    region_id: str
    user_id: str
    images: List[str]
    contact_phone: str
    contact_email: str
    is_featured: bool = False
    is_sold: bool = False
    views_count: int = 0
    created_at: datetime
    expires_at: datetime

class PaymentRecord(BaseModel):
    id: str
    listing_id: str
    user_id: str
    amount: float
    fee_type: str  # 'listing_fee', 'commission'
    payment_method: str  # 'bank_transfer', 'stc_pay', 'paypal'
    status: str  # 'pending', 'completed', 'failed'
    created_at: datetime

# Default data initialization
def init_default_data():
    # Categories
    default_categories = [
        {"id": str(uuid.uuid4()), "name": "السيارات", "name_en": "Cars", "icon": "🚗", "created_at": datetime.now()},
        {"id": str(uuid.uuid4()), "name": "العقارات", "name_en": "Real Estate", "icon": "🏠", "created_at": datetime.now()},
        {"id": str(uuid.uuid4()), "name": "الإلكترونيات", "name_en": "Electronics", "icon": "📱", "created_at": datetime.now()},
        {"id": str(uuid.uuid4()), "name": "الأثاث", "name_en": "Furniture", "icon": "🛏️", "created_at": datetime.now()},
        {"id": str(uuid.uuid4()), "name": "الملابس", "name_en": "Clothing", "icon": "👕", "created_at": datetime.now()},
        {"id": str(uuid.uuid4()), "name": "الرياضة", "name_en": "Sports", "icon": "⚽", "created_at": datetime.now()},
        {"id": str(uuid.uuid4()), "name": "الكتب", "name_en": "Books", "icon": "📚", "created_at": datetime.now()},
        {"id": str(uuid.uuid4()), "name": "أخرى", "name_en": "Others", "icon": "📦", "created_at": datetime.now()}
    ]
    
    # Regions
    default_regions = [
        {"id": str(uuid.uuid4()), "name": "الرياض", "name_en": "Riyadh", "created_at": datetime.now()},
        {"id": str(uuid.uuid4()), "name": "جدة", "name_en": "Jeddah", "created_at": datetime.now()},
        {"id": str(uuid.uuid4()), "name": "الدمام", "name_en": "Dammam", "created_at": datetime.now()},
        {"id": str(uuid.uuid4()), "name": "مكة", "name_en": "Makkah", "created_at": datetime.now()},
        {"id": str(uuid.uuid4()), "name": "المدينة", "name_en": "Madinah", "created_at": datetime.now()},
        {"id": str(uuid.uuid4()), "name": "الطائف", "name_en": "Taif", "created_at": datetime.now()},
        {"id": str(uuid.uuid4()), "name": "تبوك", "name_en": "Tabuk", "created_at": datetime.now()},
        {"id": str(uuid.uuid4()), "name": "القصيم", "name_en": "Qassim", "created_at": datetime.now()},
        {"id": str(uuid.uuid4()), "name": "جازان", "name_en": "Jazan", "created_at": datetime.now()},
        {"id": str(uuid.uuid4()), "name": "أبها", "name_en": "Abha", "created_at": datetime.now()}
    ]
    
    # Initialize collections if empty
    if db.categories.count_documents({}) == 0:
        db.categories.insert_many(default_categories)
    
    if db.regions.count_documents({}) == 0:
        db.regions.insert_many(default_regions)
    
    # Create admin user if doesn't exist
    if db.users.count_documents({"is_admin": True}) == 0:
        admin_user = {
            "id": str(uuid.uuid4()),
            "name": "المدير",
            "email": "admin@souq.com",
            "phone": "+966500000000",
            "region": "الرياض",
            "is_admin": True,
            "created_at": datetime.now()
        }
        db.users.insert_one(admin_user)

# Initialize default data on startup
init_default_data()

# API Routes

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "message": "السوق المفتوح API is running"}

# Categories
@app.get("/api/categories")
async def get_categories():
    categories = list(db.categories.find({}, {"_id": 0}))
    return categories

@app.post("/api/categories")
async def create_category(name: str = Form(...), name_en: str = Form(...), icon: str = Form(...)):
    category = {
        "id": str(uuid.uuid4()),
        "name": name,
        "name_en": name_en,
        "icon": icon,
        "created_at": datetime.now()
    }
    db.categories.insert_one(category)
    return category

# Regions
@app.get("/api/regions")
async def get_regions():
    regions = list(db.regions.find({}, {"_id": 0}))
    return regions

@app.post("/api/regions")
async def create_region(name: str = Form(...), name_en: str = Form(...)):
    region = {
        "id": str(uuid.uuid4()),
        "name": name,
        "name_en": name_en,
        "created_at": datetime.now()
    }
    db.regions.insert_one(region)
    return region

# Users
@app.get("/api/users")
async def get_users():
    users = list(db.users.find({}, {"_id": 0}))
    return users

@app.post("/api/users")
async def create_user(
    name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    region: str = Form(...)
):
    # Check if email exists
    existing_user = db.users.find_one({"email": email})
    if existing_user:
        raise HTTPException(status_code=400, detail="البريد الإلكتروني موجود بالفعل")
    
    user = {
        "id": str(uuid.uuid4()),
        "name": name,
        "email": email,
        "phone": phone,
        "region": region,
        "is_admin": False,
        "created_at": datetime.now()
    }
    db.users.insert_one(user)
    return user

# Listings
@app.get("/api/listings")
async def get_listings(
    category_id: Optional[str] = None,
    region_id: Optional[str] = None,
    condition: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 20,
    skip: int = 0
):
    query = {}
    
    if category_id:
        query["category_id"] = category_id
    if region_id:
        query["region_id"] = region_id
    if condition:
        query["condition"] = condition
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    
    listings = list(db.listings.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit))
    total = db.listings.count_documents(query)
    
    return {"listings": listings, "total": total}

@app.get("/api/listings/{listing_id}")
async def get_listing(listing_id: str):
    listing = db.listings.find_one({"id": listing_id}, {"_id": 0})
    if not listing:
        raise HTTPException(status_code=404, detail="الإعلان غير موجود")
    
    # Increment view count
    db.listings.update_one({"id": listing_id}, {"$inc": {"views_count": 1}})
    listing["views_count"] += 1
    
    return listing

@app.post("/api/listings")
async def create_listing(
    title: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    condition: str = Form(...),
    category_id: str = Form(...),
    region_id: str = Form(...),
    user_id: str = Form(...),
    contact_phone: str = Form(...),
    contact_email: str = Form(...),
    images: List[UploadFile] = File(...)
):
    if len(images) > 4:
        raise HTTPException(status_code=400, detail="يمكن رفع 4 صور كحد أقصى")
    
    # Process images
    image_data = []
    for image in images:
        content = await image.read()
        encoded_image = base64.b64encode(content).decode('utf-8')
        image_data.append(f"data:{image.content_type};base64,{encoded_image}")
    
    listing = {
        "id": str(uuid.uuid4()),
        "title": title,
        "description": description,
        "price": price,
        "condition": condition,
        "category_id": category_id,
        "region_id": region_id,
        "user_id": user_id,
        "images": image_data,
        "contact_phone": contact_phone,
        "contact_email": contact_email,
        "is_featured": False,
        "is_sold": False,
        "views_count": 0,
        "created_at": datetime.now(),
        "expires_at": datetime.now().replace(month=datetime.now().month + 1)  # Expires in 1 month
    }
    
    db.listings.insert_one(listing)
    
    # Create payment record for listing fee
    payment_record = {
        "id": str(uuid.uuid4()),
        "listing_id": listing["id"],
        "user_id": user_id,
        "amount": 2.0,  # 2 SAR listing fee
        "fee_type": "listing_fee",
        "payment_method": "pending",
        "status": "pending",
        "created_at": datetime.now()
    }
    db.payments.insert_one(payment_record)
    
    return listing

# Payments
@app.get("/api/payments")
async def get_payments():
    payments = list(db.payments.find({}, {"_id": 0}).sort("created_at", -1))
    return payments

@app.post("/api/payments/{payment_id}/complete")
async def complete_payment(payment_id: str, payment_method: str = Form(...)):
    payment = db.payments.find_one({"id": payment_id})
    if not payment:
        raise HTTPException(status_code=404, detail="السجل غير موجود")
    
    db.payments.update_one(
        {"id": payment_id},
        {
            "$set": {
                "status": "completed",
                "payment_method": payment_method
            }
        }
    )
    
    return {"message": "تم تأكيد الدفع بنجاح"}

# Admin routes
@app.get("/api/admin/stats")
async def get_admin_stats():
    total_listings = db.listings.count_documents({})
    total_users = db.users.count_documents({})
    total_categories = db.categories.count_documents({})
    total_regions = db.regions.count_documents({})
    pending_payments = db.payments.count_documents({"status": "pending"})
    total_revenue = list(db.payments.aggregate([
        {"$match": {"status": "completed"}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]))
    
    return {
        "total_listings": total_listings,
        "total_users": total_users,
        "total_categories": total_categories,
        "total_regions": total_regions,
        "pending_payments": pending_payments,
        "total_revenue": total_revenue[0]["total"] if total_revenue else 0
    }

@app.delete("/api/admin/listings/{listing_id}")
async def delete_listing(listing_id: str):
    result = db.listings.delete_one({"id": listing_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="الإعلان غير موجود")
    return {"message": "تم حذف الإعلان بنجاح"}

@app.delete("/api/admin/categories/{category_id}")
async def delete_category(category_id: str):
    result = db.categories.delete_one({"id": category_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="الفئة غير موجودة")
    return {"message": "تم حذف الفئة بنجاح"}

@app.delete("/api/admin/regions/{region_id}")
async def delete_region(region_id: str):
    result = db.regions.delete_one({"id": region_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="المنطقة غير موجودة")
    return {"message": "تم حذف المنطقة بنجاح"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)