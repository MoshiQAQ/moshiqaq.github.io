/**
 * 点云背景效果
 * 创建具有科技感的交互式粒子背景
 */

class ParticleSystem {
    constructor() {
        this.canvas = document.getElementById('particles');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.particleCount = 100;
        this.maxDistance = 150;
        this.mousePosition = { x: 0, y: 0 };
        this.isMouseMoving = false;
        this.mouseTimeout = null;
        
        this.init();
    }
    
    // 初始化画布和事件监听
    init() {
        // 设置画布尺寸
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // 鼠标交互
        document.addEventListener('mousemove', (e) => {
            this.mousePosition = {
                x: e.clientX,
                y: e.clientY
            };
            
            this.isMouseMoving = true;
            
            // 鼠标停止移动后重置状态
            clearTimeout(this.mouseTimeout);
            this.mouseTimeout = setTimeout(() => {
                this.isMouseMoving = false;
            }, 500);
        });
        
        // 创建粒子
        this.createParticles();
        
        // 开始动画循环
        this.animate();
    }
    
    // 调整画布尺寸
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // 重新创建粒子以适应新尺寸
        this.createParticles();
    }
    
    // 创建粒子
    createParticles() {
        this.particles = [];
        
        // 粒子数量基于屏幕大小动态调整
        const particleDensity = Math.min(window.innerWidth, window.innerHeight) * 0.1;
        this.particleCount = Math.floor(particleDensity);
        
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 3 + 1,
                speedX: Math.random() * 1 - 0.5,
                speedY: Math.random() * 1 - 0.5,
                color: `rgba(74, 111, 165, ${Math.random() * 0.5 + 0.2})`,
            });
        }
    }
    
    // 绘制粒子
    drawParticles() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制每个粒子并连接线
        this.particles.forEach((particle, index) => {
            // 更新粒子位置
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            // 边界检查
            if (particle.x < 0 || particle.x > this.canvas.width) {
                particle.speedX = -particle.speedX;
            }
            
            if (particle.y < 0 || particle.y > this.canvas.height) {
                particle.speedY = -particle.speedY;
            }
            
            // 鼠标互动效果：鼠标靠近时粒子加速远离
            if (this.isMouseMoving) {
                const dx = this.mousePosition.x - particle.x;
                const dy = this.mousePosition.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    const force = 0.5 / Math.max(1, distance);
                    particle.speedX -= force * dx;
                    particle.speedY -= force * dy;
                }
            }
            
            // 限制粒子最大速度
            const speed = Math.sqrt(particle.speedX * particle.speedX + particle.speedY * particle.speedY);
            if (speed > 2) {
                particle.speedX = (particle.speedX / speed) * 2;
                particle.speedY = (particle.speedY / speed) * 2;
            }
            
            // 绘制粒子
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color;
            this.ctx.fill();
            
            // 连接附近的粒子
            for (let j = index + 1; j < this.particles.length; j++) {
                const otherParticle = this.particles[j];
                const dx = particle.x - otherParticle.x;
                const dy = particle.y - otherParticle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.maxDistance) {
                    // 基于距离计算线的透明度
                    const opacity = 1 - (distance / this.maxDistance);
                    
                    this.ctx.beginPath();
                    this.ctx.moveTo(particle.x, particle.y);
                    this.ctx.lineTo(otherParticle.x, otherParticle.y);
                    this.ctx.strokeStyle = `rgba(74, 111, 165, ${opacity * 0.2})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.stroke();
                }
            }
        });
    }
    
    // 动画循环
    animate() {
        this.drawParticles();
        requestAnimationFrame(() => this.animate());
    }
}

// 页面加载后初始化粒子系统
window.addEventListener('DOMContentLoaded', () => {
    new ParticleSystem();
});