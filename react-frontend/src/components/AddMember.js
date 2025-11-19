import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  TextField,
  Button,
  Box,
  Typography,
  Grid,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const AddMember = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    membershipId: '',
    status: 'Active',
    joinedDate: new Date().toISOString().split('T')[0], // Default to today's date
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [generatingId, setGeneratingId] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      fetchMember();
    } else {
      // Auto-generate membership ID for new members
      generateNextMembershipId();
    }
  }, [id]);

  const generateNextMembershipId = async () => {
    try {
      setGeneratingId(true);
      const response = await axios.get(`${API_BASE_URL}/api/members`);
      const members = response.data;
      
      // Find the highest membership ID
      let maxId = 0;
      members.forEach(member => {
        if (member.membershipId) {
          // Extract numeric part from membership ID (handle formats like "000001", "001", etc.)
          const numericId = parseInt(member.membershipId.replace(/^0+/, '') || '0');
          if (numericId > maxId) {
            maxId = numericId;
          }
        }
      });
      
      // Generate next ID (maxId + 1), capped at 100000
      const nextId = Math.min(maxId + 1, 100000);
      
      // Format as 6-digit string with leading zeros
      const formattedId = nextId.toString().padStart(6, '0');
      
      setFormData(prev => ({ ...prev, membershipId: formattedId }));
    } catch (error) {
      console.error('Error generating membership ID:', error);
      // If error, start from 000001
      setFormData(prev => ({ ...prev, membershipId: '000001' }));
    } finally {
      setGeneratingId(false);
    }
  };

  const fetchMember = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/members/${id}`);
      const memberData = response.data;
      // Ensure joinedDate is in YYYY-MM-DD format for date input
      if (memberData.joinedDate) {
        memberData.joinedDate = memberData.joinedDate.split('T')[0];
      }
      setFormData(memberData);
    } catch (error) {
      console.error('Error fetching member:', error);
      setMessage({ type: 'error', text: 'Error loading member data' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (isEditMode) {
        const res = await axios.put(`${API_BASE_URL}/api/members/${id}`, formData);
        setMessage({ type: 'success', text: 'Member updated successfully!' });
        const memberId = res?.data?.member?.id || id;
        setTimeout(() => navigate(`/members/${memberId}`), 800);
      } else {
        const res = await axios.post(`${API_BASE_URL}/api/members`, formData);
        setMessage({ type: 'success', text: 'Member added successfully!' });
        const newId = res?.data?.member?.id;
        if (newId) {
          setTimeout(() => navigate(`/members/${newId}`), 800);
        } else {
          setTimeout(() => navigate('/members'), 800);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      let errorMessage = 'Error occurred. Please try again.';
      if (error.response) {
        const responseData = error.response.data;
        errorMessage = responseData?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = `Cannot connect to server. Please make sure the backend server is running on ${API_BASE_URL}`;
      } else {
        errorMessage = error.message || 'An unexpected error occurred';
      }
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: '600', marginBottom: '24px' }}>
        {isEditMode ? 'Edit Member' : 'Add a New Member'}
      </Typography>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 3 }}>
          {message.text}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField label="Name" name="name" value={formData.name} onChange={handleChange} fullWidth required />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField label="Email" name="email" value={formData.email} onChange={handleChange} fullWidth />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField label="Phone" name="phone" value={formData.phone} onChange={handleChange} fullWidth />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField 
            label="Membership ID" 
            name="membershipId" 
            value={formData.membershipId} 
            onChange={handleChange} 
            fullWidth 
            required
            disabled={generatingId}
            // helperText={!isEditMode ? "Auto-generated sequential ID (000001-100000). You can edit if needed." : ""}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField label="Status" name="status" value={formData.status} onChange={handleChange} fullWidth select>
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Suspended">Suspended</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField 
            label="Joined Date" 
            name="joinedDate" 
            type="date"
            value={formData.joinedDate} 
            onChange={handleChange} 
            fullWidth 
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
        <Button type="submit" variant="contained" disabled={loading} sx={{ borderRadius: '8px', padding: '10px 32px', textTransform: 'none', fontWeight: '600' }}>
          {loading ? <CircularProgress size={24} /> : isEditMode ? 'Update Member' : 'Add Member'}
        </Button>
        <Button variant="outlined" onClick={() => navigate('/members')} sx={{ borderRadius: '8px', padding: '10px 32px', textTransform: 'none', fontWeight: '600' }}>
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

export default AddMember;
