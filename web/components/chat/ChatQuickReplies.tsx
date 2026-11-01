import Button from '@/components/shared/Button';
import { QUICK_REPLIES_LABEL } from './chatCopy';

type ChatQuickRepliesProps = {
  options: string[];
  onChoose: (option: string) => void;
};

export default function ChatQuickReplies({
  options,
  onChoose,
}: ChatQuickRepliesProps) {
  return (
    <div
      role="group"
      aria-label={QUICK_REPLIES_LABEL}
      className="flex flex-wrap gap-2"
    >
      {options.map((option) => (
        <Button key={option} variant="chip" onClick={() => onChoose(option)}>
          {option}
        </Button>
      ))}
    </div>
  );
}
