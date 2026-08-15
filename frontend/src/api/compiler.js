import axios from "axios"
import { getStoredUser } from "../utils/session";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";


const compile =  async (data)=>{

 

  try {
    const user = getStoredUser();
    if (!user) throw new Error("Please log in before submitting a solution");
    const res = await axios
      .post(`${API_URL}/api/submit/run`, data, {
        headers: { Authorization: `Bearer ${user.token}` }
      })
      console.log(res.data)
    return (res.data)
  } catch(err) {
          console.log("error" , err)
    throw new Error(err.response?.data?.error || "Unable to submit solution")
  }


}
export  {compile} 
