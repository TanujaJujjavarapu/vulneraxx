export default function CompanyDetails() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Company Details</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded shadow">
          Company summary and metadata
        </div>
        <div className="p-4 bg-white rounded shadow">
          Associated hosts and findings
        </div>
      </div>
    </div>
  );
}
