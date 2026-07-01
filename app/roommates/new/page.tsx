import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import RoommateForm from '@/components/roommates/RoommateForm';

export default function NewRoommatePage() {
  return (
    <div className="min-h-screen bg-brand-bg">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Post a Roommate Request</h1>
          <p className="text-sm text-gray-500 mt-1">No account needed — though signing in makes it easier to manage your post later.</p>
        </div>
        <RoommateForm />
      </div>
      <Footer />
    </div>
  );
}
