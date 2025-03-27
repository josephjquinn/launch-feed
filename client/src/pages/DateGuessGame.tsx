import { nytDailyReport, recapTopics } from "@recap/sdk";
import React, { useEffect, useState } from "react";
import client from "../lib/foundry";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format, isSameYear } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

const DateGuessGame: React.FC = () => {
  const [summary, setSummary] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [targetDate, setTargetDate] = useState<Date | null>(null);
  const [guessYear, setGuessYear] = useState<string>("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);

  // Generate a random date between 2000 and 2025
  const generateRandomDate = () => {
    const start = new Date("2000-01-01");
    const end = new Date("2025-12-31");
    return new Date(
      start.getTime() + Math.random() * (end.getTime() - start.getTime())
    );
  };

  // Load new random date and its data
  const loadNewDate = async () => {
    setLoading(true);
    setShowResult(false);
    setGuessYear("");

    const newDate = generateRandomDate();
    setTargetDate(newDate);

    try {
      const dateStr = format(newDate, "yyyy-MM-dd");

      // Fetch summary and topics in parallel
      const [summaryResult, topicsResult] = await Promise.all([
        client(nytDailyReport).executeFunction({
          selectedDate: dateStr,
        }),
        client(recapTopics).executeFunction({
          inputDate: dateStr,
        }),
      ]);

      if (typeof summaryResult === "string") {
        setSummary(summaryResult.trim());
        setTopics(Array.isArray(topicsResult) ? topicsResult : []);
      } else {
        setError("Unexpected response format");
      }
    } catch (err) {
      setError("Failed to load data for this date. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle guess submission
  const handleGuess = () => {
    if (!targetDate || !guessYear) return;

    const guessedYear = parseInt(guessYear);
    const correct = isSameYear(new Date(guessedYear, 0, 1), targetDate);
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      setScore((prev) => prev + 1);
    }
  };

  // Load initial date when component mounts
  useEffect(() => {
    loadNewDate();
  }, []);

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Year Guessing Game</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>Score: {score}</div>
              <Button onClick={loadNewDate}>New Date</Button>
            </div>

            {loading ? (
              <LoadingSkeleton />
            ) : error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Daily Summary:</h3>
                    <p>{summary}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Topics:</h3>
                    <div className="flex flex-wrap gap-2">
                      {topics.map((topic, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-secondary rounded-full text-sm"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={guessYear}
                      onChange={(e) => setGuessYear(e.target.value)}
                      min="2000"
                      max="2025"
                      placeholder="Enter year (2000-2025)"
                      className="w-48"
                    />
                    <Button onClick={handleGuess}>Guess Year</Button>
                  </div>

                  {showResult && (
                    <Alert variant={isCorrect ? "default" : "destructive"}>
                      <AlertDescription>
                        {isCorrect
                          ? "Correct! Well done!"
                          : `Incorrect. The year was ${format(
                              targetDate!,
                              "yyyy"
                            )}`}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DateGuessGame;
