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
    schema_name: str 
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
    print(data)
    time2sleep = random.randrange(150,500)
    time.sleep(time2sleep / 1000) 
    errors = []
    warning = []

    specific = data.json
    print(specific)
    types = ["id", "email", "age", "country"]

    notCor = False

    for type in types:
        if type not in specific:
            errors.append([type, "missing from json file"]) 
            notCor = True
    if "name" not in specific:
        warning.append({"name", "missing from json file"}) 
    count_ops = ["US", "EU", "IN"] 
    cor = False

    if "country" in specific:
        for option in count_ops:
            if option == specific["country"]:
                cor = True
                break
    if not cor:
        errors.append(["country", "incorrect country"])
        notCor = True

    if "age" in specific:
        if specific["age"] > 120 or specific["age"] < 25:
            errors.append(["age", "age is not in the correct range (13 - 120)"])  

    if "email" in specific:
        if "@" not in specific["email"]:
            errors.append(["email", "please enter an email in the correct format"])  
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

    if not notCor: 
        with open(f"jsons/database/{data.name}_{data.schema_name}.json", 'w') as f:
            json.dump(data.model_dump(), f)
    with open(f"jsons/{data.name}.jsonl", 'w') as f:
        json.dump(return_json, f)

    return return_json

@app.post("/new_json_order")
async def create_new_order(data : master_json):
    time2sleep = random.randrange(150,500)
    time.sleep(time2sleep / 1000)  

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
                errors.append(["price", "Items missing either a price or qty instance; can not calculate correct price"])
                noPrice = True
                break
            else:
                total_sum += item["price"] * item["qty"] 
            if item["qty"] < 1:  
                errors.append(["qty", f"An instance of invalid quantity value found {item['qty']}"]) 
    else:
        errors.append(["items", "items is missing from database"])
    if "total" not in specific:
        errors.append(["total", "a value for full price (total) was not provided"])

    if not noPrice and "price" in specific:
        if abs(total_sum - specific["price"]) > .01:  
            errors.append(["price", f"the total sum and the did not match: {total_sum}"]) 

    toReturn = {
        "ok": True if len(errors) == 0 else False,
        "errors": errors,
        "warnings": warning,
        "summary" : {},
        "latency" : time2sleep,
        "timestamp" : "ISO-8601"
        }
    if len(errors) == 0:
        with open(f"jsons/database/{data.name}_{data.schema_name}.json", 'w') as f:
            json.dump(data.model_dump(), f)

    with open(f"jsons/{data.name}.jsonl", 'w') as f:
        json.dump(toReturn.dump(), f)
    return toReturn

@app.get("/list-jsons")
async def list_jsons():
    file_names = []
    schema_names = []
    for filename in os.listdir("jsons/database"):
        if filename.endswith(".json"):
            items = filename.split("_")
            file_names.append([items[0], items[1]])
    return {"file_names": file_names}

@app.delete("/delete-jsons/{name}")
async def delete_jsons(name: str):
    for filename in os.listdir("jsons/database"):
        if name in filename.split("_")[0]:
            os.remove(os.path.join("jsons/database", filename))
    return {"ok": True}

@app.get("/select-json/{name}")
async def select_json(name: str):
    for filename in os.listdir("jsons/database"):
        if filename.split("_")[0] == name:
            with open(os.path.join("jsons/database", filename), 'r') as f:
                return {"ok": True, "data": json.load(f)}
    return {"ok": False, "data": "File not found"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
