type Props = {
  total: number;
  remaining: number;
};

export function Hearts({ total, remaining }: Props) {
  return (
    <div
      className="flex items-center gap-2"
      aria-label={`${remaining} de ${total} tentativas restantes`}
    >
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`heart ${i < remaining ? "" : "empty"}`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}
