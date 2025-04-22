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

// cache setup
const cache = new Map<string, { data: DailyReportData; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000;

// retry configuration
const MAX_RETRIES = 4;
const INITIAL_RETRY_DELAY = 2000;
const MAX_RETRY_DELAY = 30000;
const BACKOFF_FACTOR = 2;

// helper function to sleep
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// helper function to calculate retry delay with exponential backoff
const getRetryDelay = (retryCount: number): number => {
  const delay = INITIAL_RETRY_DELAY * Math.pow(BACKOFF_FACTOR, retryCount);
  return Math.min(delay, MAX_RETRY_DELAY);
};

// helper function to check if error is rate limit error
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

// helper function to validate api response
export const validateResponse = (response: unknown, type: string): boolean => {
  if (type === "summary" && typeof response === "string") {
    const trimmedResponse = response.trim();
    // check for the "no articles" message
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

// helper function to handle api errors
const handleApiError = (error: unknown, operation: string): ApiError => {
  console.error(`Error in ${operation}:`, error);
  if (error instanceof Error) {
    return error;
  }
  return new Error(`Unknown error in ${operation}`);
};

// fetch data with retry logic
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
  date: Date,
  isGame: boolean = false
): Promise<DailyReportData> => {
  const dateString = format(date, "yyyy-MM-dd");
  const cacheKey = `daily-report-${dateString}`;

  // check cache
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    // fetch summary and topics in parallel
    const [summaryResult, topicsResult] = await Promise.all([
      fetchWithRetry(() =>
        client(nytDailyReport).executeFunction({
          selectedDate: dateString,
          game: isGame,
        })
      ),
      fetchWithRetry(() =>
        client(recapTopics).executeFunction({
          inputDate: dateString,
          game: isGame,
        })
      ),
    ]);

    // check for no data case
    if (
      typeof summaryResult === "string" &&
      summaryResult.trim().includes("no articles or rows provided")
    ) {
      throw new Error("No articles found for this date");
    }

    // validation
    if (!validateResponse(summaryResult, "summary")) {
      throw new Error("Invalid summary data received");
    }
    if (!validateResponse(topicsResult, "topics")) {
      throw new Error("Invalid topics data received");
    }

    // get sentiment analysis
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

    // update cache
    cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });

    return data;
  } catch (error) {
    throw handleApiError(error, "fetchDailyReport");
  }
};
