import React, { useEffect, useState } from 'react'
import { getSubmissions } from '../api/getSubmissions'
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import AceEditor from 'react-ace';
import './Style.css'
import "ace-builds/src-min-noconflict/theme-tomorrow"
import { getStoredUser } from '../utils/session';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 900,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};
const Submissions = (question) => {
  const user = getStoredUser();
      const [open, setOpen] = React.useState(false);
      const [item , setItem] = useState({})
  const handleOpen = (item) => {
    setItem(item)
    setOpen(true);

  }
  const handleClose = () => setOpen(false);
    const [submissions,setSubmitions]  =useState([])
    useEffect(()=>{
      if (!user) {
        setSubmitions([]);
        return;
      }

        const data = {
            token : user.token,
            q:question.question
        }

      getSubmissions(data).then((data)=>{
        console.log(data)
        setSubmitions(data)
      }).catch((err)=>{
        console.log(err)
      })


    },[question.question, user?.token])
  



  return (
    <div className='overflow-auto'>
    <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
     
     <div className="d-flex overflow-auto mb-3 justify-content-between border-bottom border-secondary">
              <div>
              {item.status === "pass"? 
                <h6 className="text-success m-0 green">Accepted</h6>
              :
                <h6 className="text-danger m-0">Wrong Answer</h6>
               }
                <p className="text-secondary">{new Date(item.timesubmitted).toLocaleString()}</p>
              </div>
              <h6 className="text-primary ms-5 ps-5">{item.language}</h6>
              <h6 className="text-dark ms-5 ps-5">{item.runtime/1000+"s"}</h6>

            </div>
                            <i onClick={() => {navigator.clipboard.writeText(item.solution)}} className="fas fa-copy"></i>

            <div className="border">
       <AceEditor
  placeholder="Placeholder Text"
  mode={item.language === "java" ? "java" : item.language === "python" ? "python" : "javascript"}
  disabled={true}
  theme="tomorrow"
  name="blah2"
  height={450}
  width={"100%"}
  fontSize={14}
  showPrintMargin={true}
  showGutter={true}
  highlightActiveLine={true}
  value={item.solution}
  setOptions={{
  enableBasicAutocompletion: false,
  enableLiveAutocompletion: false,
  enableSnippets: false,
  showLineNumbers: true,
  tabSize: 2,
  }}/>
            </div>
     
        </Box>
      </Modal>
    <div className="overflow-auto">
            {submissions.map((item)=>(

            <div key={item._id} onClick={()=>handleOpen(item)} className="d-flex justify-content-between mb-3 mt-1  border-bottom border-secondary hvr-bob hvr-shadow box">
              <div>
              {item.status === "pass"? 
                <h6 className="text-success m-0 green">Accepted</h6>
              :
                <h6 className="text-danger m-0">Wrong Answer</h6>
               }
                <p className="text-secondary">{new Date(item.timesubmitted).toLocaleString()}</p>
              </div>
              <h6 className="text-primary ms-5 ps-5">{item.language}</h6>
              <h6 className="text-white ms-5 ps-5">{item.runtime/1000+"s"}</h6>
            </div>
            ))}
            



     </div>    
    </div>
  )
}

export default Submissions
