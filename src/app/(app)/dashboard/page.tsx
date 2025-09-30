export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <div className="w-full">
        <iframe
          title="Lista P y Backorder"
          src="https://app.powerbi.com/view?r=eyJrIjoiYjY1YjRhMmQtYzJhMC00NDc4LTlhMDgtYzE3MmFhMDVkNWUyIiwidCI6IjY5OWEwNzlmLTk3ODItNDMzNy1hMTUxLTg3MDhiMDBkOTA2ZSJ9"
          allowFullScreen
          className="w-full h-[600px] rounded border"
        />
      </div>
    </div>
  );
}
