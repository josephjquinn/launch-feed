import { nytDailyReport, recapTopics } from "@recap/sdk";
import React, { useEffect, useState } from "react";
import client from "../lib/foundry";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format, isSameYear } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Clock } from "lucide-react";

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
  const [progress, setProgress] = useState(0);

  // Generate a random date between 2000 and 2025
  const generateRandomDate = () => {
    const start = new Date("2000-01-01");
    const end = new Date("2025-12-31");
    return new Date(
      start.getTime() + Math.random() * (end.getTime() - start.getTime())
    );
  };

  // Validate year input
  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow 4 digits
    if (value.length <= 4 && /^\d*$/.test(value)) {
      setGuessYear(value);
    }
  };

  // Check if the summary is valid
  const isValidSummary = (summary: string) => {
    return (
      summary.trim() !==
      "Please provide a statement or question for me to assist you with."
    );
  };

  // Load new random date and its data
  const loadNewDate = async () => {
    setLoading(true);
    setProgress(0);
    setShowResult(false);
    setGuessYear("");
    setError(null);

    let attempts = 0;
    const maxAttempts = 5; // Maximum number of attempts to find valid data

    const tryLoadDate = async () => {
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

        if (
          typeof summaryResult === "string" &&
          isValidSummary(summaryResult)
        ) {
          setSummary(summaryResult.trim());
          setTopics(Array.isArray(topicsResult) ? topicsResult : []);
          return true;
        }
        return false;
      } catch (err) {
        console.error(err);
        return false;
      }
    };

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((p) => (p >= 90 ? 90 : p + 10));
    }, 500);

    try {
      let success = false;
      while (!success && attempts < maxAttempts) {
        attempts++;
        success = await tryLoadDate();
        if (!success) {
          // Small delay between attempts
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      if (!success) {
        throw new Error(
          "Could not find a date with valid data after multiple attempts. Please try again."
        );
      }

      clearInterval(progressInterval);
      setProgress(100);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load data for this date. Please try again."
      );
      console.error(err);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  // Handle guess submission
  const handleGuess = () => {
    if (!targetDate || !guessYear || loading) return;

    const guessedYear = parseInt(guessYear);
    if (isNaN(guessedYear) || guessedYear < 2000 || guessedYear > 2025) {
      setError("Please enter a valid year between 2000 and 2025");
      return;
    }

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
              <div className="text-lg font-semibold">Score: {score}</div>
              <Button onClick={loadNewDate} disabled={loading}>
                {loading ? "Loading..." : "New Date"}
              </Button>
            </div>

            {loading && (
              <div className="space-y-2">
                <Progress value={progress} className="h-1" />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Loading your daily report...</span>
                  </div>
                  <span>{progress}%</span>
                </div>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {loading ? (
              <LoadingSkeleton />
            ) : (
              <>
                <div className="space-y-6">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3 text-lg">
                      Daily Summary:
                    </h3>
                    <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                      {summary}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3 text-lg">Topics:</h3>
                    <div className="flex flex-wrap gap-2">
                      {topics.map((topic, index) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 bg-secondary rounded-full text-sm font-medium"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={guessYear}
                      onChange={handleYearChange}
                      placeholder="Enter year (2000-2025)"
                      className="w-48 text-center text-lg"
                      maxLength={4}
                      disabled={loading}
                    />
                    <Button
                      onClick={handleGuess}
                      disabled={loading || !guessYear || guessYear.length !== 4}
                    >
                      Guess Year
                    </Button>
                  </div>

                  {showResult && (
                    <Alert variant={isCorrect ? "default" : "destructive"}>
                      <AlertDescription className="text-lg">
                        {isCorrect
                          ? "🎉 Correct! Well done!"
                          : `❌ Incorrect. The year was ${format(
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
