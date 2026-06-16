export function SectionHeading({
  index,
  title,
  description,
}: {
  index: string
  title: string
  description?: string
}) {
  return (
    <div className="mb-8">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-sm text-muted-foreground">{index}</span>
        <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
          {title}
        </h2>
      </div>
      {description ? (
        <p className="mt-3 max-w-2xl text-pretty leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  )
}
