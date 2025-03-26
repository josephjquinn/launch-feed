export default function Launches() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Upcoming Launches</h1>
      <div className="grid gap-6">
        {/* Launch cards will go here */}
        <div className="border rounded-lg p-4">
          <p className="text-lg">No launches available yet</p>
        </div>
      </div>
    </div>
  );
}
