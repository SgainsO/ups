from fastapi import FastAPI
from pydantic import BaseModel


app = FastAPI()

class user_profile(BaseModel):
    id : str
    name : str | None
    email: str
    age: int
    country: str

class item(BaseModel):
    sku: str
    qty: int
    price: int

class order(BaseModel):
    order_id: str
    items: list[str]
    total: int



class user_json(BaseModel):
    name: str
    schema: str
    json: dict


@app.get("/")
async def health_check():
    return {"status": "healthy"}

@app.post("/new_json")
async def create_new_json(data: user_json):
    return {"received_data": data}