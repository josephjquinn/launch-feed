import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import DailyReport from "./pages/DailyReport";
import NewsSearch from "./pages/NewsSearch";
import DateGuessGame from "./pages/DateGuessGame";
import TopHeadlines from "./pages/TopHeadlines";
import AuthCallback from "./pages/AuthCallback";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth-callback" element={<AuthCallback />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="daily-report" element={<DailyReport />} />
          <Route path="news-search" element={<NewsSearch />} />
          <Route path="top-headlines" element={<TopHeadlines />} />
          <Route path="date-guess-game" element={<DateGuessGame />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
