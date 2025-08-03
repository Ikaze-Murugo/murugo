"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function ContactPropertyForm({ property, onClose }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.name || '',
    email: user?.email || '',
    phone: '',
    message: '',
    message_type: 'inquiry',
    preferred_contact_method: 'email',
    viewing_requested: false,
    viewing_date: '',
    viewing_time: ''
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);

    try {
      const messageData = {
        property_id: property.id,
        sender_name: formData.name,
        sender_email: formData.email,
        sender_phone: formData.phone || null,
        subject: `Inquiry about ${property.title}`,
        message: formData.message,
        message_type: formData.message_type,
        preferred_contact_method: formData.preferred_contact_method,
        viewing_requested: formData.viewing_requested,
        viewing_date: formData.viewing_date || null,
        viewing_time: formData.viewing_time || null,
        sender_id: user?.id || null
      };

      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });

      const result = await response.json();

      if (response.ok) {
        setSent(true);
        setTimeout(() => {
          onClose && onClose();
        }, 2000);
      } else {
        alert(`Error sending message: ${result.error}`);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center py-4">
        <div className="mb-3">
          <i className="icon icon-check-circle fs-1 text-success"></i>
        </div>
        <h4 className="text-success">Message Sent!</h4>
        <p className="text-muted">
          Your inquiry has been sent to the property owner. 
          They will contact you within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label">Name *</label>
          <input
            type="text"
            name="name"
            className="form-control"
            value={formData.name}
            onChange={handleInputChange}
            required
            placeholder="Your full name"
          />
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">Email *</label>
          <input
            type="email"
            name="email"
            className="form-control"
            value={formData.email}
            onChange={handleInputChange}
            required
            placeholder="your.email@example.com"
          />
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">Phone Number</label>
          <input
            type="tel"
            name="phone"
            className="form-control"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">Inquiry Type</label>
          <select
            name="message_type"
            className="form-select"
            value={formData.message_type}
            onChange={handleInputChange}
          >
            <option value="inquiry">General Inquiry</option>
            <option value="viewing">Schedule Viewing</option>
            <option value="offer">Make an Offer</option>
            <option value="information">Request Information</option>
          </select>
        </div>

        <div className="col-12 mb-3">
          <label className="form-label">Message *</label>
          <textarea
            name="message"
            className="form-control"
            rows="4"
            value={formData.message}
            onChange={handleInputChange}
            required
            placeholder={`Hi, I'm interested in "${property.title}". Could you please provide more information?`}
          />
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">Preferred Contact Method</label>
          <select
            name="preferred_contact_method"
            className="form-select"
            value={formData.preferred_contact_method}
            onChange={handleInputChange}
          >
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="both">Both Email and Phone</option>
          </select>
        </div>

        <div className="col-md-6 mb-3 d-flex align-items-end">
          <div className="form-check">
            <input
              type="checkbox"
              name="viewing_requested"
              className="form-check-input"
              checked={formData.viewing_requested}
              onChange={handleInputChange}
            />
            <label className="form-check-label">
              I would like to schedule a viewing
            </label>
          </div>
        </div>

        {formData.viewing_requested && (
          <>
            <div className="col-md-6 mb-3">
              <label className="form-label">Preferred Date</label>
              <input
                type="date"
                name="viewing_date"
                className="form-control"
                value={formData.viewing_date}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Preferred Time</label>
              <select
                name="viewing_time"
                className="form-select"
                value={formData.viewing_time}
                onChange={handleInputChange}
              >
                <option value="">Select time</option>
                <option value="morning">Morning (9AM - 12PM)</option>
                <option value="afternoon">Afternoon (12PM - 5PM)</option>
                <option value="evening">Evening (5PM - 8PM)</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>
          </>
        )}
      </div>

      <div className="border-top pt-3 mt-3">
        <div className="d-flex justify-content-between align-items-center">
          <small className="text-muted">
            By sending this message, you agree to be contacted about this property.
          </small>
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={sending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={sending}
            >
              {sending ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Sending...
                </>
              ) : (
                <>
                  <i className="icon icon-send me-1"></i>
                  Send Message
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
