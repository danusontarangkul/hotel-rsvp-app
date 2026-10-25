import Button from './Button';
import ErrorMessage from './ErrorMessage';

type LoadErrorProps = {
  messages: string[];
  onRetry: () => void;
};

export default function LoadError({ messages, onRetry }: LoadErrorProps) {
  return (
    <div className="flex flex-col items-start gap-3 py-8">
      <ErrorMessage messages={messages} />
      <Button onClick={onRetry}>Try again</Button>
    </div>
  );
}
