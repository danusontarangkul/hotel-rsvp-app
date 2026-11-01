type IconProps = {
  path: string;
};

function Icon({ path }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4 shrink-0"
    >
      <path d={path} />
    </svg>
  );
}

export function ArrowRightIcon() {
  return <Icon path="M5 12h14M13 6l6 6-6 6" />;
}

export function CloseIcon() {
  return <Icon path="M6 6l12 12M18 6L6 18" />;
}

export function LogOutIcon() {
  return (
    <Icon path="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H3" />
  );
}

export function ChatIcon() {
  return <Icon path="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />;
}

export function SendIcon() {
  return <Icon path="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />;
}

export function MinimizeIcon() {
  return <Icon path="M5 12h14" />;
}

export function EyeIcon() {
  return (
    <Icon path="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
  );
}

export function EyeOffIcon() {
  return (
    <Icon path="M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-2.2 3.2M6.6 6.6C3.7 8.5 2 12 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2M2 2l20 20" />
  );
}
