
export interface user_profile {
    id : string
    name : string | null
    email: string
    age: number
    country: string
}

export interface item {
    sku: string
    qty: number
    price: number
}

export interface order {
    order_id: string
    items: item[]
    total: number
}

export interface master {
    name: string
    schema: string
    json: any
}

export interface debug_item {
    type: string
    msg: string
}