import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import AdminLayout from './layouts/AdminLayout'
import DashboardPage from './features/dashboard/DashboardPage'
import { EventsProvider } from './features/events/store'
import EventListPage from './features/events/EventListPage'
import EventFormPage from './features/events/EventFormPage'
import EventApplicantsPage from './features/events/EventApplicantsPage'
import { LockersProvider } from './features/lockers/store'
import LockersPage from './features/lockers/LockersPage'
import LockerSemesterFormPage from './features/lockers/LockerSemesterFormPage'
import { BoardsProvider } from './features/boards/store'
import NoticesPage from './features/boards/NoticesPage'
import NoticeFormPage from './features/boards/NoticeFormPage'
import FeedbackPage from './features/boards/FeedbackPage'
import FeedbackRoundFormPage from './features/boards/FeedbackRoundFormPage'
import { ArchivingProvider } from './features/archiving/store'
import ArchiveListPage from './features/archiving/ArchiveListPage'
import ArchiveFormPage from './features/archiving/ArchiveFormPage'
import { HomeBannerProvider } from './features/homeBanner/store'
import HomeManagementPage from './features/homeBanner/HomeManagementPage'
import HomeBannerFormPage from './features/homeBanner/HomeBannerFormPage'
import { RentalsProvider } from './features/rentals/store'
import RentalsPage from './features/rentals/RentalsPage'
import RentalItemFormPage from './features/rentals/RentalItemFormPage'
import RentalRecordFormPage from './features/rentals/RentalRecordFormPage'
import { StudentCouncilProvider } from './features/studentCouncil/store'
import StudentCouncilPage from './features/studentCouncil/StudentCouncilPage'
import { ChatbotProvider } from './features/chatbot/store'
import ChatbotPage from './features/chatbot/ChatbotPage'
import FaqFormPage from './features/chatbot/FaqFormPage'
import { PoliciesProvider } from './features/policies/store'
import PoliciesPage from './features/policies/PoliciesPage'
import AdminManagementPage from './features/adminManagement/AdminManagementPage'
import { AdminManagementProvider } from './features/adminManagement/store'
import DisplayManagementPage from './features/display/DisplayManagementPage'
import SettingsPage from './features/settings/SettingsPage'
import { AuthProvider, useAuth } from './features/auth/store'
import LoginPage from './features/auth/LoginPage'

function RequireAuth() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />
}

function EventsRoutes() {
  return (
    <Routes>
      <Route index element={<EventListPage />} />
      <Route path="new" element={<EventFormPage />} />
      <Route path=":id/edit" element={<EventFormPage />} />
      <Route path=":id/applicants" element={<EventApplicantsPage />} />
    </Routes>
  )
}

function LockersRoutes() {
  return (
    <Routes>
      <Route index element={<LockersPage />} />
      <Route path="schedule/new" element={<LockerSemesterFormPage />} />
      <Route path="schedule/:id/edit" element={<LockerSemesterFormPage />} />
    </Routes>
  )
}

function NoticesRoutes() {
  return (
    <Routes>
      <Route index element={<NoticesPage />} />
      <Route path="new" element={<NoticeFormPage />} />
      <Route path=":id/edit" element={<NoticeFormPage />} />
    </Routes>
  )
}

function FeedbackRoutes() {
  return (
    <Routes>
      <Route index element={<FeedbackPage />} />
      <Route path="rounds/new" element={<FeedbackRoundFormPage />} />
      <Route path="rounds/:id/edit" element={<FeedbackRoundFormPage />} />
    </Routes>
  )
}

function ArchivingRoutes() {
  return (
    <ArchivingProvider>
      <Routes>
        <Route index element={<ArchiveListPage />} />
        <Route path="new" element={<ArchiveFormPage />} />
        <Route path=":id/edit" element={<ArchiveFormPage />} />
      </Routes>
    </ArchivingProvider>
  )
}

function HomeBannerRoutes() {
  return (
    <HomeBannerProvider>
      <Routes>
        <Route index element={<HomeManagementPage />} />
        <Route path="new" element={<HomeBannerFormPage />} />
        <Route path=":id/edit" element={<HomeBannerFormPage />} />
      </Routes>
    </HomeBannerProvider>
  )
}

function RentalsRoutes() {
  return (
    <Routes>
      <Route index element={<RentalsPage />} />
      <Route path="records/new" element={<RentalRecordFormPage />} />
      <Route path="items/new" element={<RentalItemFormPage />} />
      <Route path="items/:id/edit" element={<RentalItemFormPage />} />
    </Routes>
  )
}

function ChatbotRoutes() {
  return (
    <Routes>
      <Route index element={<ChatbotPage />} />
      <Route path="faq/new" element={<FaqFormPage />} />
      <Route path="faq/:id/edit" element={<FaqFormPage />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <EventsProvider>
        <LockersProvider>
          <RentalsProvider>
            <StudentCouncilProvider>
              <AdminManagementProvider>
                <ChatbotProvider>
                  <BoardsProvider>
                    <Routes>
                      <Route path="/login" element={<LoginPage />} />
                      <Route element={<RequireAuth />}>
                        <Route element={<AdminLayout />}>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/events/*" element={<EventsRoutes />} />
                    <Route path="/lockers/*" element={<LockersRoutes />} />
                    <Route path="/notices/*" element={<NoticesRoutes />} />
                    <Route path="/feedback/*" element={<FeedbackRoutes />} />
                    <Route path="/home-banner/*" element={<HomeBannerRoutes />} />
                    <Route path="/archiving/*" element={<ArchivingRoutes />} />
                    <Route path="/rentals/*" element={<RentalsRoutes />} />
                    <Route path="/student-council" element={<StudentCouncilPage />} />
                    <Route path="/admins" element={<AdminManagementPage />} />
                    <Route path="/display" element={<DisplayManagementPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/chatbot/*" element={<ChatbotRoutes />} />
                    <Route
                      path="/policies"
                      element={
                        <PoliciesProvider>
                          <PoliciesPage />
                        </PoliciesProvider>
                      }
                    />
                        </Route>
                      </Route>
                    </Routes>
                  </BoardsProvider>
                </ChatbotProvider>
              </AdminManagementProvider>
            </StudentCouncilProvider>
          </RentalsProvider>
        </LockersProvider>
      </EventsProvider>
    </AuthProvider>
  )
}

export default App
