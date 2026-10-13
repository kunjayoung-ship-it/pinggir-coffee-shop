const financeConfig = {
  bca: { balance: 0, visible: true },
  bni: { balance: 0, visible: true },
  dana: { balance: 0, visible: true },
  gopay: { balance: 0, visible: true }
};

const personalSpendingConfig = {
  dailyExpenses: {},
  incomePerCollegeDay: 0,
  collegeDays: [],
  daysOfWeek: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']
};

const state = {
  letterOpen: false,
  fontScale: 1,
  letterProgress: 0
};

const formatRupiah = (value) => {
  const safeValue = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(safeValue);
};

const getVisibleTotal = () => {
  return Object.keys(financeConfig).reduce((sum, key) => {
    const account = financeConfig[key];
    return account.visible ? sum + Number(account.balance || 0) : sum;
  }, 0);
};

const applyPersonalOverrides = () => {
  const overrides = window.personalOverrides;
  if (!overrides) return;

  Object.entries(overrides.finance || {}).forEach(([key, balance]) => {
    if (financeConfig[key] && Number.isFinite(balance) && balance >= 0) {
      financeConfig[key].balance = balance;
    }
  });

  if (overrides.spending) {
    Object.assign(personalSpendingConfig, overrides.spending);
  }

  if (overrides.signerName) {
    document.getElementById('signerNameInput').value = overrides.signerName;
  }

  if (overrides.signatureImage) {
    const signatureImage = document.getElementById('signatureImage');
    signatureImage.src = overrides.signatureImage;
    signatureImage.hidden = false;
  }
};

const updateLetterMeta = () => {
  const signerName = document.getElementById('signerNameInput').value.trim() || 'Nama Penandatangan';
  const letterDate = document.getElementById('letterDateInput').value.trim() || '13/10/2026';
  const effectiveDate = document.getElementById('effectiveDateInput').value.trim() || '13/10/2026';

  document.getElementById('signerNameDisplay').textContent = signerName;
  document.getElementById('letterDateDisplay').textContent = letterDate;
  document.getElementById('effectiveDateDisplay').textContent = effectiveDate;
};

const renderFinance = () => {
  const total = getVisibleTotal();
  document.getElementById('totalBalance').textContent = formatRupiah(total);

  Object.entries(financeConfig).forEach(([key, account]) => {
    const card = document.querySelector(`[data-account="${key}"]`);
    const valueNode = card.querySelector('[data-balance]');
    const toggleButton = card.querySelector('.toggle-visibility');

    const isVisible = account.visible;
    valueNode.textContent = isVisible ? formatRupiah(account.balance) : 'Rp••••••';

    toggleButton.textContent = isVisible ? 'Sembunyikan' : 'Tampilkan';
    toggleButton.setAttribute('aria-label', `${isVisible ? 'Sembunyikan' : 'Tampilkan'} saldo ${key.toUpperCase()}`);
    card.classList.toggle('is-hidden', !isVisible);
  });
};

const renderSpendingAnalysis = () => {
  const expenses = Object.entries(personalSpendingConfig.dailyExpenses);
  const dailyExpense = expenses
    .reduce((total, [, amount]) => total + amount, 0);
  const weeklyIncome = personalSpendingConfig.collegeDays.length
    * personalSpendingConfig.incomePerCollegeDay;
  const weeklyExpenses = personalSpendingConfig.daysOfWeek.length * dailyExpense;
  const weeklyDeficit = weeklyExpenses - weeklyIncome;
  const hasPrivateData = Boolean(window.personalOverrides);

  document.getElementById('dailyExpenseTotal').textContent = formatRupiah(dailyExpense);
  document.getElementById('weeklyIncomeTotal').textContent = formatRupiah(weeklyIncome);
  document.getElementById('weeklyExpenseTotal').textContent = formatRupiah(weeklyExpenses);
  document.getElementById('weeklyDeficitTotal').textContent = formatRupiah(weeklyDeficit);
  document.getElementById('spendingDescription').textContent = hasPrivateData
    ? `Pengeluaran ${formatRupiah(dailyExpense)} dihitung setiap hari. Pemasukan diterima hanya pada hari kuliah: ${personalSpendingConfig.collegeDays.join(' dan ')}.`
    : 'Rincian pengeluaran dan pemasukan pribadi disembunyikan pada versi publik.';
  document.getElementById('dailyExpenseDetails').textContent = hasPrivateData
    ? expenses.map(([label, amount]) => `${label} ${formatRupiah(amount)}`).join(' + ')
    : 'Rincian disembunyikan pada versi publik';
  document.getElementById('weeklyIncomeDetails').textContent = hasPrivateData
    ? `${formatRupiah(personalSpendingConfig.incomePerCollegeDay)} × ${personalSpendingConfig.collegeDays.length} hari kuliah`
    : 'Rincian disembunyikan pada versi publik';
  document.getElementById('weeklyExpenseDetails').textContent = hasPrivateData
    ? `${formatRupiah(dailyExpense)} × ${personalSpendingConfig.daysOfWeek.length} hari`
    : 'Rincian disembunyikan pada versi publik';
  document.getElementById('weeklyDeficitDetails').textContent = hasPrivateData
    ? 'Pengeluaran dikurangi pemasukan'
    : 'Rincian disembunyikan pada versi publik';
  document.getElementById('spendingNote').textContent = hasPrivateData
    ? 'Perhitungan menganggap pengeluaran tersebut terjadi setiap hari, termasuk hari tanpa kuliah.'
    : 'Data pribadi disembunyikan pada versi publik.';

  const breakdown = document.getElementById('spendingBreakdown');
  breakdown.replaceChildren();

  personalSpendingConfig.daysOfWeek.forEach((day) => {
    const income = personalSpendingConfig.collegeDays.includes(day)
      ? personalSpendingConfig.incomePerCollegeDay
      : 0;
    const balance = income - dailyExpense;
    const row = document.createElement('tr');

    [day, formatRupiah(income), formatRupiah(dailyExpense)].forEach((value) => {
      const cell = document.createElement('td');
      cell.textContent = value;
      row.appendChild(cell);
    });

    const balanceCell = document.createElement('td');
    balanceCell.textContent = balance < 0
      ? `Kurang ${formatRupiah(Math.abs(balance))}`
      : formatRupiah(balance);
    balanceCell.classList.toggle('negative-balance', balance < 0);
    row.appendChild(balanceCell);
    breakdown.appendChild(row);
  });
};

