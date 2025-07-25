-- Complete all pending payments (for testing purposes)
-- Run this in Supabase SQL Editor to mark pending payments as completed

-- First, show current pending payments
SELECT 
    'CURRENT PENDING PAYMENTS' as status,
    id,
    appointment_id,
    payment_gateway_id,
    amount,
    payment_status,
    created_at
FROM payments 
WHERE payment_status = 'pending'
ORDER BY created_at DESC;

-- Update all pending payments to completed (for testing)
UPDATE payments 
SET payment_status = 'completed'
WHERE payment_status = 'pending';

-- Also update the related appointments to paid status
UPDATE appointments 
SET payment_status = 'paid',
    status = 'scheduled'
WHERE id IN (
    SELECT appointment_id 
    FROM payments 
    WHERE payment_status = 'completed'
);

-- Show the updated results
SELECT 
    'UPDATED PAYMENTS' as status,
    p.id,
    p.appointment_id,
    p.payment_gateway_id,
    p.amount,
    p.payment_status,
    a.status as appointment_status,
    a.payment_status as appointment_payment_status
FROM payments p
JOIN appointments a ON p.appointment_id = a.id
ORDER BY p.created_at DESC;