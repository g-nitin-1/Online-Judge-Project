import axios from "axios"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";


const getQuestions = async (lang)=>{
  try {

    const res = await axios
      .get(`${API_URL}/api/questions/`)
    return (res.data)
  } catch(err) {
    throw new Error(err.response?.data?.error || "Unable to load questions")
  }


}
export  {getQuestions} 
