import axios from "axios"
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const getSubmissions =  async (data)=>{

  try {
    const res = await axios
      .get(`${API_URL}/api/submit/submissions/${encodeURIComponent(data.q)}`, {
        headers: { Authorization: `Bearer ${data.token}` }
      })
      console.log(res)
    return (res.data)
  } catch(err) {
          console.log(err)

    throw new Error(err.response?.data?.error || "Unable to load submissions")
  }


}
export {getSubmissions} 
