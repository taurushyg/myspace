document.addEventListener('DOMContentLoaded', () => {
    // 初始化所有轮播
    const carousels = document.querySelectorAll('.card-carousel');
    
    carousels.forEach(carousel => {
        const images = carousel.querySelectorAll('img');
        const dots = carousel.querySelectorAll('.dot');
        let currentIndex = 0;
        let interval;

        function showImage(index) {
            images.forEach(img => img.classList.remove('active'));
            dots.forEach(dot => dot.classList.remove('active'));
            images[index].classList.add('active');
            dots[index].classList.add('active');
        }

        function nextImage() {
            currentIndex = (currentIndex + 1) % images.length;
            showImage(currentIndex);
        }

        // 点击圆点切换图片
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                clearInterval(interval);
                currentIndex = index;
                showImage(currentIndex);
                interval = setInterval(nextImage, 5000);
            });
        });

        // 启动自动轮播
        interval = setInterval(nextImage, 5000);
    });

    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendMessage');
    const API_URL = "https://api-inference.huggingface.co/models/THUDM/chatglm2-6b";
    const API_KEY = ""; // 需要在 Hugging Face 注册并获取 API key

    function addMessage(message, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
        messageDiv.innerHTML = `<p>${message}</p>`;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async function handleUserMessage() {
        const message = userInput.value.trim();
        if (message) {
            addMessage(message, true);
            userInput.value = '';
            
            // 显示加载状态
            const loadingMessage = '正在思考...';
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'message ai-message loading';
            loadingDiv.innerHTML = `<p>${loadingMessage}</p>`;
            chatMessages.appendChild(loadingDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;

            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        inputs: message,
                        parameters: {
                            max_length: 500,
                            temperature: 0.7,
                        }
                    })
                });

                const data = await response.json();
                
                // 移除加载消息
                chatMessages.removeChild(loadingDiv);

                // 添加AI回复
                if (data && data[0] && data[0].generated_text) {
                    addMessage(data[0].generated_text);
                } else {
                    addMessage('抱歉，我现在无法回答这个问题。请稍后再试。');
                }
            } catch (error) {
                console.error('Error:', error);
                // 移除加载消息
                chatMessages.removeChild(loadingDiv);
                addMessage('抱歉，发生了一些错误。请稍后再试。');
            }
        }
    }

    sendButton.addEventListener('click', handleUserMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleUserMessage();
        }
    });

    // 添加加载动画样式
    const style = document.createElement('style');
    style.textContent = `
        .loading p {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .loading p::after {
            content: '';
            width: 12px;
            height: 12px;
            border: 2px solid #4a90e2;
            border-radius: 50%;
            border-top-color: transparent;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
}); 