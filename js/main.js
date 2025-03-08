// Highlight active section in navigation
function highlightActiveSection() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    
    let currentSectionId = '';
    
    // Determine which section is currently in view
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.offsetHeight;
        
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            currentSectionId = section.getAttribute('id');
        }
    });
    
    // Highlight corresponding navigation link
    if (currentSectionId) {
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
        
        mobileNavLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    }
}

// Call on scroll
window.addEventListener('scroll', highlightActiveSection);/**
* 主页面交互功能
* 处理导航、动画效果和页面交互
*/

// 等待页面加载完成
document.addEventListener('DOMContentLoaded', () => {
// 元素引用
const landingPage = document.querySelector('.landing-page');
const mainContent = document.querySelector('.main-content');
const enterButton = document.getElementById('enterButton');
const greetingText = document.getElementById('greeting-text');

// 根据当前时间设置问候语
updateGreeting();
const nav = document.querySelector('nav');
const navLinks = document.querySelectorAll('.nav-link');
const mobileMenuButton = document.querySelector('.mobile-menu-button');
const mobileNav = document.querySelector('.mobile-nav');
const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
const publicationItems = document.querySelectorAll('.publication-item');

// 前置页面进入主页功能
enterButton.addEventListener('click', () => {
    landingPage.style.opacity = '0';
    mainContent.style.opacity = '1';
    
    // 动画完成后移除前置页面
    setTimeout(() => {
        landingPage.style.display = 'none';
    }, 800);
});

// 导航栏滚动效果
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        nav.classList.add('nav-scrolled');
    } else {
        nav.classList.remove('nav-scrolled');
    }
});

// 导航链接平滑滚动
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        window.scrollTo({
            top: targetElement.offsetTop - 80,
            behavior: 'smooth'
        });
    });
});

// 移动端菜单展开/收起
mobileMenuButton.addEventListener('click', () => {
    mobileNav.classList.toggle('active');
    
    // 添加菜单按钮动画
    const spans = mobileMenuButton.querySelectorAll('span');
    spans.forEach(span => span.classList.toggle('active'));
    
    // 禁止滚动
    document.body.classList.toggle('menu-open');
});

// 移动端导航链接点击
mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
        // 关闭菜单
        mobileNav.classList.remove('active');
        document.body.classList.remove('menu-open');
        
        // 滚动到目标位置
        const targetId = link.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        setTimeout(() => {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }, 300);
    });
});

// Publications abstract expand/collapse
const abstractLinks = document.querySelectorAll('.publication-link:nth-child(3)');

abstractLinks.forEach((link, index) => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        // Toggle abstract
        publicationItems[index].classList.toggle('publication-expanded');
        
        // Update link text
        if (publicationItems[index].classList.contains('publication-expanded')) {
            link.innerHTML = '<span class="link-icon">🔍</span> Hide Abstract';
        } else {
            link.innerHTML = '<span class="link-icon">🔍</span> Abstract';
        }
    });
});

// 页面加载时的淡入动画
setTimeout(() => {
    // 检查是否在前置页面
    if (landingPage.style.display !== 'none' && window.location.hash === '') {
        // 在前置页面，不立即显示主内容
    } else {
        // 直接进入主内容（如果有锚点或刷新页面时）
        landingPage.style.display = 'none';
        mainContent.style.opacity = '1';
    }
}, 100);

// 处理滚动动画
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

// 创建滚动观察器
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// 添加要观察的元素
const animateElements = document.querySelectorAll('.research-item, .publication-item, .contact-info, .contact-form');

animateElements.forEach(element => {
    // 初始化元素状态
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    
    // 观察元素
    observer.observe(element);
});

// 添加CSS对动画元素的样式
const style = document.createElement('style');
style.textContent = `
    .animate-in {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
`;
document.head.appendChild(style);

// 表单验证
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const nameInput = contactForm.querySelector('input[type="text"]');
        const emailInput = contactForm.querySelector('input[type="email"]');
        const messageInput = contactForm.querySelector('textarea');
        
        // 简单验证
        let isValid = true;
        
        if (!nameInput.value.trim()) {
            isValid = false;
            nameInput.style.borderColor = 'red';
        } else {
            nameInput.style.borderColor = '#e0e0e0';
        }
        
        if (!emailInput.value.trim() || !validateEmail(emailInput.value)) {
            isValid = false;
            emailInput.style.borderColor = 'red';
        } else {
            emailInput.style.borderColor = '#e0e0e0';
        }
        
        if (!messageInput.value.trim()) {
            isValid = false;
            messageInput.style.borderColor = 'red';
        } else {
            messageInput.style.borderColor = '#e0e0e0';
        }
        
        if (isValid) {
            // 在这里可以添加表单提交逻辑
            alert('消息已发送！我们会尽快回复您。');
            contactForm.reset();
        }
    });
}

// 邮箱验证函数
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Update greeting based on time of day
function updateGreeting() {
    const hour = new Date().getHours();
    let greeting;
    
    if (hour >= 5 && hour < 12) {
        greeting = "Good morning, welcome to my academic space";
    } else if (hour >= 12 && hour < 18) {
        greeting = "Good afternoon, I'm delighted to share my research with you";
    } else if (hour >= 18 && hour < 22) {
        greeting = "Good evening, thank you for visiting my portfolio";
    } else {
        greeting = "It's late, thank you for your dedication to knowledge";
    }
    
    // Update greeting text
    if (greetingText) {
        greetingText.textContent = greeting;
    }
}
});