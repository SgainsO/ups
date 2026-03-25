"use client";
import {parseUser, parseOrder, genericParse} from "./parse"
import { user_profile, order, master, debug_item } from "./types";
import { useState, useEffect } from "react";
import styles from "./container.module.css";
import { json } from "stream/consumers";
import { randomInt } from "crypto";


export default function Home() {
  const [inputText, setInputText] = useState<string>("enter json here")
  const [showError, setShowError] = useState<boolean>(false)
  const [promptText, setPromptText] = useState<string[]>([])
  const [schema, setSchema] = useState<string>("user_profile")

  const [given_json, setGivenJson] = useState<any>(null)

  const [jsonsInDatabase, setJsonsInDatabase] = useState<any>(null)


function makeid(length: number) { //stackoverflow
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}


  useEffect(() => {
    const timeFailure = () => {
      if (showError) {
        setTimeout(() => {
          setShowError(false);
          setPromptText([])
        }, 300);
      }
    };
    timeFailure()
  }, [showError])

  const handleRecieveJsons = async () => {
    const response = await fetch("http://localhost:8000/list-jsons");
    if (!response.ok) {
      setJsonsInDatabase(null)
      console.log("error")
      return
    }
    const data = await response.json();
    console.log(data)
    setJsonsInDatabase(data);
  }

  const handleDeleteJson = async (name: string) => {
    const response = await fetch(`http://localhost:8000/delete-jsons/${name}`, {
      method: "DELETE"
    });
    if (!response.ok) {
      console.log("error")
      return
    }
    const data = await response.json();
    console.log(data)
    handleRecieveJsons();
  }

  const handleCall = async () => {
    let name = makeid(7)
    setGivenJson(null)

    console.log(promptText)
    let jsonified : master | null = null
    jsonified = genericParse(inputText, setShowError, setPromptText)
    if (jsonified === null){return}

    let route = "http://localhost:8000/"
    if (schema === "user_profile") {
      route += "new_json_user_pro"
    } else if (schema === "order") {
      route += "new_json_order"
      console.log(route)
    }
    setShowError(true) //FOR DEBUG REMOVE
    

    const response = await fetch(route, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, schema_name: schema, json: jsonified })
    }).then(async res => {
      if (!res.ok) {
        setPromptText(["Error sending data to server"])
        setShowError(true)
      }
      const data = await res.json();
      console.log(data)
      setGivenJson(data);
    }
    )
  }

  const handleSelectJson = async (name: string) => {
    const response = await fetch(`http://localhost:8000/select-json/${name}`);
    if (!response.ok) {
      console.log("error")
      return
    }
    const data = await response.json();
    console.log(data)
    setInputText(JSON.stringify(data.data["json"]));
  }

  const displayErrors = () => {
    console.log(given_json.errors)
    return given_json.errors.map((ditem: [string, string], key: number) => <h5 key={key}>{ditem[0]} : {ditem[1]}</h5>)
  }

  const displayListJsons = () => {
    if (!jsonsInDatabase) return null;
    return jsonsInDatabase.file_names.map((item: [string, string], key: number) => 
    <div style={{border: "1px solid black", margin: "5px", padding: "5px", display: "flex", flexDirection: "row", alignItems: "center"}}>
    <p key={key} style={{padding: "3px"}}>
    Name: {item[0]} Schema: {item[1]}
    </p>
    <div style={{display: "flex", flexDirection: "column", marginLeft: "auto", paddingLeft: "6px"}}>
      <button onClick={() => {handleDeleteJson(item[0])}}>Delete</button>
      <button onClick={() => {handleSelectJson(item[0])}}>Select</button>
    </div>
  </div>);
}

  return (
    <div className={styles.main}>


      <div className={styles.container}>
         <h1>Json Adder</h1>
              {given_json ?
         <div style={{textAlign: "center"}}>
            <h2 >{given_json.ok ? "Pass" : "Fail"}</h2>
            {!given_json.ok ? displayErrors() : null}
          </div>
         : null}
        <div style={{display: "flex", alignItems: "center", flexDirection: "column"}}>
          {promptText && showError && promptText.length > 0 ? 
          promptText.map((string, key ) => <h3 key={key}>{string}</h3>) : <h3></h3>}
        </div>

        <textarea cols={50}
         value={inputText}
         onChange={(e) => {setInputText(e.target.value)}}
          style={{ width: "100%", height: "50%" }} />
     
        <div className={styles.select_and_go}>
          <select style={{ width: "100px", height: "40px" }}
          onChange={(e) => {setSchema(e.target.value)}}>
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
        <div className={styles.container}>
          <h1>List Json</h1>
          <button style={{ width: "100px", height: "40px"}}
          onClick={() => {handleRecieveJsons()}}
          disabled={ showError? true : false}>
            Fetch
          </button>
            {displayListJsons && displayListJsons()}
        </div>

    </div>
  );
}
