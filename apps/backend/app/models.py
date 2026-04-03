from pydantic import BaseModel
from typing import Optional, List


class User(BaseModel):
    id: Optional[str] = None
    email: str
    name: Optional[str] = None
    password_hash: str
    is_admin: bool = False


class ProductImage(BaseModel):
    id: str
    alt: str
    url: str


class Money(BaseModel):
    currency: str = "USD"
    amount: float


class ProductVariant(BaseModel):
    id: str
    label: str
    material: str
    finish: str
    size: str
    in_stock: bool = True
    price: Money


class Product(BaseModel):
    id: Optional[str] = None
    slug: str
    name: str
    tagline: Optional[str] = ""
    description: Optional[str] = ""
    badges: List[str] = []
    categories: List[str] = []
    images: List[ProductImage] = []
    variants: List[ProductVariant] = []
    featured_rank: Optional[int] = None
    active: bool = True


class Collection(BaseModel):
    id: Optional[str] = None
    slug: str
    title: str
    description: str = ""
    product_slugs: List[str] = []


class OrderItem(BaseModel):
    product_id: str
    quantity: int
    unit_price: Money


class Order(BaseModel):
    id: Optional[str] = None
    user_id: str
    items: List[OrderItem]
    status: str = "pending"


class LoginInput(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
