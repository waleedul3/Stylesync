import { useState } from 'react';
import { motion } from 'framer-motion';
import { SectionHeader } from './ButtonSet';

const inputBase: React.CSSProperties = {
  width: '100%',
  border: '1px solid #e5e7eb',
  borderRadius: '6px',
  padding: '10px 12px',
  fontSize: '14px',
  color: 'var(--color-text)',
  background: '#ffffff',
  outline: 'none',
  transition: 'border-color 150ms ease, box-shadow 150ms ease',
  fontFamily: 'var(--font-body)',
};

const labelStyle: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 500,
  color: '#6b7280',
  marginBottom: '6px',
  display: 'block',
};

export default function InputSet() {
  const [email, setEmail] = useState('');
  const emailError = email.length > 0 && !email.includes('@');

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <SectionHeader label="Inputs" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Default */}
        <div>
          <label style={labelStyle}>Default</label>
          <input
            type="text"
            placeholder="Enter text..."
            style={{ ...inputBase }}
            onFocus={e => {
              e.target.style.borderColor = 'var(--color-primary)';
              e.target.style.borderWidth = '1.5px';
              e.target.style.boxShadow = 'color-mix(in srgb, var(--color-primary) 15%, transparent) 0 0 0 3px';
            }}
            onBlur={e => {
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.borderWidth = '1px';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Focused (always-on style) */}
        <div>
          <label style={labelStyle}>Focused</label>
          <input
            type="text"
            placeholder="Click to focus..."
            style={{
              ...inputBase,
              borderColor: 'var(--color-primary)',
              borderWidth: '1.5px',
              boxShadow: 'color-mix(in srgb, var(--color-primary) 15%, transparent) 0 0 0 3px',
            }}
            onFocus={e => {
              e.target.style.borderColor = 'var(--color-primary)';
              e.target.style.borderWidth = '1.5px';
              e.target.style.boxShadow = 'color-mix(in srgb, var(--color-primary) 15%, transparent) 0 0 0 3px';
            }}
            onBlur={e => {
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.borderWidth = '1px';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Email with validation error */}
        <div>
          <label style={labelStyle}>Email — validation</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="name@example.com"
            style={{
              ...inputBase,
              borderColor: emailError ? '#ef4444' : '#e5e7eb',
              borderWidth: emailError ? '1.5px' : '1px',
            }}
            onFocus={e => {
              if (!emailError) {
                e.target.style.borderColor = 'var(--color-primary)';
                e.target.style.borderWidth = '1.5px';
                e.target.style.boxShadow = 'color-mix(in srgb, var(--color-primary) 15%, transparent) 0 0 0 3px';
              }
            }}
            onBlur={e => {
              if (!emailError) {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.borderWidth = '1px';
                e.target.style.boxShadow = 'none';
              }
            }}
          />
          {emailError && (
            <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>
              Please enter a valid email address
            </p>
          )}
        </div>

        {/* Textarea */}
        <div>
          <label style={labelStyle}>Textarea</label>
          <textarea
            placeholder="Write your message..."
            rows={3}
            style={{ ...inputBase, resize: 'none' }}
            onFocus={e => {
              e.target.style.borderColor = 'var(--color-primary)';
              e.target.style.borderWidth = '1.5px';
              e.target.style.boxShadow = 'color-mix(in srgb, var(--color-primary) 15%, transparent) 0 0 0 3px';
            }}
            onBlur={e => {
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.borderWidth = '1px';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}
