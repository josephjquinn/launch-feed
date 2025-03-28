import { nytDailyReport, recapSentiment, recapTopics } from "@recap/sdk";
import client from "./foundry";
import { format } from "date-fns";

interface DailyReportData {
  summary: string;
  topics: string[];
  sentiment: number | null;
}

interface ApiError extends Error {
  code?: string;
  status?: number;
}

interface RateLimitError {
  errorCode: string;
  parameters: {
    message: string;
  };
}

// Cache implementation
const cache = new Map<string, { data: DailyReportData; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Retry configuration
const MAX_RETRIES = 4;
const INITIAL_RETRY_DELAY = 2000; // 2 seconds
const MAX_RETRY_DELAY = 30000; // 30 seconds
const BACKOFF_FACTOR = 2; // Exponential backoff factor

// Helper function to sleep
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper function to calculate retry delay with exponential backoff
const getRetryDelay = (retryCount: number): number => {
  const delay = INITIAL_RETRY_DELAY * Math.pow(BACKOFF_FACTOR, retryCount);
  return Math.min(delay, MAX_RETRY_DELAY);
};

// Helper function to check if error is rate limit error
const isRateLimitError = (error: unknown): boolean => {
  if (error && typeof error === "object" && "errorCode" in error) {
    const err = error as RateLimitError;
    return (
      err.errorCode === "INVALID_ARGUMENT" &&
      "parameters" in error &&
      "message" in err.parameters &&
      err.parameters.message.includes("rate limiting")
    );
  }
  return false;
};

// Helper function to validate API response
export const validateResponse = (response: unknown, type: string): boolean => {
  if (type === "summary" && typeof response === "string") {
    const trimmedResponse = response.trim();
    // Check for the "no articles" message
    if (trimmedResponse.includes("no articles or rows provided")) {
      return false;
    }
    return (
      trimmedResponse !== "" &&
      trimmedResponse !==
        "Please provide a statement or question for me to assist you with."
    );
  }
  if (type === "topics" && Array.isArray(response)) {
    return (
      response.length > 0 &&
      response.every((topic) => typeof topic === "string")
    );
  }
  if (type === "sentiment" && typeof response === "string") {
    const num = parseFloat(response);
    return !isNaN(num) && num >= 0 && num <= 10;
  }
  return false;
};

// Helper function to handle API errors
const handleApiError = (error: unknown, operation: string): ApiError => {
  console.error(`Error in ${operation}:`, error);
  if (error instanceof Error) {
    return error;
  }
  return new Error(`Unknown error in ${operation}`);
};

// Fetch data with retry logic
export const fetchWithRetry = async <T>(
  operation: () => Promise<T>,
  retryCount = 0
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    if (isRateLimitError(error) && retryCount < MAX_RETRIES) {
      const delay = getRetryDelay(retryCount);
      console.log(
        `Rate limit hit, retrying in ${delay / 1000} seconds... (attempt ${
          retryCount + 1
        }/${MAX_RETRIES})`
      );
      await sleep(delay);
      return fetchWithRetry(operation, retryCount + 1);
    }
    throw handleApiError(error, "fetchWithRetry");
  }
};

export const fetchDailyReport = async (
  date: Date
): Promise<DailyReportData> => {
  const dateString = format(date, "yyyy-MM-dd");
  const cacheKey = `daily-report-${dateString}`;

  // Check cache
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    // Fetch summary and topics in parallel
    const [summaryResult, topicsResult] = await Promise.all([
      fetchWithRetry(() =>
        client(nytDailyReport).executeFunction({
          selectedDate: dateString,
        })
      ),
      fetchWithRetry(() =>
        client(recapTopics).executeFunction({
          inputDate: dateString,
        })
      ),
    ]);

    // Check for no data case
    if (
      typeof summaryResult === "string" &&
      summaryResult.trim().includes("no articles or rows provided")
    ) {
      throw new Error("No articles found for this date");
    }

    // Validate responses
    if (!validateResponse(summaryResult, "summary")) {
      throw new Error("Invalid summary data received");
    }
    if (!validateResponse(topicsResult, "topics")) {
      throw new Error("Invalid topics data received");
    }

    // Get sentiment analysis
    const sentimentResult = await fetchWithRetry(() =>
      client(recapSentiment).executeFunction({
        recap: summaryResult.trim(),
      })
    );

    if (!validateResponse(sentimentResult, "sentiment")) {
      throw new Error("Invalid sentiment data received");
    }

    const data: DailyReportData = {
      summary: summaryResult.trim(),
      topics: Array.isArray(topicsResult) ? topicsResult : [],
      sentiment: parseFloat(sentimentResult),
    };

    // Update cache
    cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });

    return data;
  } catch (error) {
    throw handleApiError(error, "fetchDailyReport");
  }
};
