import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

interface ArticleCardProps {
  headline: string;
  abstract: string;
  byline: string;
  pubDate: string;
  webUrl: string;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  headline,
  abstract,
  byline,
  pubDate,
  webUrl,
}) => {
  return (
    <Card className="flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="line-clamp-2 text-xl">{headline}</CardTitle>
        <CardDescription>
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span className="font-medium">{byline}</span>
            <span>{pubDate}</span>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
          {abstract}
        </p>
      </CardContent>
      <CardFooter>
        <a
          href={webUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Read article
          <ExternalLink className="h-4 w-4" />
        </a>
      </CardFooter>
    </Card>
  );
};
