import  { user_profile, order } from "./types";

export const parseUser = (user:string, promptStateShow:any, promptText:any) : user_profile | null =>
{
    let errors : string[] = []
    try {   
        const text = JSON.parse(user) as user_profile; 
        //Parses as a type; if syntax mistake will fail
        if (text.country !== "US" && text.country !== "IN" && text.country !== "UK")
        {
            errors.push(`Make sure the selected country is US, EU, or UK\n`)
        }
        if (text.age < 13 || text.age > 120)
        {
            errors.push("Invalid age, please input an age between 13 and 20\n")
        } 
        if (!text.email.includes("@"))
        {
            errors.push("Please enter a correctly formatted email\n")
        }
        if (errors.length > 0)
        {
            promptText(errors)         
            promptStateShow(true)
            return null
        }
        else
        {
            promptText(["Validating..."])
            promptStateShow(true)
            return text
        }
    }
    catch {
        promptText(["Make sure have ID (text), Email, age, and country"])
        promptStateShow(true)
        return null
    }
}

export const parseOrder = (order:string, promptStateShow:any, promptText:any) : order | null => {
    let errors : string[] = []
    let sum : number = 0
    try {
        const text = JSON.parse(order) as order;
        if (text.items.length < 1){
            errors.push("Please ensure one or more items is in your text\n")

        }

        text.items.forEach((item, index) => { //Loops through each item for error checking
            if(item.qty < 1)
            {
                errors.push(`${index} has a quantity less than one\n`)
            }
            sum += item.qty * item.price
        })
    
        if (Math.abs(parseFloat(sum.toFixed(2)) - parseFloat(text.total.toFixed(2))) > .1)
        {
            errors.push(`Please ensure the total is accurate.\n Calculated Total = ${parseFloat(sum.toFixed(2))}\n`)
        }
        
        if (errors.length > 0)
        {
            promptText(errors) 
            promptStateShow(true)
            return null
        }
        else
        {
            promptText(["Validating..."])
            promptStateShow(true)
            return text
        }


    }
    catch {
        promptText(["Make sure you are entering the correct feilds"])
        promptStateShow(true)
        return null
    }
}
