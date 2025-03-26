import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ArticleErrorStateProps {
  message: string;
}

export const ArticleErrorState: React.FC<ArticleErrorStateProps> = ({
  message,
}) => {
  return (
    <Alert variant="destructive" className="max-w-2xl mx-auto">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
};
