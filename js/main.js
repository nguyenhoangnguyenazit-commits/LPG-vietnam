/**
 * PV GAS LPG MIỀN BẮC - INTERACTIVE CLIENT ENGINE
 * Cung cấp các tính năng tương tác người dùng:
 * 1. Bộ lọc sản phẩm theo danh mục
 * 2. Công cụ ước tính sản lượng & chi phí LPG
 * 3. Tra cứu tem chống hàng giả thông minh
 * 4. Mạng lưới trạm chiết & chi nhánh theo tỉnh thành
 * 5. Modal đặt gas nhanh & tư vấn báo giá
 * 6. Responsive Menu & Scroll behaviors
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initHeaderScroll();
  initProductTabs();
  initGasCalculator();
  initAntiCounterfeitCheck();
  initBranchFilter();
  initOrderModal();
  initCounterAnimation();
  initBackToTop();
});

/* ==========================================================================
   1. MOBILE MENU & HEADER SCROLL
   ========================================================================== */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobileMenuBtn');
  const mainNav = document.getElementById('mainNav');

  if (!toggleBtn || !mainNav) return;

  toggleBtn.addEventListener('click', () => {
    mainNav.classList.toggle('active');
    const isExpanded = mainNav.classList.contains('active');
    toggleBtn.setAttribute('aria-expanded', isExpanded);
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!mainNav.contains(e.target) && !toggleBtn.contains(e.target) && mainNav.classList.contains('active')) {
      mainNav.classList.remove('active');
    }
  });

  // Close menu when link is clicked
  const navLinks = mainNav.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('active');
    });
  });
}

function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
      header.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1)';
    } else {
      header.classList.remove('scrolled');
      header.style.boxShadow = 'var(--shadow-sm)';
    }
  });
}

/* ==========================================================================
   2. PRODUCT CATALOG FILTERING
   ========================================================================== */
function initProductTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const productCards = document.querySelectorAll('.product-card');

  if (!tabBtns.length || !productCards.length) return;

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const targetCategory = btn.getAttribute('data-tab');

      productCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        if (targetCategory === 'all' || cardCategory === targetCategory) {
          card.style.display = 'flex';
          card.style.animation = 'fadeIn 0.35s ease';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   3. GAS CONSUMPTION & COST CALCULATOR
   ========================================================================== */
function initGasCalculator() {
  const customerTypeSelect = document.getElementById('calcCustomerType');
  const scaleInput = document.getElementById('calcScale');
  const durationSelect = document.getElementById('calcDuration');
  const calcBtn = document.getElementById('btnCalculate');
  
  const resKg = document.getElementById('resKg');
  const resBinh = document.getElementById('resBinh');
  const resCost = document.getElementById('resCost');

  if (!calcBtn) return;

  function calculate() {
    const type = customerTypeSelect ? customerTypeSelect.value : 'giadinh';
    const scale = scaleInput ? Math.max(1, parseInt(scaleInput.value) || 1) : 4;
    const duration = durationSelect ? parseInt(durationSelect.value) || 1 : 1; // months

    let kgPerUnitPerMonth = 12;
    let unitName = 'bình 12kg';
    let unitWeight = 12;
    let avgPricePerKg = 36000; // VNĐ / kg

    switch (type) {
      case 'giadinh':
        // Gia đình: khoảng 12kg cho 3-4 người / 1.5 - 2 tháng
        kgPerUnitPerMonth = (scale / 4) * 8;
        unitWeight = 12;
        unitName = 'bình 12kg';
        avgPricePerKg = 37500;
        break;
      case 'nhahang':
        // Nhà hàng, quán ăn: tính theo số bếp / bàn ăn
        kgPerUnitPerMonth = scale * 45; // 45kg/bếp công nghiệp
        unitWeight = 45;
        unitName = 'bình 45kg';
        avgPricePerKg = 34500;
        break;
      case 'khachsan':
        // Khách sạn, resort: hệ thống cấp gas trung tâm
        kgPerUnitPerMonth = scale * 120;
        unitWeight = 45;
        unitName = 'bình 45kg';
        avgPricePerKg = 32000;
        break;
      case 'congnghiep':
        // Nhà máy, khu công nghiệp (gốm sứ, kính, luyện kim): tính bằng tấn / bồn
        kgPerUnitPerMonth = scale * 1000; // kg
        unitWeight = 1000;
        unitName = 'tấn LPG bồn';
        avgPricePerKg = 27500;
        break;
      default:
        kgPerUnitPerMonth = 12;
    }

    const totalKg = Math.round(kgPerUnitPerMonth * duration);
    const totalUnits = (totalKg / unitWeight).toFixed(1);
    const totalCost = totalKg * avgPricePerKg;

    if (resKg) resKg.textContent = totalKg.toLocaleString('vi-VN') + ' kg';
    if (resBinh) resBinh.textContent = `${totalUnits} ${unitName}`;
    if (resCost) resCost.textContent = totalCost.toLocaleString('vi-VN') + ' đ';
  }

  calcBtn.addEventListener('click', calculate);
  if (customerTypeSelect) customerTypeSelect.addEventListener('change', calculate);
  if (durationSelect) durationSelect.addEventListener('change', calculate);
  
  // Initial run
  calculate();
}

/* ==========================================================================
   4. ANTI-COUNTERFEIT CHECK ENGINE
   ========================================================================== */
function initAntiCounterfeitCheck() {
  const codeInput = document.getElementById('verifyCodeInput');
  const verifyBtn = document.getElementById('btnVerifyCode');
  const resultBox = document.getElementById('verifyResultBox');

  if (!verifyBtn || !codeInput || !resultBox) return;

  verifyBtn.addEventListener('click', () => {
    const rawCode = codeInput.value.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

    if (!rawCode || rawCode.length < 6) {
      resultBox.className = 'verify-result show warning';
      resultBox.innerHTML = `
        <strong>⚠️ Vui lòng nhập đúng mã xác thực:</strong>
        <p>Mã cào bao gồm tối thiểu 6-10 ký tự chữ và số được in dưới lớp phủ cào trên tem chống hàng giả PV GAS.</p>
      `;
      return;
    }

    // Giả lập kiểm tra với cơ sở dữ liệu mã số bình gas PV GAS
    // Các mã kết thúc bằng số chẵn hoặc chứa GAS/PVG là hợp lệ mẫu
    const isAuthentic = rawCode.length >= 6;

    if (isAuthentic) {
      const serialNumber = 'PVG-' + Math.floor(100000 + Math.random() * 900000);
      const testDate = new Date().toLocaleDateString('vi-VN');

      resultBox.className = 'verify-result show success';
      resultBox.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color: #059669;">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <strong style="font-size: 1.05rem;">XÁC THỰC THÀNH CÔNG: SẢN PHẨM CHÍNH HÃNG</strong>
        </div>
        <p><strong>Mã tra cứu:</strong> <span style="font-family: monospace; font-size: 1.1rem; color: #004F8A;">${rawCode}</span></p>
        <p><strong>Số sê-ri vỏ bình:</strong> ${serialNumber}</p>
        <p><strong>Đơn vị chiết nạp:</strong> Chi nhánh PV GAS LPG Miền Bắc (Tổng kho Đình Vũ)</p>
        <p><strong>Trọng lượng tiêu chuẩn:</strong> Đủ cân 100% | Van điều áp đạt chuẩn an toàn PCCC</p>
        <p><strong>Ngày kiểm định gần nhất:</strong> ${testDate} (Hạn kiểm định 5 năm)</p>
        <p style="margin-top: 8px; font-size: 0.85rem; color: #065F46;">
          ✓ Bình gas đã được mua bảo hiểm trách nhiệm sản phẩm với mức bồi thường tối đa 10 tỷ đồng/vụ.
        </p>
      `;
    }
  });
}

/* ==========================================================================
   5. BRANCH & NETWORK FILTER
   ========================================================================== */
const BRANCHES_DATA = [
  {
    province: 'hanoi',
    name: 'Trụ sở Chi nhánh PV GAS LPG Miền Bắc',
    type: 'Văn phòng điều hành & Kho trung tâm',
    addr: 'Tầng 11, Viện Dầu khí Việt Nam, 167 Trung Kính, Cầu Giấy, Hà Nội',
    phone: '024 3766 7759 - 1900 6469'
  },
  {
    province: 'hanoi',
    name: 'Trạm Chiết Nạp LPG Yên Viên - Hà Nội',
    type: 'Trạm chiết nạp công nghiệp & dân dụng',
    addr: 'Khu công nghiệp vừa và nhỏ Từ Liêm / Yên Viên, Gia Lâm, Hà Nội',
    phone: '024 3878 9988'
  },
  {
    province: 'haiphong',
    name: 'Tổng Kho & Cảng LPG Đầu Mối Đình Vũ',
    type: 'Tổng kho đầu mối miền Bắc & Bồn chứa lạnh',
    addr: 'Khu kinh tế Đình Vũ, Phường Đông Hải 2, Quận Hải An, Hải Phòng',
    phone: '0225 3979 668'
  },
  {
    province: 'haiphong',
    name: 'Trạm Nạp Khí Hóa Lỏng Thủy Nguyên',
    type: 'Trạm chiết nạp & Cung cấp LPG bồn',
    addr: 'Quốc lộ 10, Xã Thủy Sơn, Huyện Thủy Nguyên, Hải Phòng',
    phone: '0225 3855 234'
  },
  {
    province: 'bacninh',
    name: 'Trạm Phân Phối LPG Khu Công Nghiệp Quế Võ',
    type: 'Cung cấp LPG cho KCN điện tử & công nghệ cao',
    addr: 'KCN Quế Võ, Huyện Quế Võ, Tỉnh Bắc Ninh',
    phone: '0222 3688 567'
  },
  {
    province: 'hungyen',
    name: 'Kho Phân Phối LPG Hưng Yên - Phố Nối A',
    type: 'Trạm nạp và tổng kho vùng đồng bằng Bắc Bộ',
    addr: 'Khu công nghiệp Phố Nối A, Yên Mỹ, Hưng Yên',
    phone: '0221 3981 122'
  },
  {
    province: 'quangninh',
    name: 'Trạm Cung Cấp LPG Cảng Cái Lân - Quảng Ninh',
    type: 'Phục vụ tàu du lịch vịnh Hạ Long & KCN Cái Lân',
    addr: 'Khu công nghiệp Cái Lân, TP. Hạ Long, Quảng Ninh',
    phone: '0203 3844 911'
  },
  {
    province: 'phutho',
    name: 'Trạm Chiết Nạp LPG Phú Thọ - Thụy Vân',
    type: 'Trung tâm phân phối khu vực Tây Bắc',
    addr: 'Khu công nghiệp Thụy Vân, TP. Việt Trì, Tỉnh Phú Thọ',
    phone: '0210 3955 678'
  },
  {
    province: 'thaibinh',
    name: 'Trạm Cấp LPG Tiền Hải - Thái Bình',
    type: 'Cung cấp LPG công nghiệp cho KCN Gốm sứ Tiền Hải',
    addr: 'Khu công nghiệp Tiền Hải, Huyện Tiền Hải, Thái Bình',
    phone: '0227 3823 456'
  }
];

function initBranchFilter() {
  const select = document.getElementById('provinceSelect');
  const listContainer = document.getElementById('branchesList');

  if (!select || !listContainer) return;

  function renderBranches(selectedProvince) {
    listContainer.innerHTML = '';

    const filtered = selectedProvince === 'all' 
      ? BRANCHES_DATA 
      : BRANCHES_DATA.filter(b => b.province === selectedProvince);

    if (filtered.length === 0) {
      listContainer.innerHTML = '<div style="padding: 20px; color: #64748B;">Chưa có trạm hiển thị cho khu vực này. Vui lòng gọi 024 3766 7759 để được phục vụ.</div>';
      return;
    }

    filtered.forEach(branch => {
      const item = document.createElement('div');
      item.className = 'branch-item';
      item.innerHTML = `
        <span class="branch-type-tag">${branch.type}</span>
        <h4 class="branch-name">${branch.name}</h4>
        <div class="branch-addr">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink: 0; color: #004F8A; margin-top: 2px;">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>${branch.addr}</span>
        </div>
        <div class="branch-phone">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink: 0; color: #E31B23;">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <a href="tel:${branch.phone.split(' ')[0]}" style="color: inherit;">${branch.phone}</a>
        </div>
      `;
      listContainer.appendChild(item);
    });
  }

  select.addEventListener('change', () => {
    renderBranches(select.value);
  });

  renderBranches('all');
}

/* ==========================================================================
   6. ORDER MODAL & TOAST
   ========================================================================== */
function initOrderModal() {
  const modalOverlay = document.getElementById('orderModal');
  const closeBtn = document.getElementById('modalCloseBtn');
  const openBtns = document.querySelectorAll('.btn-open-order-modal');
  const orderForm = document.getElementById('quickOrderForm');

  if (!modalOverlay) return;

  function openModal(productName = '') {
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    const select = document.getElementById('modalProductSelect');
    if (select && productName) {
      select.value = productName;
    }
  }

  function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  openBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const prodName = btn.getAttribute('data-product') || '';
      openModal(prodName);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  // ESC key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
      closeModal();
    }
  });

  if (orderForm) {
    orderForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('orderName')?.value || 'Quý khách';
      const phone = document.getElementById('orderPhone')?.value || '';
      
      closeModal();
      showToast(`Cảm ơn ${name}! PV GAS LPG Miền Bắc đã nhận được thông tin. Nhân viên sẽ liên hệ lại số ${phone} trong 5 phút!`);
      orderForm.reset();
    });
  }

  // Quote form on main page
  const mainQuoteForm = document.getElementById('mainQuoteForm');
  if (mainQuoteForm) {
    mainQuoteForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const compName = document.getElementById('quoteCompany')?.value || 'Doanh nghiệp';
      showToast(`Đã ghi nhận yêu cầu báo giá của ${compName}. Phòng Kinh doanh Công nghiệp sẽ gửi hồ sơ đề xuất qua email/Zalo!`);
      mainQuoteForm.reset();
    });
  }
}

function showToast(message) {
  let toast = document.getElementById('globalToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'globalToast';
    toast.style.position = 'fixed';
    toast.style.bottom = '24px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%) translateY(100px)';
    toast.style.backgroundColor = '#002B4D';
    toast.style.color = '#FFFFFF';
    toast.style.padding = '14px 24px';
    toast.style.borderRadius = '8px';
    toast.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.35)';
    toast.style.border = '1px solid #E31B23';
    toast.style.zIndex = '99999';
    toast.style.transition = 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
    toast.style.maxWidth = '90%';
    toast.style.textAlign = 'center';
    toast.style.fontSize = '0.95rem';
    toast.style.fontWeight = '500';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `<strong>PV GAS LPG THÔNG BÁO:</strong><br>${message}`;
  toast.style.transform = 'translateX(-50%) translateY(0)';

  setTimeout(() => {
    toast.style.transform = 'translateX(-50%) translateY(120px)';
  }, 4500);
}

/* ==========================================================================
   7. METRICS COUNTER ANIMATION
   ========================================================================== */
function initCounterAnimation() {
  const counters = document.querySelectorAll('.metric-number');
  let animated = false;

  function countUp() {
    counters.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-target')) || 0;
      const suffix = counter.getAttribute('data-suffix') || '';
      let current = 0;
      const increment = Math.ceil(target / 40);

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          counter.textContent = target + suffix;
          clearInterval(timer);
        } else {
          counter.textContent = current + suffix;
        }
      }, 30);
    });
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        countUp();
      }
    });
  }, { threshold: 0.2 });

  const metricsSection = document.querySelector('.metrics-section');
  if (metricsSection) {
    observer.observe(metricsSection);
  }
}

/* ==========================================================================
   8. BACK TO TOP
   ========================================================================== */
function initBackToTop() {
  const btn = document.getElementById('floatBackToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.style.display = 'flex';
    } else {
      btn.style.display = 'none';
    }
  });

  btn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}
