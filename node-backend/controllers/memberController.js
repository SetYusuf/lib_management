// controllers/memberController.js

const Member = require('../models/Member');

exports.createMember = async (req, res) => {
  try {
    const member = await Member.create(req.body);
    res.status(201).json({ message: 'Member added successfully', member });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      message: error.message || 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

exports.getAllMembers = async (_req, res) => {
  try {
    const members = await Member.findAll({ order: [['createdAt', 'DESC']] });
    res.status(200).json(members);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getMemberById = async (req, res) => {
  try {
    const member = await Member.findByPk(req.params.id);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    res.status(200).json(member);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateMember = async (req, res) => {
  try {
    const member = await Member.findByPk(req.params.id);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    await member.update(req.body);
    res.status(200).json({ message: 'Member updated successfully', member });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteMember = async (req, res) => {
  try {
    const deleted = await Member.destroy({ where: { id: req.params.id } });
    if (!deleted) {
      return res.status(404).json({ message: 'Member not found' });
    }
    res.status(200).json({ message: 'Member deleted successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
