import Image from "next/image";
import styles from "./container.module.css";

export default function Home() {
  return (
    <div className={styles.main}>
      <div className={styles.container}>
        
        <h1>UPS Server</h1>

        <textarea cols={50} defaultValue="add your json here" style={{ width: "100%", height: "50%" }} />
        <div className={styles.select_and_go}>
          <select style={{ width: "100px", height: "40px" }}>
            <option value="option1">user_profile</option>
            <option value="option2">order</option>
          </select>
            <button style={{ width: "100px", height: "40px"}}>Validate</button>
        </div>
      </div>
    </div>
  );
}
