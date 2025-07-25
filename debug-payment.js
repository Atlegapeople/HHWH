// Quick test script
console.log('Testing payment verification...');

fetch('http://localhost:3000/api/payments/verify', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    reference: 'hhwh_1753390167347_674',
    paystackReference: 'T123456789',
    appointmentId: 'b26bd91b-e543-41b2-9224-1c6408433528'
  })
})
.then(res => res.json())
.then(data => console.log('Result:', data))
.catch(err => console.error('Error:', err));