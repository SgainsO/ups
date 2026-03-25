import os
import time
import random
import json
import math
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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

class master_json(BaseModel):
    name: str
    schema_name: str  # 'schema' is reserved in Pydantic v1
    json: dict


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://localhost:3000"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.get("/")
async def health_check():
    return {"status": "healthy"}

@app.post("/new_json_user_pro")
async def create_new_json(data: master_json):
    time2sleep = random.randrange(150,500)
    time.sleep(time2sleep / 1000)  # convert ms to seconds


    with open(f"jsons/{data.name}.jsonl", 'w') as f:
            json.dump(data.model_dump(), f)
    errors = []
    warning = []

    specific = data.json
    types = ["id", "email", "age", "country"]

    notCor = False

    for type in types:
        if type not in specific:
            errors.append([type, "missing from json file"])  # was a set literal
            notCor = True
    if "name" not in specific:
        warning.append({"name", "missing from json file"})  # was [] instead of ()
    count_ops = ["US", "EU", "IN"]  # was a single string "US, EU, IN"
    cor = False

    if "country" in specific:
        for option in count_ops:
            if option == specific["country"]:
                cor = True
                break
    if not cor:
        errors.append(["country", "incorrect country"])  # append takes one argument
        notCor = True

    if "age" in specific:
        if specific["age"] > 120 or specific["age"] < 25:
            errors.append(["age", "age is not in the correct range (13 - 120)"])  # append takes one argument
            notCor = True

    if "email" in specific:
        if "@" not in specific["email"]:
            errors.append(["email", "please enter an email in the correct format"])  # append takes one argument
            notCor = True

    return_json = {
            "ok": False,
            "errors": errors,
            "warnings": warning,
            "summary": {},
            "latency" : time2sleep,
            "timestamp" : "ISO-8601"
            } if notCor else {
            "ok": True,
            "errors": errors,
            "warnings": warning,
            "summary" : {},
            "latency" : time2sleep,
            "timestamp" : "ISO-8601"
            }
    
    with open(f"jsons/{data.name}.json", 'w') as f:
        json.dump(return_json, f)

    return return_json

@app.post("/new_json_order")
async def create_new_order(data : master_json):
    time2sleep = random.randrange(150,500)
    time.sleep(time2sleep / 1000)  # convert ms to seconds
    with open(f"jsons/{data.name}.jsonl", 'w') as f:
        json.dump(data.model_dump(), f)


    errors = []
    warning = []
    specific = data.json
    noPrice = False
    total_sum = 0
    if "items" in specific:
        items = specific["items"]  

        for index, item in enumerate(items):  
            if "sku" not in item:
                errors.append(["items", f"sku was not found in index {index}"])
                break
            if "price" not in item or "qty" not in item:
                errors.append(["price", "Items missing either a price or qty instance; can not correct price"])
                noPrice = True
                break
            else:
                total_sum += item["price"] * item["qty"] 
            if item["qty"] < 1:  
                errors.append(["qty", f"An instance of invalid quantity value found {item['qty']}"])  # append takes one argument

    else:
        errors.append(["items", "items is missing from database"])
    if "price" not in specific:
        errors.append(["price", "a value for price was not provided"])

    if not noPrice and "price" in specific:
        if abs(total_sum - specific["price"]) > .01:  
            errors.append(["price", f"the total sum and the did not match: {total_sum}"])  # append takes one argument


    toReturn = {
        "ok": True if len(errors) == 0 else False,
        "errors": errors,
        "warnings": warning,
        "summary" : {},
        "latency" : time2sleep,
        "timestamp" : "ISO-8601"
        }
    
    with open(f"jsons/{data.name}.json", 'w') as f:
        json.dump(toReturn, f)
    return toReturn

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
