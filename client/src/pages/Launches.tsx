import {
  Client,
  createClient,
  Osdk,
  isOk,
  PageResult,
  Result,
} from "@osdk/client";
import { createPublicOauthClient } from "@osdk/oauth";
import { NytSample } from "@recap/sdk";
import React, { useEffect, useState } from "react";

const client_id: string = "bf0313cefb46ae52f8b9c048e8790089";
const foundryUrl: string = "https://jquinn-launch.usw-18.palantirfoundry.com";
const proxyUrl: string = "http://localhost:5173";
const ontologyRid: string =
  "ri.ontology.main.ontology.ab3b7be9-b65d-4d93-b68c-c5fc218d81e0";
const redirectUrl: string = "http://localhost:5173/";
const scopes: string[] = [
  "api:ontologies-read",
  "api:ontologies-write",
  "api:mediasets-read",
  "api:mediasets-write",
];

const auth = createPublicOauthClient(
  client_id,
  foundryUrl,
  redirectUrl,
  true,
  undefined,
  window.location.toString(),
  scopes
);

const client: Client = createClient(proxyUrl, ontologyRid, auth);

interface Article {
  headline: string;
  abstract: string;
  byline: string;
  pubDate: string;
  webUrl: string;
}

const NewsArticles: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response: Result<PageResult<Osdk.Instance<NytSample>>> =
          await client(NytSample).fetchPageWithErrors({
            $pageSize: 10,
            $orderBy: { pubDate: "desc" },
          });

        if (isOk(response)) {
          const articlesList = response.value.data.map(
            (article: Osdk.Instance<NytSample>) => ({
              headline: article.headline || "No headline",
              abstract: article.abstract || "No abstract available",
              byline: article.byline || "No author",
              pubDate: article.pubDate
                ? new Date(article.pubDate).toLocaleDateString()
                : "No date",
              webUrl: article.webUrl || "#",
            })
          );

          setArticles(articlesList);
        } else {
          setError(response.error.message);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to fetch articles. Please check your authentication.");
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  if (loading)
    return <div className="loading-message">Loading articles...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="news-container">
      <h1>Latest News Articles</h1>
      <div className="articles-grid">
        {articles.map((article, index) => (
          <div key={index} className="article-card">
            <h2>{article.headline}</h2>
            <p className="byline">{article.byline}</p>
            <p className="date">{article.pubDate}</p>
            <p className="abstract">{article.abstract}</p>
            <a href={article.webUrl} target="_blank" rel="noopener noreferrer">
              Read more
            </a>
          </div>
        ))}
      </div>
      <style>{`
        .news-container {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .articles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }

        .article-card {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 20px;
          background: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .article-card h2 {
          margin: 0 0 10px 0;
          font-size: 1.2em;
          color: #333;
        }

        .byline {
          color: #666;
          font-size: 0.9em;
          margin: 5px 0;
        }

        .date {
          color: #888;
          font-size: 0.8em;
          margin: 5px 0;
        }

        .abstract {
          margin: 10px 0;
          line-height: 1.5;
          color: #444;
        }

        a {
          color: #0066cc;
          text-decoration: none;
          font-weight: 500;
        }

        a:hover {
          text-decoration: underline;
        }

        .loading-message,
        .error-message {
          text-align: center;
          padding: 20px;
          font-size: 1.2em;
          color: #666;
        }

        .error-message {
          color: #d32f2f;
        }
      `}</style>
    </div>
  );
};

export default NewsArticles;
