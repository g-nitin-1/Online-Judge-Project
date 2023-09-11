import { useState } from 'react';
import axios from 'axios';
import './Style.css';

function SampleCompiler() {
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');

  const handleSubmit = async () => {
    const payload = {
      language: 'cpp',
      code
    };

    try {
      const { data } = await axios.post('http://localhost:5000/samplecompiler/run', payload);
      console.log(data);
      setOutput(data.output);
    } catch (error) {
      console.log(error.response);
    }
  }

  return (
    <div className="container-sc">
      <h1>Nitin Sample Compiler</h1>
       <select className="select-box">
        <option value='cpp'>C++</option>
        <option value='c'>C</option>
      </select>
      <br /> 
      <textarea rows='20' cols='75' className="textarea" value={code} onChange={(e) => {
        setCode(e.target.value);
      }}></textarea>
      <br />
      <button className="submit-button" onClick={handleSubmit}>
        Submit
      </button>
      {output &&
        <div className="outputbox">
          <p>{output}</p>
        </div>
      }
    </div>
  );
}

export default SampleCompiler;