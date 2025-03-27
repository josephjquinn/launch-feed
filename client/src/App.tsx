import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Launches from "./pages/Launches";
import DailyReport from "./pages/DailyReport";
import NewsSearch from "./pages/NewsSearch";
import SemanticSearch from "./pages/SemanticSearch";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="launches" element={<Launches />} />
          <Route path="daily-report" element={<DailyReport />} />
          <Route path="news-search" element={<NewsSearch />} />
          <Route path="semantic-search" element={<SemanticSearch />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
