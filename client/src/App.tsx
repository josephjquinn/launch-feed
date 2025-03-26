import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Launches from "./pages/Launches";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="launches" element={<Launches />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
