import { isOk } from "@osdk/client";
import { NytSample } from "@recap/sdk";
import React, { useEffect, useState } from "react";
import client from "../lib/foundry";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { ArticleLoadingState } from "@/components/articles/ArticleLoadingState";
import { ArticleErrorState } from "@/components/articles/ArticleErrorState";
import { Newspaper } from "lucide-react";

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
        const response = await client(NytSample).fetchPageWithErrors({
          $pageSize: 10,
          $orderBy: { pubDate: "desc" },
        });

        if (isOk(response)) {
          const articlesList = response.value.data.map((article) => ({
            headline: article.headline || "No headline",
            abstract: article.abstract || "No abstract available",
            byline: article.byline || "No author",
            pubDate: article.pubDate
              ? new Date(article.pubDate).toLocaleDateString()
              : "No date",
            webUrl: article.webUrl || "#",
          }));

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

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto py-6">
          <div className="flex items-center gap-3">
            <Newspaper className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Latest News Articles</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <ArticleLoadingState key={i} />
            ))}
          </div>
        ) : error ? (
          <ArticleErrorState message={error} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, index) => (
              <ArticleCard key={index} {...article} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default NewsArticles;
