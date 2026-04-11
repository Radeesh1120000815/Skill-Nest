import { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

const ResourceContext = createContext();

const API_BASE = 'http://localhost:5000/api';

// Helper: inject auth header when token exists in localStorage
const authHeader = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
  const token = userInfo?.token;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const ResourceProvider = ({ children }) => {
  const [resources, setResources]       = useState([]);
  const [pagination, setPagination]     = useState({});
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);
  const [myUploads, setMyUploads]       = useState([]);
  const [myBookmarks, setMyBookmarks]   = useState([]);
  const [pendingQueue, setPendingQueue] = useState([]);
  const [adminStats, setAdminStats]     = useState(null);

  // Fetch approved resources (public) 
  const fetchResources = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([, v]) => v))
      ).toString();
      const { data } = await axios.get(`${API_BASE}/resources?${query}`, {
        headers: authHeader(),
      });
      setResources(data.data);
      setPagination(data.pagination);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load resources');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch single resource detail 
  const fetchResourceById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(`${API_BASE}/resources/${id}`, {
        headers: authHeader(),
      });
      return data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load resource');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Upload new resource 
  const createResource = useCallback(async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.post(`${API_BASE}/resources`, formData, {
        headers: { ...authHeader(), 'Content-Type': 'multipart/form-data' },
      });
      return { success: true, message: data.message, data: data.data };
    } catch (err) {
      const msg = err.response?.data?.message || 'Upload failed';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Upload new version 
  const uploadNewVersion = useCallback(async (resourceId, formData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.post(
        `${API_BASE}/resources/${resourceId}/versions`,
        formData,
        { headers: { ...authHeader(), 'Content-Type': 'multipart/form-data' } }
      );
      return { success: true, message: data.message };
    } catch (err) {
      const msg = err.response?.data?.message || 'Version upload failed';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete resource 
  const deleteResource = useCallback(async (id) => {
    try {
      await axios.delete(`${API_BASE}/resources/${id}`, { headers: authHeader() });
      setMyUploads((prev) => prev.filter((r) => r._id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message };
    }
  }, []);

  // Download (increments count) 
  const downloadResource = useCallback(async (id) => {
    try {
      const { data } = await axios.post(
        `${API_BASE}/resources/${id}/download`,
        {},
        { headers: authHeader() }
      );
      return data;
    } catch (err) {
      return { success: false, message: err.response?.data?.message };
    }
  }, []);

  // Rate resource 
  const rateResource = useCallback(async (resourceId, stars, comment) => {
    try {
      const { data } = await axios.post(
        `${API_BASE}/resources/${resourceId}/ratings`,
        { stars, comment },
        { headers: authHeader() }
      );
      return { success: true, data: data.data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message };
    }
  }, []);

  // Bookmark resource 
  const bookmarkResource = useCallback(async (resourceId, intent) => {
    try {
      const { data } = await axios.post(
        `${API_BASE}/resources/${resourceId}/bookmark`,
        { intent },
        { headers: authHeader() }
      );
      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message };
    }
  }, []);

  // Remove bookmark 
  const removeBookmark = useCallback(async (resourceId) => {
    try {
      await axios.delete(`${API_BASE}/resources/${resourceId}/bookmark`, {
        headers: authHeader(),
      });
      setMyBookmarks((prev) => prev.filter((b) => b.resourceId?._id !== resourceId));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message };
    }
  }, []);

  // My bookmarks
  const fetchMyBookmarks = useCallback(async (intent = '') => {
    setLoading(true);
    try {
      const query = intent ? `?intent=${intent}` : '';
      const { data } = await axios.get(`${API_BASE}/bookmarks/my${query}`, {
        headers: authHeader(),
      });
      setMyBookmarks(data.data);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bookmarks');
    } finally {
      setLoading(false);
    }
  }, []);

  // My uploads 
  const fetchMyUploads = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE}/resources/my/uploads`, {
        headers: authHeader(),
      });
      setMyUploads(data.data);
      return data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load uploads');
    } finally {
      setLoading(false);
    }
  }, []);

  // Admin: fetch pending queue 
  const fetchPendingQueue = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE}/admin/resources/pending`, {
        headers: authHeader(),
      });
      setPendingQueue(data.data);
      return data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load pending resources');
    } finally {
      setLoading(false);
    }
  }, []);

  // Admin: approve 
  const approveResource = useCallback(async (id) => {
    try {
      const { data } = await axios.put(
        `${API_BASE}/admin/resources/${id}/approve`,
        {},
        { headers: authHeader() }
      );
      setPendingQueue((prev) => prev.filter((r) => r._id !== id));
      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message };
    }
  }, []);

  //  Admin: reject 
  const rejectResource = useCallback(async (id, reason) => {
    try {
      const { data } = await axios.put(
        `${API_BASE}/admin/resources/${id}/reject`,
        { reason },
        { headers: authHeader() }
      );
      setPendingQueue((prev) => prev.filter((r) => r._id !== id));
      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message };
    }
  }, []);

  // Admin: stats 
  const fetchAdminStats = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/admin/resources/stats`, {
        headers: authHeader(),
      });
      setAdminStats(data.data);
      return data.data;
    } catch (err) {
      setError(err.response?.data?.message);
    }
  }, []);

  return (
    <ResourceContext.Provider
      value={{
        resources, pagination, loading, error,
        myUploads, myBookmarks, pendingQueue, adminStats,
        fetchResources, fetchResourceById,
        createResource, uploadNewVersion, deleteResource,
        downloadResource, rateResource,
        bookmarkResource, removeBookmark, fetchMyBookmarks,
        fetchMyUploads, fetchPendingQueue,
        approveResource, rejectResource, fetchAdminStats,
      }}
    >
      {children}
    </ResourceContext.Provider>
  );
};

export const useResource = () => {
  const ctx = useContext(ResourceContext);
  if (!ctx) throw new Error('useResource must be used inside ResourceProvider');
  return ctx;
};
