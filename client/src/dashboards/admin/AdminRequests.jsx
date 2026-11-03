import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import {
  HandHeart,
  Clock,
  MapPin,
  UserCheck,
  AlertCircle,
  CheckCircle,
  Navigation,
  RefreshCw,
} from 'lucide-react';

const AdminRequests = () => {
  const { t } = useTranslation();
  const [requests, setRequests] = useState([]);
  const [pendingQueue, setPendingQueue] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [volunteersModalOpen, setVolunteersModalOpen] = useState(false);
  const [availableVolunteers, setAvailableVolunteers] = useState([]);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [assignNotes, setAssignNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isReassignment, setIsReassignment] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [reqRes, pendingRes] = await Promise.all([
        api.get('/requests'),
        api.get('/requests/pending-assignment'),
      ]);
      setRequests(reqRes.data);
      setPendingQueue(pendingRes.data);
    } catch (err) {
      console.error('Fetch requests error:', err);
    }
  };

  const handleOpenAssignModal = async (request, isReassign = false) => {
    setSelectedRequest(request);
    setIsReassignment(isReassign);
    setSelectedVolunteer(null);
    setAssignNotes('');
    setVolunteersModalOpen(true);

    try {
      const res = await api.get(`/requests/available-volunteers/${request._id}`);
      setAvailableVolunteers(res.data.volunteers || []);
    } catch (err) {
      console.error('Failed to get available volunteers:', err);
    }
  };

  const handleConfirmAssignment = async () => {
    if (!selectedRequest || !selectedVolunteer) return;
    setActionLoading(true);
    try {
      if (isReassignment) {
        await api.patch(`/requests/${selectedRequest._id}/reassign-volunteer`, {
          volunteerId: selectedVolunteer._id,
          notes: assignNotes,
        });
      } else {
        await api.post(`/requests/${selectedRequest._id}/assign-volunteer`, {
          volunteerId: selectedVolunteer._id,
          notes: assignNotes,
        });
      }
      setConfirmModalOpen(false);
      setVolunteersModalOpen(false);
      setSelectedRequest(null);
      setSelectedVolunteer(null);
      await fetchData();
    } catch (err) {
      console.error('Assignment error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900">{t('sidebar.allRequests')}</h1>
              <p className="text-xs text-slate-500 mt-1">
                Location-based volunteer assignments with manual admin review queue and reassignment controls.
              </p>
            </div>
            <button
              onClick={fetchData}
              className="flex items-center space-x-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* SECTION 1: Manual Volunteer Assignment Queue */}
        <div className="bg-amber-50/50 border border-amber-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></span>
              <h2 className="text-lg font-bold text-slate-900">
                Manual Volunteer Assignment Queue ({pendingQueue.length})
              </h2>
            </div>
            <span className="text-xs bg-amber-100 text-amber-800 font-bold px-3 py-1 rounded-full">
              Requires Admin Assignment
            </span>
          </div>

          <p className="text-xs text-slate-600 mb-4">
            These requests were not auto-assigned because either no approved volunteer was within 100 meters, or coordinates were missing.
          </p>

          {pendingQueue.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl text-center border border-amber-100 text-xs text-slate-500">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              No pending requests requiring manual assignment. All requests are assigned!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingQueue.map((req) => (
                <div key={req._id} className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="px-2.5 py-1 bg-amber-100 text-amber-900 font-bold text-[11px] rounded-lg">
                      {req.category}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">#{req.requestId}</span>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{req.description}</h4>
                    <p className="text-xs text-slate-600 mt-1">
                      Senior: <strong>{req.elder?.name}</strong> ({req.elder?.phone})
                    </p>
                    <p className="text-xs text-slate-500 flex items-center space-x-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{req.location?.address || 'Address unlisted'}</span>
                    </p>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl text-[11px] space-y-1">
                    <div className="flex justify-between text-slate-600">
                      <span>Reason:</span>
                      <strong className="text-amber-700">
                        {req.locationComparison === 'different_location' ? 'Distance > 100m' : 'Location Not Provided'}
                      </strong>
                    </div>
                    {req.distanceMeters !== null && req.distanceMeters !== undefined && (
                      <div className="flex justify-between text-slate-600">
                        <span>Closest Volunteer:</span>
                        <span>{req.distanceMeters} meters away</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleOpenAssignModal(req, false)}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-sm flex items-center justify-center space-x-1"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Review & Assign Volunteer</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 2: All Requests Master List */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900">All Senior Assistance Requests</h2>

          <div className="space-y-3">
            {requests.map((r) => (
              <div key={r._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 font-bold rounded-lg text-[11px]">
                      {r.category}
                    </span>
                    <span className="text-slate-400 font-mono">#{r.requestId}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      r.assignmentType === 'automatic'
                        ? 'bg-emerald-100 text-emerald-800'
                        : r.assignmentType === 'admin_manual'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {r.assignmentType === 'automatic'
                        ? 'Auto (<=100m)'
                        : r.assignmentType === 'admin_manual'
                        ? 'Admin Assigned'
                        : 'Pending Assignment'}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mt-2">{r.description}</h3>
                  <p className="text-slate-600 mt-1">
                    Senior: <strong>{r.elder?.name}</strong> • Location: {r.location?.address}
                  </p>
                  {r.distanceMeters && (
                    <p className="text-slate-500 text-[11px]">Distance: {r.distanceMeters}m</p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <div className="text-right">
                    <span className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 rounded-lg font-bold text-[11px]">
                      {r.status}
                    </span>
                    {r.assignedVolunteer && (
                      <p className="text-[11px] text-slate-600 mt-1">
                        Assigned: <strong>{r.assignedVolunteer.name}</strong>
                      </p>
                    )}
                  </div>

                  {r.assignedVolunteer ? (
                    <button
                      onClick={() => handleOpenAssignModal(r, true)}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold text-[11px]"
                    >
                      Reassign
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenAssignModal(r, false)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-[11px]"
                    >
                      Assign
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL 1: Select Volunteer */}
      {volunteersModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {isReassignment ? 'Reassign Volunteer' : 'Assign Volunteer Manually'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Request #{selectedRequest.requestId}: {selectedRequest.category} ({selectedRequest.elder?.name})
                </p>
              </div>
              <button
                onClick={() => setVolunteersModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-blue-50 p-3 rounded-2xl text-xs text-blue-900">
              <p className="font-semibold">Senior Location:</p>
              <p className="text-slate-600">{selectedRequest.location?.address || 'No address specified'}</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase">Available Volunteers</label>
              {availableVolunteers.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No available volunteers found</p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {availableVolunteers.map((vol) => (
                    <div
                      key={vol._id}
                      onClick={() => setSelectedVolunteer(vol)}
                      className={`p-3 rounded-2xl border text-xs cursor-pointer transition ${
                        selectedVolunteer?._id === vol._id
                          ? 'border-blue-600 bg-blue-50/50'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <p className="font-bold text-slate-900">{vol.name}</p>
                        {vol.distanceMeters !== null ? (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            vol.isSameLocation
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {vol.distanceMeters}m away
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">Location unlisted</span>
                        )}
                      </div>
                      <p className="text-slate-500 text-[11px] mt-1">{vol.phone} • Rating: {vol.volunteerRating} ★</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase">Assignment Note (Optional)</label>
              <textarea
                value={assignNotes}
                onChange={(e) => setAssignNotes(e.target.value)}
                placeholder="Add internal note or instructions..."
                rows={2}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setVolunteersModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                disabled={!selectedVolunteer}
                onClick={() => setConfirmModalOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Final Confirmation Dialog */}
      {confirmModalOpen && selectedRequest && selectedVolunteer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Confirm Volunteer Assignment</h3>
            <div className="bg-slate-50 p-4 rounded-2xl text-xs space-y-2 border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Senior:</span>
                <span className="font-bold text-slate-800">{selectedRequest.elder?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Volunteer:</span>
                <span className="font-bold text-blue-600">{selectedVolunteer.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Distance:</span>
                <span className="font-bold text-slate-800">
                  {selectedVolunteer.distanceMeters !== null
                    ? `${selectedVolunteer.distanceMeters} meters`
                    : 'Coordinates unavailable'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Assignment Type:</span>
                <span className="font-bold text-purple-700">Admin Manual</span>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Assigning this volunteer will update the request status to <strong>Volunteer Assigned</strong> and dispatch notifications to both the elder and volunteer.
            </p>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setConfirmModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Back
              </button>
              <button
                disabled={actionLoading}
                onClick={handleConfirmAssignment}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold"
              >
                {actionLoading ? 'Assigning...' : 'Confirm Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminRequests;
