import { lazy, Suspense } from 'react';
import Procedures from './pages/admin/Procedures';
import Citizens from './pages/admin/Citizens';
import Requests from './pages/admin/Requests';
import Statistics from './pages/admin/Statistics';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import CitizenLayout from './layouts/CitizenLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Loader from './components/ui/Loader';
import ErrorBoundary from './components/ErrorBoundary';

const Accueil = lazy(() => import('./pages/Accueil'));
const Demarches = lazy(() => import('./pages/Demarches'));
const Contact = lazy(() => import('./pages/Contact'));
const Collecte = lazy(() => import('./pages/Collecte'));
const ServicePublic = lazy(() => import('./pages/ServicePublic'));
const Inscription = lazy(() => import('./pages/Inscription'));
const Login = lazy(() => import('./pages/Login'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const CitizenDashboard = lazy(() => import('./pages/citizen/CitizenDashboard'));
const CitizenProfile = lazy(() => import('./pages/citizen/CitizenProfile'));
const Documents = lazy(() => import('./pages/Documents'));
const RequestTracking = lazy(() => import('./pages/citizen/RequestTracking'));
const NewRequest = lazy(() => import('./pages/citizen/NewRequest'));
const DemarcheDetail = lazy(() => import('./pages/DemarcheDetail'));
const MesDemandes = lazy(() => import('./pages/citizen/MesDemandes'));
const MesDocumentsNumeriques = lazy(() => import('./pages/citizen/MesDocumentsNumeriques'));
const DynamicPdfForm = lazy(() => import('./pages/DynamicPdfForm'));
const ProcedureCreate = lazy(() => import('./pages/admin/ProcedureCreate'));
const ProcedureEdit = lazy(() => import('./pages/admin/ProcedureEdit'));
const CMSSettings = lazy(() => import('./pages/admin/CMSSettings'));
const CMSHeroSection = lazy(() => import('./pages/admin/CMSHeroSection'));
const CMSFAQManagement = lazy(() => import('./pages/admin/CMSFAQManagement'));
const CMSCollecteSchedule = lazy(() => import('./pages/admin/CMSCollecteSchedule'));
const AdminDocuments = lazy(() => import('./pages/admin/AdminDocuments'));
const AdminHomePage = lazy(() => import('./pages/admin/AdminHomePage'));

const NotFound = () => (
  <div style={{ textAlign: 'center', padding: '50px' }}>
    <h2>404 - Page Non Trouvée</h2>
    <p>La page que vous recherchez n'existe pas.</p>
  </div>
);

function App() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Chargement...</div>}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Accueil />} />
            <Route path="demarches" element={<Demarches />} />
            <Route path="contact" element={<Contact />} />
            <Route path="collecte" element={<Collecte />} />
            <Route path="services" element={<ServicePublic />} />
            <Route path="service-public" element={<ServicePublic />} />
            <Route path="documents" element={<Documents />} />
            <Route path="formulaires" element={<Documents />} />
            <Route path="formulaires-dynamiques" element={<DynamicPdfForm />} />
            <Route path="demarches/:id" element={<DemarcheDetail />} />
          </Route>

          {/* Auth Routes */}
          <Route path="/inscription" element={<Inscription />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/citizen/login" element={<Login />} />
          <Route path="/citizen/register" element={<Inscription />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route element={<ProtectedRoute allowedRoles={['citizen']} requiredStatus="approved" />}>
            <Route element={<CitizenLayout />}>
              <Route path="/citizen/dashboard" element={<CitizenDashboard />} />
              <Route path="/citizen/profile" element={<CitizenProfile />} />
              <Route path="/suivi" element={<RequestTracking />} />
              <Route path="/citizen/requests" element={<RequestTracking />} />
              <Route path="/demande/new" element={<NewRequest />} />
              <Route path="/mes-demandes" element={<MesDemandes />} />
              <Route path="/citizen/documents" element={<MesDocumentsNumeriques />} />
            </Route>
          </Route>

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin/dashboard" element={
              <ErrorBoundary>
                <AdminDashboard />
              </ErrorBoundary>
            } />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/cms/settings" element={<CMSSettings />} />
            <Route path="/admin/cms/hero" element={<CMSHeroSection />} />
            <Route path="/admin/cms/faq" element={<CMSFAQManagement />} />
            <Route path="/admin/cms/collecte" element={<CMSCollecteSchedule />} />
            <Route path="/admin/procedures" element={<Procedures />} />
            <Route path="/admin/procedure/create" element={<ProcedureCreate />} />
            <Route path="/admin/procedure/edit/:id" element={<ProcedureEdit />} />
            <Route path="/admin/citizens" element={<Citizens />} />
            <Route path="/admin/requests" element={<Requests />} />
            <Route path="/admin/documents" element={<AdminDocuments />} />
            <Route path="/admin/statistics" element={<Statistics />} />
            <Route path="/admin/home-cms" element={<AdminHomePage />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
  );
}

export default App;
