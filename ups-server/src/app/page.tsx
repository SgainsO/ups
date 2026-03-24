"use client";
import {parseUser, parseOrder} from "./parse"
import { user_profile, order } from "./types";
import { useState, useEffect } from "react";
import styles from "./container.module.css";
import { json } from "stream/consumers";


export default function Home() {
  const [name, setName] = useState<string>("John Doe")
  const [inputText, setInputText] = useState<string>("")
  const [showError, setShowError] = useState<boolean>(false)
  const [promptText, setPromptText] = useState<string[]>([])
  const [schema, setSchema] = useState<"user_profile" | "order">("user_profile")


  useEffect(() => {
    const timeFailure = () => {
      if (showError) {
        setTimeout(() => {
          setShowError(false);
          setPromptText([])
        }, 3000);
      }
    };
    timeFailure()
  }, [showError])

  const handleCall = async () => {
    console.log(promptText)
    let jsonified : user_profile | order | null = null
    if (schema === "user_profile") {
      jsonified = parseUser(inputText, setShowError, setPromptText)
    } else if (schema === "order") {
      jsonified = parseOrder(inputText, setShowError, setPromptText)
    }
    setShowError(true) //FOR DEBUG REMOVE
    return //For testing
    if (jsonified === null){return}

    const response = await fetch("/new_json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, schema, json: jsonified })
    }).then(res => {
      if (!res.ok) {
        setPromptText(["Error on the backend side"])
        setShowError(true)
      }
      return res.json();
    }
    )
  }

  return (
    <div className={styles.main}>
      <div className={styles.container}>
        
        <h1>UPS Server</h1>
        <div style={{display: "flex", alignItems: "center", flexDirection: "column"}}>
          {promptText && showError && promptText.length > 0 ? 
          promptText.map((string, key ) => <h3 key={key}>{string}</h3>) : <h3></h3>}
        </div>

        <textarea cols={50}
         onChange={(e) => {setInputText(e.target.value)}}
         defaultValue="add your json here"
          style={{ width: "100%", height: "50%" }} />
     
        <div className={styles.select_and_go}>
          <select style={{ width: "100px", height: "40px" }}>
            <option value="user_profile">user_profile</option>
            <option value="order">order</option>
          </select>

          <button style={{ width: "100px", height: "40px"}} 
          onClick={() => {handleCall()}}
          disabled={ showError? true : false}>
            Validate
          </button>
    
        </div>
      </div>
    </div>
  );
}
