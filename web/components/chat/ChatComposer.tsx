'use client';

import { useState, type ChangeEvent, type SubmitEvent } from 'react';
import Button from '@/components/shared/Button';
import Form from '@/components/shared/Form';
import TextInput from '@/components/shared/TextInput';
import { SendIcon } from '@/components/shared/icons';
import { isFilled } from '@/lib/validation';
import {
  MESSAGE_INPUT_LABEL,
  MESSAGE_PLACEHOLDER,
  SEND_LABEL,
} from './chatCopy';
import { MAX_MESSAGE_LENGTH } from './chatLimits';

type ChatComposerProps = {
  onSend: (content: string) => void;
  sending?: boolean;
  errors?: string[];
};

export default function ChatComposer({
  onSend,
  sending = false,
  errors = [],
}: ChatComposerProps) {
  const [draft, setDraft] = useState<string>('');

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setDraft(event.target.value);
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending || !isFilled(draft)) {
      return;
    }
    onSend(draft);
    setDraft('');
  }

  return (
    <Form onSubmit={handleSubmit} actions={null} errors={errors}>
      <TextInput
        label={MESSAGE_INPUT_LABEL}
        placeholder={MESSAGE_PLACEHOLDER}
        value={draft}
        onChange={handleChange}
        autoComplete="off"
        maxLength={MAX_MESSAGE_LENGTH}
        trailing={
          <Button
            type="submit"
            variant="round-small"
            aria-label={SEND_LABEL}
            loading={sending}
            disabled={!isFilled(draft)}
          >
            <SendIcon />
          </Button>
        }
      />
    </Form>
  );
}
