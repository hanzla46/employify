import { Routes, Route, Navigate } from "react-router-dom";
import ProfileLayout from "./ProfileLayout";
import ProfileForm from "../components/Profile/ProfileForm";
import ProtectedRoute from "../Context/ProtectedRoute";

export default function Profile() {
  return (
    <Routes>
      <Route element={<ProfileLayout />}>
        <Route index element={<Navigate to='add' replace />} />
        <Route
          path='add'
          element={
            <ProtectedRoute>
              <ProfileForm isedit={false} />
            </ProtectedRoute>
          }
        />
        <Route
          path='edit'
          element={
            <ProtectedRoute>
              <ProfileForm isedit={true} />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}
