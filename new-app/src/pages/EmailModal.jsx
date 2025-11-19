import React, { useState } from 'react';
import { X, Send, Mail, User } from 'lucide-react';

const EmailModal = ({ user, onClose, onSend }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

// In EmailModal.jsx
// src/pages/Admin/EmailModal.jsx

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!subject.trim() || !message.trim()) {
    alert("Subject and message cannot be empty."); // Add a user-friendly alert
    return;
  }

  setLoading(true);
  setResult(null); // Clear previous results

  try {
    // ✅ CORRECTED: Pass a single object to the onSend function
    // The `onSend` prop (which is `sendEmailToUser` in AdminPanel)
    // will now receive the data in the format it expects: { subject, message }
    await onSend({ subject, message });

    // Assuming onSend doesn't return a value but throws an error on failure
    setResult({ success: true, message: 'Email sent successfully!' });

    setTimeout(() => {
      onClose();
    }, 2000); // Close modal after 2 seconds on success

  } catch (error) {
    // The error is thrown from `sendEmailToUser` in AdminPanel
    setResult({ success: false, message: error.message || 'Failed to send email' });
  } finally {
    setLoading(false);
  }
};

  const getDefaultApprovalEmail = () => {
    return {
      subject: 'Your Account Has Been Approved',
      message: `Dear ${user.full_name}, We are pleased to inform you that your account has been approved. You can now Login and access all features of our platform.Thank you for your patience.Best regards,The Admin Team`
    };
  };

  const getDefaultRejectionEmail = () => {
    return {
      subject: 'Regarding Your Account Application',
      message: `Dear ${user.full_name},After reviewing your application, we regret to inform you that your account has not been approved at this time.If you have any questions, please contact our support team.Best regards,The Admin Team`
    };
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl max-w-md w-full p-6 border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-white">Send Email to User</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-gray-700/50 rounded-lg">
          <div className="flex items-center mb-2">
            <User className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-white text-sm">{user.full_name}</span>
          </div>
          <div className="flex items-center">
            <Mail className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-gray-400 text-sm">{user.email}</span>
          </div>
        </div>

        {result && (
          <div className={`mb-4 p-3 rounded-lg ${result.success ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
            <p className={result.success ? 'text-green-300' : 'text-red-300'}>
              {result.message}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Email subject"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Type your message here..."
              required
            />
          </div>

          <div className="flex gap-2 justify-between">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  const defaultEmail = getDefaultApprovalEmail();
                  setSubject(defaultEmail.subject);
                  setMessage(defaultEmail.message);
                }}
                className="px-3 py-2 text-sm bg-green-600/50 hover:bg-green-600 text-white rounded-lg"
              >
                Approval Template
              </button>
              <button
                type="button"
                onClick={() => {
                  const defaultEmail = getDefaultRejectionEmail();
                  setSubject(defaultEmail.subject);
                  setMessage(defaultEmail.message);
                }}
                className="px-3 py-2 text-sm bg-red-600/50 hover:bg-red-600 text-white rounded-lg"
              >
                Rejection Template
              </button>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Email'}
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmailModal;