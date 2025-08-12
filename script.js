(() => {
  const form = document.getElementById('timeOffForm');
  const statusEl = document.getElementById('status');
  const submitBtn = document.getElementById('submitBtn');
  const secretInput = document.getElementById('formSecret');

  // Configure this to your deployed Apps Script Web App URL
  const APPS_SCRIPT_URL = '';

  // Basic runtime validation + keyboard focus management
  function setStatus(msg, type) {
    statusEl.textContent = msg || '';
    statusEl.classList.remove('success', 'error');
    if (type) statusEl.classList.add(type);
  }

  function validateDates() {
    const startDate = form.startDate.value;
    const endDate = form.endDate.value;
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      return 'End Date cannot be earlier than Start Date';
    }
    return '';
  }

  function validateTimes() {
    // Optional: Only compare times if same day
    const startDate = form.startDate.value;
    const endDate = form.endDate.value;
    const startTime = form.startTime.value;
    const endTime = form.endTime.value;
    if (startDate && endDate && startDate === endDate && startTime && endTime) {
      const start = new Date(`${startDate}T${startTime}:00`);
      const end = new Date(`${endDate}T${endTime}:00`);
      if (end < start) {
        return 'End Time cannot be earlier than Start Time when dates are the same';
      }
    }
    return '';
  }

  function generateSecret() {
    const random = Math.random().toString(36).slice(2) + Date.now().toString(36);
    return random;
  }

  secretInput.value = generateSecret();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    setStatus('', '');

    // Honeypot check
    if (form.website && form.website.value) {
      setStatus('Submission blocked.', 'error');
      return;
    }

    // Required fields
    const required = ['name', 'email', 'startDate', 'startTime', 'endDate', 'endTime', 'absenceType', 'reason'];
    for (const field of required) {
      const el = form[field];
      if (!el || !el.value) {
        el && el.focus();
        setStatus('Please complete all required fields.', 'error');
        return;
      }
    }

    const dateError = validateDates();
    if (dateError) { setStatus(dateError, 'error'); return; }
    const timeError = validateTimes();
    if (timeError) { setStatus(timeError, 'error'); return; }

    if (!APPS_SCRIPT_URL) {
      setStatus('Form backend not configured. Add your Apps Script URL in script.js.', 'error');
      return;
    }

    try {
      submitBtn.disabled = true;
      setStatus('Submitting…');

      const formData = new FormData(form);
      const response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        body: formData,
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }
      const result = await response.json();
      if (result && result.success) {
        form.reset();
        secretInput.value = generateSecret();
        setStatus('Submitted successfully. You will receive a confirmation shortly.', 'success');
      } else {
        throw new Error(result && result.message ? result.message : 'Unknown error');
      }
    } catch (err) {
      setStatus(`Submission failed: ${err.message}`, 'error');
    } finally {
      submitBtn.disabled = false;
    }
  });
})();


