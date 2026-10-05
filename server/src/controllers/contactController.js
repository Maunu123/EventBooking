const { randomUUID } = require('node:crypto');
const Enquiry = require('../models/enquiryModel');

// Submit a contact enquiry
const submitEnquiry = async (req, res) => {
    try {
        const { name, email, topic, message } = req.validatedContact;
        const enquiryId = randomUUID();

        await Enquiry.create({
            id: enquiryId,
            name,
            email,
            topic,
            message,
        });

        res.status(201).json({ reference: enquiryId });
    } catch (err) {
        res.status(500).json({ error: 'Failed to submit contact enquiry.' });
    }
};

module.exports = {
    submitEnquiry,
};
