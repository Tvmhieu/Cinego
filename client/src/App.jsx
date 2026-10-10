import { lazy, Suspense } from "react";
import Navbar from "./components/Navbar";
import { Route, Routes, useLocation } from "react-router-dom";
import Footer from "./components/Footer";
import { Toaster } from "react-hot-toast";
import { useAppContext } from "./context/AppContext";
import { SignIn } from "@clerk/clerk-react";
import Loading from "./components/Loading";

// Lazy load user pages
const Home = lazy(() => import("./pages/Home"));
const Movies = lazy(() => import("./pages/Movies"));
const MovieDetails = lazy(() => import("./pages/MovieDetails"));
const SeatLayout = lazy(() => import("./pages/SeatLayout"));
const MyBookings = lazy(() => import("./pages/MyBookings"));
const Favourite = lazy(() => import("./pages/Favourite"));
const PaymentResult = lazy(() => import("./pages/Payment"));
const PaymentQR = lazy(() => import("./pages/PaymentQR"));

// Lazy load admin pages
const Layout = lazy(() => import("./pages/admin/Layout"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const AddShows = lazy(() => import("./pages/admin/AddShows"));
const ListShows = lazy(() => import("./pages/admin/ListShows"));
const ListBookings = lazy(() => import("./pages/admin/ListBookings"));
const ListUsers = lazy(() => import("./pages/admin/ListUsers"));
const ScanTicket = lazy(() => import("./pages/admin/ScanTicket"));
const ManageBanners = lazy(() => import("./pages/admin/ManageBanners"));
const Rooms = lazy(() => import("./pages/admin/Rooms"));

const App = () => {
  const isAdminRoute = useLocation().pathname.startsWith("/admin");
  const { user } = useAppContext();

  return (
    <>
      <Toaster />
      {!isAdminRoute && <Navbar />}
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/movies/:id" element={<MovieDetails />} />
          <Route path="/movies/:id/:date" element={<SeatLayout />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/loading/:nextUrl" element={<Loading />} />
          <Route path="/favourite" element={<Favourite />} />
          <Route path="/payment/:bookingId" element={<PaymentQR />} />
          <Route path="/payment-result" element={<PaymentResult />} />
          <Route
            path="/admin/*"
            element={
              user ? (
                <Layout />
              ) : (
                <div className="flex items-center justify-center min-h-screen">
                  <SignIn fallbackRedirectUrl={"/admin"} />
                </div>
              )
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="add-shows" element={<AddShows />} />
            <Route path="list-shows" element={<ListShows />} />
            <Route path="list-bookings" element={<ListBookings />} />
            <Route path="scan" element={<ScanTicket />} />
            <Route path="users" element={<ListUsers />} />
            <Route path="banners" element={<ManageBanners />} />
            <Route path="rooms" element={<Rooms />} />
          </Route>
        </Routes>
      </Suspense>
      {!isAdminRoute && <Footer />}
    </>
  );
};

export default App;
