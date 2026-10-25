type ErrorMessageProps = {
  id?: string;
  messages?: string[];
};

export default function ErrorMessage({ id, messages = [] }: ErrorMessageProps) {
  return (
    <div id={id} role="alert" className="min-h-5 text-xs leading-5 text-error">
      {messages.map((message) => (
        <p key={message}>{message}</p>
      ))}
    </div>
  );
}
