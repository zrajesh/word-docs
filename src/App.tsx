import {
  BrowserRouter as Router,
  Routes, 
  Route,
  Navigate
} from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';

import TextEditor from "./TextEditor"

function App() {
  return (
    <Router>      
      <Routes>
        <Route path="/" element={<Navigate to={`/documents/${uuidv4()}`} />}>
        </Route>
        <Route path="/documents/:id" element={<TextEditor />} />
      </Routes>
    </Router>
  )
}

export default App
