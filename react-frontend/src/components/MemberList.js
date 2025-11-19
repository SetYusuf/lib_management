// src/components/MemberList.js

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';

const MemberList = ({ searchTerm = '' }) => {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchMembers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/members`);
      setMembers(response.data);
    } catch (error) {
      console.error('Error fetching members:', error);
      setSnackbar({ open: true, message: 'Error loading members', severity: 'error' });
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleMenuOpen = (event, member) => {
    setAnchorEl(event.currentTarget);
    setSelectedMember(member);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMember(null);
  };

  const handleEdit = () => {
    if (selectedMember) {
      navigate(`/add-member/${selectedMember.id}`);
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    setAnchorEl(null);
  };

  const handleViewLoans = () => {
    if (selectedMember) {
      navigate(`/members/${selectedMember.id}`);
    }
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (selectedMember) {
      try {
        await axios.delete(`${API_BASE_URL}/api/members/${selectedMember.id}`);
        setSnackbar({ open: true, message: 'Member deleted successfully', severity: 'success' });
        fetchMembers();
      } catch (error) {
        console.error('Error deleting member:', error);
        setSnackbar({ open: true, message: 'Error deleting member', severity: 'error' });
      }
    }
    setDeleteDialogOpen(false);
    setSelectedMember(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedMember(null);
  };

  const filteredMembers = members.filter((m) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (m.name || '').toLowerCase().includes(term) ||
      (m.email || '').toLowerCase().includes(term) ||
      (m.membershipId || '').toLowerCase().includes(term)
    );
  });

  return (
    <Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Membership ID</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Loan</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredMembers.map((member) => (
              <TableRow key={member.id} hover>
                <TableCell>{member.name}</TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>{member.phone}</TableCell>
                <TableCell>{member.membershipId}</TableCell>
                <TableCell>{member.status}</TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => navigate(`/members/${member.id}`)}
                    sx={{ textTransform: 'none', borderRadius: '8px' }}
                  >
                    Loan
                  </Button>
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={(e) => handleMenuOpen(e, member)}>
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleViewLoans}>
          <VisibilityIcon fontSize="small" style={{ marginRight: 8 }} /> View Loans
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <EditIcon fontSize="small" style={{ marginRight: 8 }} /> Edit
        </MenuItem>
        <MenuItem onClick={handleDeleteClick}>
          <DeleteIcon fontSize="small" style={{ marginRight: 8 }} /> Delete
        </MenuItem>
      </Menu>

      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Member</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this member? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button color="error" onClick={handleDeleteConfirm}>Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MemberList;
