import ListingForm from '@/components/listings/ListingForm';

export default function NewListingPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Post a New Listing</h1>
        <p className="text-sm text-gray-500 mt-1">Share honest, detailed information to help prospective students make the right decision.</p>
      </div>
      <ListingForm />
    </div>
  );
}
