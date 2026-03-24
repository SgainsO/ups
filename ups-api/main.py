from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def health_check():
    return {"status": "healthy"}

@app.post("/new_json"):
async def create_new_json(data: dict):
    return {"received_data": data}