const setReadingProgress = () => {
  const section = document.getElementById('letter');
  const rect = section.getBoundingClientRect();
  const total = Math.max(section.offsetHeight - window.innerHeight, 1);
  const offset = Math.min(Math.max((window.scrollY - section.offsetTop + 200) / total, 0), 1);
  const percentage = Math.round(offset * 100);

  document.getElementById('progressBar').style.width = `${percentage}%`;
  document.getElementById('readingProgressText').textContent = `${percentage}%`;
  document.getElementById('letterProgressLabel').textContent = `${percentage}%`;
};

const toggleLetter = () => {
  const card = document.getElementById('letterCard');
  state.letterOpen = !state.letterOpen;
  card.classList.toggle('is-open', state.letterOpen);
  document.getElementById('toggleLetter').textContent = state.letterOpen ? 'Tutup Surat' : 'Buka Surat';
};

const copyLetterText = async () => {
  const text = document.getElementById('letterBody').innerText;

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return 'Isi surat berhasil disalin.';
    }

    const helper = document.createElement('textarea');
    helper.value = text;
    document.body.appendChild(helper);
    helper.select();
    document.execCommand('copy');
    helper.remove();
    return 'Isi surat berhasil disalin.';
  } catch (error) {
    return 'Clipboard tidak tersedia pada browser ini.';
  }
};

const bindLetterActions = () => {
  const toggleLetterButton = document.getElementById('toggleLetter');
  toggleLetterButton.addEventListener('click', toggleLetter);

  document.getElementById('fontUp').addEventListener('click', () => {
    state.fontScale = Math.min(1.25, state.fontScale + 0.08);
    document.documentElement.style.setProperty('--letter-text', `${state.fontScale}rem`);
  });

  document.getElementById('fontDown').addEventListener('click', () => {
    state.fontScale = Math.max(0.9, state.fontScale - 0.08);
    document.documentElement.style.setProperty('--letter-text', `${state.fontScale}rem`);
  });

  document.getElementById('printLetter').addEventListener('click', () => window.print());

  document.getElementById('copyLetter').addEventListener('click', async () => {
    const message = await copyLetterText();
    document.getElementById('copyLetter').textContent = message;
    window.setTimeout(() => {
      document.getElementById('copyLetter').textContent = 'Salin Isi Surat';
    }, 1800);
  });

  document.getElementById('settingsToggle').addEventListener('click', () => {
    const panel = document.getElementById('settingsPanel');
    const expanded = panel.classList.toggle('hidden');
    document.getElementById('settingsToggle').setAttribute('aria-expanded', String(!expanded));
    document.getElementById('settingsToggle').textContent = expanded ? 'Panel Pengaturan' : 'Tutup Panel';
  });

  document.getElementById('backToTop').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  document.getElementById('signerNameInput').addEventListener('input', updateLetterMeta);
  document.getElementById('letterDateInput').addEventListener('input', updateLetterMeta);
  document.getElementById('effectiveDateInput').addEventListener('input', updateLetterMeta);
};

const bindNavigation = () => {
  document.querySelector('.nav-toggle').addEventListener('click', () => {
    const nav = document.querySelector('.nav-menu');
    const toggle = document.querySelector('.nav-toggle');
    const open = nav.classList.toggle('is-open');
    toggle.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  });

  document.querySelectorAll('.nav-menu a').forEach((link) => {
    link.addEventListener('click', () => {
      const nav = document.querySelector('.nav-menu');
      nav.classList.remove('is-open');
      document.querySelector('.nav-toggle').classList.remove('is-open');
    });
  });
};

const bindFinanceActions = () => {
  document.querySelectorAll('.toggle-visibility').forEach((button) => {
    button.addEventListener('click', () => {
      const key = button.closest('[data-account]').dataset.account;
      financeConfig[key].visible = !financeConfig[key].visible;
      renderFinance();
    });
  });
};

const bindRevealAnimations = () => {
  const revealItems = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  revealItems.forEach((item) => observer.observe(item));
};

const bindScrollEffects = () => {
  window.addEventListener('scroll', () => {
    setReadingProgress();

    const backToTop = document.getElementById('backToTop');
    if (window.scrollY > 350) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  });
};

const init = () => {
  applyPersonalOverrides();
  renderFinance();
  renderSpendingAnalysis();
  updateLetterMeta();
  bindLetterActions();
  bindNavigation();
  bindFinanceActions();
  bindRevealAnimations();
  bindScrollEffects();
  setReadingProgress();
  document.getElementById('toggleLetter').click();
};

document.addEventListener('DOMContentLoaded', init);
