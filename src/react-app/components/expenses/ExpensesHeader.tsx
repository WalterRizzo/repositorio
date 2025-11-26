
interface Props {}

export default function ExpensesHeader(_: Props) {
  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between gap-6">
      <div className="flex items-start gap-4">
        {/* header title removed — space reused for table KPIs */}
        <div className="flex flex-col">
          {/* intentionally left empty for compact layout */}
        </div>
      </div>

      {/* Empty right side by design — minimal header requested */}
      <div />
    </div>
  );
}
