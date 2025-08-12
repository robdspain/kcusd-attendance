(() => {
  const form = document.getElementById('timeOffForm');
  const statusEl = document.getElementById('status');
  const submitBtn = document.getElementById('submitBtn');
  const secretInput = document.getElementById('formSecret');

  // Configure this to your deployed Apps Script Web App URL
  const APPS_SCRIPT_URL = '';

  // 100 Quotes about leaving, being gone, or taking off
  const quotes = [
    "Sometimes you have to step outside, get some air, and remind yourself of who you are and where you want to be.",
    "The hardest part isn't leaving. It's not looking back.",
    "Every exit is an entry somewhere else.",
    "Don't be afraid of change. You may lose something good, but you may gain something better.",
    "Sometimes you need to sit lonely on the floor in a quiet room in order to hear your own voice.",
    "The cave you fear to enter holds the treasure you seek.",
    "Life is about moving on, accepting changes, and looking forward to what makes you stronger.",
    "Sometimes the best thing you can do is walk away.",
    "You can't start the next chapter if you keep re-reading the last one.",
    "Distance doesn't separate people. Silence does.",
    "Sometimes you have to forget what you want to remember what you deserve.",
    "The only way to make sense out of change is to plunge into it, move with it, and join the dance.",
    "Letting go doesn't mean giving up, but rather accepting that there are things that cannot be.",
    "Adventure awaits, but first, coffee... and a plane ticket.",
    "I haven't been everywhere, but it's on my list.",
    "Travel is the only thing you buy that makes you richer.",
    "Not all who wander are lost.",
    "Life is short, and the world is wide.",
    "Adventure is out there, you just have to know where to find it.",
    "Sometimes you need to take a break from everyone and spend time alone.",
    "The real voyage of discovery consists not in seeking new landscapes, but in having new eyes.",
    "To travel is to live.",
    "We travel, initially, to lose ourselves; and we travel, next, to find ourselves.",
    "Sometimes you need to step outside, get some air, and remind yourself of who you are.",
    "The journey not the arrival matters.",
    "A ship in harbor is safe, but that is not what ships are built for.",
    "Sometimes you have to go away to really see where you belong.",
    "The best time to leave is when everyone is asking you to stay.",
    "Sometimes the most productive thing you can do is relax.",
    "Rest when you're weary. Refresh and renew yourself, your body, your mind, your spirit.",
    "Take time to make your soul happy.",
    "Self-care is not a luxury. It's a necessity.",
    "You owe yourself the love that you so freely give to other people.",
    "Sometimes you need to sit lonely on the floor to hear your own voice again.",
    "Take time to breathe. Take time to create. Take time to reflect, take time to let go.",
    "Your only obligation in any lifetime is to be true to yourself.",
    "Sometimes you need to distance yourself to see things clearly.",
    "Taking time off is not a sign of weakness, it's a sign of wisdom.",
    "The time you enjoy wasting is not wasted time.",
    "Rest is not idleness, and to lie sometimes on the grass under trees on a summer's day is not a waste of time.",
    "Almost everything will work again if you unplug it for a few minutes, including you.",
    "Sometimes you need to disconnect to reconnect with what matters most.",
    "In the depth of winter, I finally learned that within me there lay an invincible summer.",
    "You are never too old to set another goal or to dream a new dream.",
    "The secret of change is to focus all of your energy not on fighting the old, but building the new.",
    "Every moment is a fresh beginning.",
    "What lies behind us and what lies before us are tiny matters compared to what lies within us.",
    "Be yourself; everyone else is already taken.",
    "The only impossible journey is the one you never begin.",
    "Life isn't about finding yourself. Life is about creating yourself.",
    "Don't wait for opportunity. Create it.",
    "Your life does not get better by chance, it gets better by change.",
    "The future belongs to those who believe in the beauty of their dreams.",
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "The way I see it, if you want the rainbow, you gotta put up with the rain.",
    "Believe you can and you're halfway there.",
    "It does not matter how slowly you go as long as you do not stop.",
    "Sometimes you win, sometimes you learn.",
    "The only way to do great work is to love what you do.",
    "Don't be pushed around by the fears in your mind. Be led by the dreams in your heart.",
    "Life is what happens to you while you're busy making other plans.",
    "The purpose of our lives is to be happy.",
    "Get busy living or get busy dying.",
    "You only live once, but if you do it right, once is enough.",
    "In the end, we will remember not the words of our enemies, but the silence of our friends.",
    "Life is really simple, but we insist on making it complicated.",
    "The unexamined life is not worth living.",
    "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.",
    "Yesterday is history, tomorrow is a mystery, today is a gift.",
    "It is during our darkest moments that we must focus to see the light.",
    "Whoever is happy will make others happy too.",
    "Life is 10% what happens to you and 90% how you react to it.",
    "Time you enjoy wasting is not wasted time.",
    "When one door of happiness closes, another opens.",
    "Life is short. Smile while you still have teeth.",
    "The best revenge is massive success.",
    "Life is like riding a bicycle. To keep your balance, you must keep moving.",
    "You miss 100% of the shots you don't take.",
    "Whether you think you can or you think you can't, you're right.",
    "I have not failed. I've just found 10,000 ways that won't work.",
    "A person who never made a mistake never tried anything new.",
    "The person who says it cannot be done should not interrupt the person who is doing it.",
    "There are no traffic jams along the extra mile.",
    "It is never too late to be what you might have been.",
    "A successful man is one who can lay a firm foundation with the bricks others have thrown at him.",
    "No one can make you feel inferior without your consent.",
    "Strive not to be a success, but rather to be of value.",
    "Two roads diverged in a wood, and I took the one less traveled by, and that made all the difference.",
    "I can't change the direction of the wind, but I can adjust my sails.",
    "The only person you are destined to become is the person you decide to be.",
    "Go confidently in the direction of your dreams.",
    "What we think, we become.",
    "All our dreams can come true if we have the courage to pursue them.",
    "The future belongs to those who prepare for it today.",
    "Don't judge each day by the harvest you reap but by the seeds that you plant.",
    "The best time to plant a tree was 20 years ago. The second best time is now.",
    "A goal is a dream with a deadline.",
    "You are never too old to set another goal or dream a new dream.",
    "The difference between ordinary and extraordinary is that little extra.",
    "Success is not how high you have climbed, but how you make a positive difference to the world.",
    "Don't be afraid to give yourself everything you've ever wanted in life.",
    "Your limitation—it's only your imagination.",
    "Push yourself, because no one else is going to do it for you.",
    "Great things never come from comfort zones.",
    "Dream it. Wish it. Do it.",
    "Success doesn't just find you. You have to go out and get it.",
    "The harder you work for something, the greater you'll feel when you achieve it.",
    "Dream bigger. Do bigger.",
    "Don't stop when you're tired. Stop when you're done.",
    "Wake up with determination. Go to bed with satisfaction.",
    "Do something today that your future self will thank you for.",
    "Little things make big days.",
    "It's going to be hard, but hard does not mean impossible.",
    "Don't wait for opportunity. Create it."
  ];

  // Function to get a random quote
  function getRandomQuote() {
    return quotes[Math.floor(Math.random() * quotes.length)];
  }

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
        const randomQuote = getRandomQuote();
        setStatus(`Time off request submitted! ✈️\n\n"${randomQuote}"\n\nYou will receive a confirmation shortly.`, 'success');
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


