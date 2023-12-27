import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Editor } from './component/editor'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Editor />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
