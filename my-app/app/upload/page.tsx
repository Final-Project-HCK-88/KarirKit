import UploadPdfComponent from "@/components/UploadPdfComponent";

export default function UploadPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Upload Your Contract
          </h1>
          <p className="text-gray-600">
            Upload your PDF contract to get started with career matching
          </p>
        </div>

        <UploadPdfComponent />
      </div>
    </div>
  );
}
