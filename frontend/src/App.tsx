import React from 'react';
import { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  const [fetchedData, setfetchedData] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/quizzes/statistics").then((response) => {
      return response.json();
    }).then((data) => {
          setfetchedData(data);
    });
  }, []);

  if (fetchedData) {
    Object.entries(fetchedData).forEach((val) => {
      console.log(val[0]);
      console.log(val[1]);
    })
  }


  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
