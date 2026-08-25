/* 
 * DAWSON LANDSCAPING & MAINTENANCE - PERTH LEAD GENERATION ENGINE
 * Interactive Logic, Instant Quote Calculator, GA4 Tracking & Staff CMS Portal
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('🌱 Dawson Landscaping Engine Initialized');

  // --- Initial Lead Storage (Demo database) ---
  const state = {
    leads: JSON.parse(localStorage.getItem('dawson_leads')) || [
      { id: 'LD-1092', name: 'Sarah Jenkins', suburb: 'Cottesloe', phone: '0412 893 211', email: 'sarah.j@example.com', service: 'Synthetic Turf & Reticulation', budget: '$8,500 - $12,000', date: '2026-08-22', status: 'New Enriched Lead' },
      { id: 'LD-1093', name: 'Mark Thornton', suburb: 'Scarborough', phone: '0409 122 344', email: 'm.thornton@example.com', service: 'Paving & Retaining Walls', budget: '$15,000+', date: '2026-08-23', status: 'Site Inspection Scheduled' }
    ],
    selectedServices: ['turf', 'reticulation'],
    yardSize: 120,
    suburb: 'Cottesloe',
    gaEvents: []
  };

  // --- GA4 Enterprise Conversion Tracking Engine ---
  window.dataLayer = window.dataLayer || [];

  function trackGA4Event(eventName, eventParams) {
    const eventPayload = {
      event: eventName,
      timestamp: new Date().toISOString(),
      params: {
        page_location: window.location.href,
        geo_location: 'Perth, WA',
        ...eventParams
      }
    };

    state.gaEvents.unshift(eventPayload);
    window.dataLayer.push(eventPayload);
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, eventPayload.params);
    }
    console.log('✅ [GA4 Event Dispatched]:', eventName, eventPayload.params);
  }

  // Bind Click-to-Call Tracking
  document.querySelectorAll('a[href^="tel:"]').forEach(callBtn => {
    callBtn.addEventListener('click', () => {
      trackGA4Event('click_to_call', {
        link_url: callBtn.href,
        placement: callBtn.dataset.placement || 'header'
      });
    });
  });

  // --- Before & After Interactive Image Slider ---
  const sliderWrapper = document.getElementById('beforeAfterSlider');
  if (sliderWrapper) {
    const beforeImage = sliderWrapper.querySelector('.before-image');
    const sliderHandle = sliderWrapper.querySelector('.slider-handle');
    let isDragging = false;

    function setSliderPosition(x) {
      const rect = sliderWrapper.getBoundingClientRect();
      let offsetX = x - rect.left;
      if (offsetX < 0) offsetX = 0;
      if (offsetX > rect.width) offsetX = rect.width;
      
      const percentage = (offsetX / rect.width) * 100;
      beforeImage.style.width = `${percentage}%`;
      sliderHandle.style.left = `${percentage}%`;
    }

    sliderWrapper.addEventListener('mousedown', (e) => {
      isDragging = true;
      setSliderPosition(e.clientX);
    });

    window.addEventListener('mouseup', () => { isDragging = false; });
    
    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      setSliderPosition(e.clientX);
    });

    // Touch Support for Mobile
    sliderWrapper.addEventListener('touchstart', (e) => {
      isDragging = true;
      setSliderPosition(e.touches[0].clientX);
    });

    window.addEventListener('touchend', () => { isDragging = false; });

    window.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      setSliderPosition(e.touches[0].clientX);
    });
  }

  // --- Instant Quote Estimator Multi-Step Wizard ---
  const serviceCards = document.querySelectorAll('.option-card');
  const yardRange = document.getElementById('yardRange');
  const yardValueDisplay = document.getElementById('yardValue');
  const estimatedCostDisplay = document.getElementById('estimatedCostDisplay');

  // Pricing matrix (per m2 in AUD)
  const rates = {
    turf: 45,        // Synthetic or Natural turf + soil prep
    paving: 110,     // Paving / alfresco stone
    reticulation: 35,// Automatic pop-up irrigation
    plants: 30,      // Native Perth garden design & plants
    retaining: 140   // Limestone retaining walls
  };

  function calculateEstimate() {
    if (!yardRange || !estimatedCostDisplay) return;
    const m2 = parseInt(yardRange.value, 10);
    yardValueDisplay.textContent = `${m2} m²`;
    state.yardSize = m2;

    let costPerM2 = 0;
    state.selectedServices.forEach(serviceKey => {
      costPerM2 += rates[serviceKey] || 40;
    });

    if (state.selectedServices.length === 0) costPerM2 = 45; // Default minimum

    const baseEstimate = m2 * costPerM2;
    const minEst = Math.round(baseEstimate * 0.9);
    const maxEst = Math.round(baseEstimate * 1.15);

    estimatedCostDisplay.textContent = `$${minEst.toLocaleString()} - $${maxEst.toLocaleString()} AUD`;
  }

  if (serviceCards.length > 0) {
    serviceCards.forEach(card => {
      card.addEventListener('click', () => {
        const serviceKey = card.dataset.service;
        if (card.classList.contains('selected')) {
          card.classList.remove('selected');
          state.selectedServices = state.selectedServices.filter(s => s !== serviceKey);
        } else {
          card.classList.add('selected');
          state.selectedServices.push(serviceKey);
        }
        calculateEstimate();
      });
    });
  }

  if (yardRange) {
    yardRange.addEventListener('input', calculateEstimate);
    calculateEstimate();
  }

  // Wizard Step Switching
  const stepItems = document.querySelectorAll('.step-item');
  const stepContents = document.querySelectorAll('.wizard-step-content');
  let currentStep = 1;

  window.goToWizardStep = function(stepNum) {
    if (stepNum === 2 && state.selectedServices.length === 0) {
      alert('Please select at least one landscaping service to continue.');
      return;
    }

    currentStep = stepNum;
    stepItems.forEach((item, index) => {
      if (index + 1 === stepNum) {
        item.classList.add('active');
      } else if (index + 1 < stepNum) {
        item.classList.add('completed');
        item.classList.remove('active');
      } else {
        item.classList.remove('active', 'completed');
      }
    });

    stepContents.forEach(content => {
      content.style.display = content.id === `wizardStep${stepNum}` ? 'block' : 'none';
    });

    if (stepNum === 2) {
      trackGA4Event('quote_step_completed', { step_name: 'services_and_size', selected_count: state.selectedServices.length });
    }
  };

  // Submission of Quote Lead Form
  const wizardForm = document.getElementById('wizardQuoteForm');
  if (wizardForm) {
    wizardForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const newLead = {
        id: `LD-${Math.floor(1000 + Math.random() * 9000)}`,
        name: document.getElementById('wizName').value,
        phone: document.getElementById('wizPhone').value,
        email: document.getElementById('wizEmail').value,
        suburb: document.getElementById('wizSuburb').value,
        service: state.selectedServices.join(', ').toUpperCase(),
        budget: estimatedCostDisplay ? estimatedCostDisplay.textContent : 'Calculated',
        date: new Date().toISOString().split('T')[0],
        status: 'NEW UNCONTACTED LEAD'
      };

      state.leads.unshift(newLead);
      localStorage.setItem('dawson_leads', JSON.stringify(state.leads));

      // GA4 Conversion Dispatch
      trackGA4Event('lead_form_submitted', {
        lead_id: newLead.id,
        suburb: newLead.suburb,
        estimated_budget: newLead.budget,
        conversion_value: 15000 // Estimated LTV of landscaping client
      });

      // Render Confirmation inside Modal
      document.getElementById('wizardStep3').innerHTML = `
        <div style="text-align: center; padding: 40px 20px;">
          <div style="width: 70px; height: 70px; background: #d4a329; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; color: #1b2612;">
            <svg width="40" height="40" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
          </div>
          <h3 style="font-size: 1.8rem; color: #1b2612; margin-bottom: 10px;">Estimate Requested!</h3>
          <p style="color: #57634d; font-size: 1.05rem; max-width: 500px; margin: 0 auto 24px;">
            Thank you <strong>${newLead.name}</strong>. One of our Perth senior landscape architects will review your project in <strong>${newLead.suburb}</strong> and contact you at <strong>${newLead.phone}</strong> within 2 business hours.
          </p>
          <div style="background: #faf9f5; border: 1px solid #dedcca; padding: 16px; border-radius: 8px; display: inline-block; text-align: left; font-size: 0.9rem;">
            <strong>Reference ID:</strong> ${newLead.id}<br>
            <strong>Estimated Range:</strong> ${newLead.budget}<br>
            <strong>Selected Suburb:</strong> ${newLead.suburb}
          </div>
        </div>
      `;
    });
  }

  // Hero Quick Form Submission
  const heroForm = document.getElementById('heroQuickForm');
  if (heroForm) {
    heroForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('heroName').value;
      const phone = document.getElementById('heroPhone').value;
      const suburb = document.getElementById('heroSuburb').value;
      const project = document.getElementById('heroService').value;

      const newLead = {
        id: `LD-${Math.floor(1000 + Math.random() * 9000)}`,
        name: name,
        phone: phone,
        email: 'Direct Hero Capture',
        suburb: suburb,
        service: project,
        budget: 'Pending Consultation',
        date: new Date().toISOString().split('T')[0],
        status: 'HIGH PRIORITY HERO LEAD'
      };

      state.leads.unshift(newLead);
      localStorage.setItem('dawson_leads', JSON.stringify(state.leads));

      trackGA4Event('hero_lead_captured', { suburb: suburb, project_type: project });

      alert(`⚡ Thank you ${name}! Your consultation request for ${suburb} has been received. Our Perth team will call ${phone} shortly.`);
      heroForm.reset();
    });
  }

  // --- Modal Controllers (Staff CMS & Quick Quote) ---
  window.openModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      if (modalId === 'staffPortalModal') {
        renderStaffLeadsTable();
      }
    }
  };

  window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  };

  // Close modals when clicking outside
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('active');
    });
  });

  // --- Staff CMS Portal & Lead Exporter ---
  function renderStaffLeadsTable() {
    const leadsContainer = document.getElementById('staffLeadsTableBody');
    if (!leadsContainer) return;

    leadsContainer.innerHTML = state.leads.map(lead => `
      <tr>
        <td><strong>${lead.id}</strong></td>
        <td>${lead.name}</td>
        <td><span style="background: rgba(212,163,41,0.2); padding: 4px 8px; border-radius: 4px; font-weight: 600;">${lead.suburb}</span></td>
        <td><a href="tel:${lead.phone}" style="color: #2b3a1c; font-weight: 700;">${lead.phone}</a></td>
        <td>${lead.service}</td>
        <td><strong style="color: #2b3a1c;">${lead.budget}</strong></td>
        <td>${lead.date}</td>
        <td><span style="color: #44592e; font-size: 0.8rem; font-weight: 700;">● ${lead.status}</span></td>
      </tr>
    `).join('');
  }

  window.exportLeadsCSV = function() {
    let csvContent = "data:text/csv;charset=utf-8,ID,Name,Suburb,Phone,Email,Service,Budget,Date,Status\n";
    state.leads.forEach(l => {
      csvContent += `${l.id},"${l.name}",${l.suburb},${l.phone},${l.email},"${l.service}","${l.budget}",${l.date},${l.status}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `dawson_perth_leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    trackGA4Event('staff_leads_exported', { count: state.leads.length });
  };

  window.switchAdminTab = function(tabName) {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.admin-tab-content').forEach(c => c.style.display = 'none');
    
    event.target.classList.add('active');
    const targetContent = document.getElementById(`adminTab_${tabName}`);
    if (targetContent) targetContent.style.display = 'block';
  };

  // --- Floating Live WhatsApp / Chat Widget ---
  const chatModal = document.getElementById('liveChatModal');
  window.toggleLiveChat = function() {
    if (chatModal) {
      chatModal.classList.toggle('active');
      trackGA4Event('whatsapp_chat_opened', { source: 'floating_widget' });
    }
  };

  window.sendChatMessage = function() {
    const input = document.getElementById('chatMsgInput');
    const messagesBox = document.getElementById('chatMessagesBox');
    if (!input || !input.value.trim() || !messagesBox) return;

    const userMsg = input.value.trim();
    messagesBox.innerHTML += `
      <div style="background: #2b3a1c; color: white; padding: 10px 14px; border-radius: 12px 12px 0 12px; margin-bottom: 10px; max-width: 80%; margin-left: auto; font-size: 0.9rem;">
        ${userMsg}
      </div>
    `;
    input.value = '';

    messagesBox.scrollTop = messagesBox.scrollHeight;

    setTimeout(() => {
      messagesBox.innerHTML += `
        <div style="background: #eae8dc; color: #1d2417; padding: 10px 14px; border-radius: 12px 12px 12px 0; margin-bottom: 10px; max-width: 80%; font-size: 0.9rem;">
          👋 Hi there! Thanks for reaching Dawson Landscaping Perth. What suburb is your project in, or would you like an instant quote estimate?
        </div>
      `;
      messagesBox.scrollTop = messagesBox.scrollHeight;
    }, 800);
  };

  // --- IntersectionObserver Scroll Reveal Engine ---
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  }
});

