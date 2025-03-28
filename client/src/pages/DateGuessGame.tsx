import { nytDailyReport, recapTopics } from "@recap/sdk";
import React, { useEffect, useState } from "react";
import client from "../lib/foundry";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format, isSameYear } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Clock,
  ArrowUp,
  ArrowDown,
  Trophy,
  XCircle,
  Eye,
  Calendar,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const DateGuessGame: React.FC = () => {
  const [summary, setSummary] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [targetDate, setTargetDate] = useState<Date | null>(null);
  const [guessYear, setGuessYear] = useState<string>("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lastGuess, setLastGuess] = useState<number | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);

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
    setLoadingStep(0);
    setShowAnswer(false);
    setGuessYear("");
    setError(null);
    setLastGuess(null);
    setIsCorrect(false);

    let attempts = 0;
    const maxAttempts = 5;

    const tryLoadDate = async () => {
      const newDate = generateRandomDate();
      setTargetDate(newDate);
      setLoadingStep(1);

      try {
        const dateStr = format(newDate, "yyyy-MM-dd");
        setLoadingStep(2);

        // Fetch summary and topics in parallel
        const [summaryResult, topicsResult] = await Promise.all([
          client(nytDailyReport)
            .executeFunction({
              selectedDate: dateStr,
            })
            .catch((err) => {
              console.error("Error fetching summary:", err);
              return null;
            }),
          client(recapTopics)
            .executeFunction({
              inputDate: dateStr,
            })
            .catch((err) => {
              console.error("Error fetching topics:", err);
              return null;
            }),
        ]);

        // Validate the results
        if (!summaryResult || !topicsResult) {
          console.log("Invalid data received, retrying...");
          return false;
        }

        if (
          typeof summaryResult === "string" &&
          isValidSummary(summaryResult)
        ) {
          setSummary(summaryResult.trim());
          setTopics(Array.isArray(topicsResult) ? topicsResult : []);
          setLoadingStep(3);
          return true;
        }
        return false;
      } catch (err) {
        console.error("Error in tryLoadDate:", err);
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
      setLoadingStep(4);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load data for this date. Please try again."
      );
      console.error(err);
    } finally {
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
        setLoadingStep(0);
      }, 500);
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

    setLastGuess(guessedYear);
    const correct = isSameYear(new Date(guessedYear, 0, 1), targetDate);
    setIsCorrect(correct);
  };

  // Handle key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleGuess();
    }
  };

  // Load initial date when component mounts
  useEffect(() => {
    loadNewDate();
  }, []);

  const LoadingSkeleton = () => (
    <div className="space-y-6">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto p-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">Time Traveler</h1>
            <p className="text-muted-foreground">
              Guess the year based on historical events
            </p>
          </div>

          <Card className="border-2">
            <CardContent className="p-6">
              <div className="space-y-6">
                {loading && (
                  <div className="space-y-4">
                    <div className="relative">
                      <div className="relative">
                        <div className="flex items-center gap-2 text-sm font-medium text-primary mb-2">
                          <motion.div
                            animate={{
                              rotate: 360,
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          >
                            <Clock className="h-4 w-4" />
                          </motion.div>
                          <span>
                            {loadingStep === 0 && "Initializing..."}
                            {loadingStep === 1 && "Generating random date..."}
                            {loadingStep === 2 && "Fetching historical data..."}
                            {loadingStep === 3 && "Processing information..."}
                            {loadingStep === 4 && "Finalizing..."}
                          </span>
                        </div>
                        <Progress
                          value={progress}
                          className="h-3 rounded-full bg-primary/5"
                        />
                        <div className="flex justify-center mt-2">
                          <span className="text-2xl font-bold text-primary">
                            {progress}%
                          </span>
                        </div>
                      </div>
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
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="bg-muted/50 p-6 rounded-xl">
                      <h2 className="text-xl font-semibold mb-4">
                        What happened on this day?
                      </h2>
                      <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                        {summary}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-1 bg-primary rounded-full" />
                        <h3 className="text-lg font-medium">Key Topics</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {topics.map((topic, index) => (
                          <motion.div
                            key={index}
                            className="group relative overflow-hidden rounded-lg bg-secondary/50 p-4 hover:bg-secondary/80 transition-colors"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              duration: 0.3,
                              delay: index * 0.1,
                            }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-primary/50" />
                              <span className="text-sm font-medium">
                                {topic}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <div className="relative flex-1">
                          <Input
                            type="number"
                            value={guessYear}
                            onChange={handleYearChange}
                            onKeyDown={handleKeyDown}
                            placeholder="Enter year (2000-2025)"
                            className="w-full text-center text-2xl h-14"
                            min={2000}
                            max={2025}
                            disabled={loading || showAnswer || isCorrect}
                          />
                        </div>
                        <Button
                          onClick={handleGuess}
                          size="lg"
                          className="w-full sm:w-48 h-14 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-200"
                          disabled={
                            loading ||
                            !guessYear ||
                            guessYear.length !== 4 ||
                            parseInt(guessYear) < 2000 ||
                            parseInt(guessYear) > 2025 ||
                            showAnswer ||
                            isCorrect
                          }
                        >
                          <span className="text-lg font-medium">Guess</span>
                        </Button>
                      </div>

                      <AnimatePresence>
                        {(lastGuess || showAnswer) && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                          >
                            <div
                              className={`relative overflow-hidden rounded-xl ${
                                isCorrect
                                  ? "bg-gradient-to-br from-green-500/20 to-green-500/5 border-2 border-green-500/30"
                                  : "bg-gradient-to-br from-red-500/20 to-red-500/5 border-2 border-red-500/30"
                              }`}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
                              <div className="relative p-6">
                                <div className="flex flex-col items-center text-center space-y-4">
                                  <motion.div
                                    animate={{
                                      scale: [1, 1.2, 1],
                                      rotate: isCorrect
                                        ? [0, 10, -10, 0]
                                        : [0, -10, 10, 0],
                                    }}
                                    transition={{
                                      duration: 0.5,
                                      repeat: 1,
                                      repeatDelay: 0.2,
                                    }}
                                  >
                                    {isCorrect ? (
                                      <Trophy className="h-12 w-12 text-green-500" />
                                    ) : (
                                      <XCircle className="h-12 w-12 text-red-500" />
                                    )}
                                  </motion.div>

                                  <div className="space-y-2">
                                    <h3
                                      className={`text-2xl font-bold ${
                                        isCorrect
                                          ? "text-green-500"
                                          : "text-red-500"
                                      }`}
                                    >
                                      {isCorrect ? "Correct!" : "Not Quite!"}
                                    </h3>
                                    {!isCorrect && lastGuess && targetDate && (
                                      <div className="flex items-center justify-center gap-2 text-lg text-muted-foreground">
                                        <motion.div
                                          animate={{
                                            y: [0, -5, 0],
                                            scale: [1, 1.2, 1],
                                          }}
                                          transition={{
                                            duration: 0.5,
                                            repeat: Infinity,
                                            repeatDelay: 1,
                                          }}
                                        >
                                          {lastGuess <
                                          targetDate.getFullYear() ? (
                                            <ArrowUp className="h-6 w-6 text-red-500" />
                                          ) : (
                                            <ArrowDown className="h-6 w-6 text-red-500" />
                                          )}
                                        </motion.div>
                                        <span>
                                          Try{" "}
                                          {lastGuess < targetDate.getFullYear()
                                            ? "higher"
                                            : "lower"}
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {!showAnswer && !isCorrect && (
                                    <Button
                                      variant="outline"
                                      onClick={() => setShowAnswer(true)}
                                      className="w-full max-w-xs"
                                      size="lg"
                                    >
                                      <Eye className="h-5 w-5 mr-2" />
                                      Reveal Answer
                                    </Button>
                                  )}

                                  {showAnswer && (
                                    <div className="w-full max-w-xs p-4 bg-background/50 rounded-lg border border-border">
                                      <div className="text-lg font-medium mb-2 text-muted-foreground">
                                        The year was:
                                      </div>
                                      <div className="text-4xl font-bold text-primary">
                                        {format(targetDate!, "yyyy")}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            <Button
                              onClick={loadNewDate}
                              className="w-full"
                              size="lg"
                              variant="secondary"
                            >
                              <Calendar className="h-5 w-5 mr-2" />
                              Try Another Date
                            </Button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default DateGuessGame;
