// Main popup script for AI Assistant Chrome Extension
class AIAssistant {
    constructor() {
        this.aiApi = new AIApi();
        this.dataAnalyzer = new DataAnalyzer();
        this.isInitialized = false;
        this.currentStreamingMessage = null;
        
        this.initializeElements();
        this.attachEventListeners();
        this.initialize();
    }

    // Initialize DOM elements
    initializeElements() {
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.clearButton = document.getElementById('clearButton');
        this.exportButton = document.getElementById('exportButton');
        this.loadingIndicator = document.getElementById('loadingIndicator');
    }

    // Attach event listeners
    attachEventListeners() {
        // Send message events
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keydown', (e) => {
            if (
                e.key === 'Enter' &&
                (
                    (!e.shiftKey && !e.ctrlKey && !e.metaKey) || // Enter only
                    (e.ctrlKey && !e.shiftKey) ||               // Ctrl+Enter
                    (e.metaKey && !e.shiftKey)                  // Cmd+Enter (Mac)
                )
            ) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Auto-resize textarea
        this.messageInput.addEventListener('input', () => {
            this.messageInput.style.height = 'auto';
            this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
        });

        // Clear chat
        this.clearButton.addEventListener('click', () => this.clearChat());

        // Export conversation
        this.exportButton.addEventListener('click', () => this.exportConversation());

        // File upload handling
        document.addEventListener('dragover', (e) => {
            e.preventDefault();
            document.body.classList.add('drag-over');
        });

        document.addEventListener('dragleave', (e) => {
            if (!document.body.contains(e.relatedTarget)) {
                document.body.classList.remove('drag-over');
            }
        });

        document.addEventListener('drop', (e) => {
            e.preventDefault();
            document.body.classList.remove('drag-over');
            this.handleFileUpload(e.dataTransfer.files);
        });
    }

    // Initialize the application
    async initialize() {
        try {
            this.showLoading(true);
            
            // Try to initialize API key from storage
            const hasApiKey = await this.aiApi.initialize();
            
            if (!hasApiKey) {
                await this.promptForApiKey();
            }
            
            this.isInitialized = true;
            this.showLoading(false);
            
            // Focus on input
            this.messageInput.focus();
            
        } catch (error) {
            console.error('Error initializing:', error);
            this.showError('เกิดข้อผิดพลาดในการเริ่มต้นระบบ: ' + error.message);
            this.showLoading(false);
        }
    }

    // Prompt user for API key
    async promptForApiKey() {
        return new Promise((resolve) => {
            const modal = this.createApiKeyModal();
            document.body.appendChild(modal);
            
            const input = modal.querySelector('#apiKeyInput');
            const submitBtn = modal.querySelector('#submitApiKey');
            const cancelBtn = modal.querySelector('#cancelApiKey');
            
            const handleSubmit = async () => {
                const apiKey = input.value.trim();
                if (apiKey) {
                    try {
                        await this.aiApi.setApiKey(apiKey);
                        document.body.removeChild(modal);
                        resolve();
                    } catch (error) {
                        this.showError('ไม่สามารถบันทึก API Key ได้: ' + error.message);
                    }
                } else {
                    this.showError('กรุณาใส่ API Key');
                }
            };
            
            const handleCancel = () => {
                document.body.removeChild(modal);
                this.showError('จำเป็นต้องมี API Key เพื่อใช้งาน');
                resolve();
            };
            
            submitBtn.addEventListener('click', handleSubmit);
            cancelBtn.addEventListener('click', handleCancel);
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSubmit();
                }
            });
            
            // Focus on input
            setTimeout(() => input.focus(), 100);
        });
    }

    // Create API key input modal
    createApiKeyModal() {
        const modal = document.createElement('div');
        modal.className = 'api-key-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>พบปัญหาการตั้งค่า</h3>
                <p>กรุณาใส่ OpenAI API Key เพื่อใช้งาน AI Assistant</p>
                <input type="password" id="apiKeyInput" placeholder="sk-..." />
                <div class="modal-actions">
                    <button id="cancelApiKey" class="cancel-btn">ยกเลิก</button>
                    <button id="submitApiKey" class="submit-btn">ตกลง</button>
                </div>
                <p class="api-key-note">
                    API Key จะถูกเก็บไว้ในเครื่องของคุณเท่านั้น<br>
                    สามารถขอได้ที่ <a href="https://platform.openai.com/api-keys" target="_blank">OpenAI Platform</a>
                </p>
            </div>
        `;
        return modal;
    }

    // Send message to AI
    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message || !this.isInitialized) return;

        try {
            // Clear input and disable send button
            this.messageInput.value = '';
            this.messageInput.style.height = 'auto';
            this.setSendButtonState(false);

            // Add user message to chat
            this.addMessage('user', message);

            // Show loading
            this.showLoading(true);

            // Create AI message container for streaming
            const aiMessageElement = this.addMessage('ai', '', true);
            const messageContent = aiMessageElement.querySelector('.message-text');
            this.currentStreamingMessage = messageContent;

            // Send message with streaming
            await this.aiApi.sendMessage(message, (chunk, fullResponse) => {
                this.updateStreamingMessage(fullResponse);
            });

            this.currentStreamingMessage = null;
            this.showLoading(false);
            this.setSendButtonState(true);

        } catch (error) {
            console.error('Error sending message:', error);
            this.showError('เกิดข้อผิดพลาด: ' + error.message);
            this.showLoading(false);
            this.setSendButtonState(true);
            this.currentStreamingMessage = null;
        }
    }

    // Update streaming message content
    updateStreamingMessage(content) {
        if (this.currentStreamingMessage) {
            // Check if content contains chart data
            const chartMatch = content.match(/```json\s*(\{[\s\S]*?"type":\s*"chart"[\s\S]*?\})\s*```/);
            
            if (chartMatch) {
                try {
                    const chartData = JSON.parse(chartMatch[1]);
                    if (chartData.type === 'chart') {
                        // Remove the JSON block from content and render chart
                        const textContent = content.replace(/```json\s*\{[\s\S]*?"type":\s*"chart"[\s\S]*?\}\s*```/, '').trim();
                        
                        this.currentStreamingMessage.innerHTML = this.formatMessage(textContent);
                        this.renderChart(chartData, this.currentStreamingMessage.parentElement);
                        return;
                    }
                } catch (e) {
                    // If parsing fails, continue with normal text rendering
                }
            }
            
            // Normal text rendering
            this.currentStreamingMessage.innerHTML = this.formatMessage(content);
        }
        
        // Auto-scroll to bottom
        this.scrollToBottom();
    }

    // Add message to chat
    addMessage(role, content, isStreaming = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}-message`;
        
        const avatar = role === 'user' ? '👤' : '🤖';
        
        messageDiv.innerHTML = `
            <div class="message-avatar">${avatar}</div>
            <div class="message-content">
                <div class="message-text">${isStreaming ? '' : this.formatMessage(content)}</div>
            </div>
        `;

        this.chatMessages.appendChild(messageDiv);
        
        if (!isStreaming) {
            // Check for chart data in AI responses
            this.checkAndRenderChart(content, messageDiv);
        }
        
        this.scrollToBottom();
        return messageDiv;
    }

    // Format message content
    formatMessage(content) {
        if (!content) return '';
        
        // Use marked.js if available, otherwise simple formatting
        if (typeof marked !== 'undefined') {
            return marked.parse(content);
        } else {
            // Simple fallback formatting
            return content
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/`(.*?)`/g, '<code>$1</code>')
                .replace(/\n/g, '<br>');
        }
    }

    // Check and render chart from AI response
    checkAndRenderChart(content, messageElement) {
        const chartMatch = content.match(/```json\s*(\{[\s\S]*?"type":\s*"chart"[\s\S]*?\})\s*```/);
        
        if (chartMatch) {
            try {
                const chartData = JSON.parse(chartMatch[1]);
                if (chartData.type === 'chart') {
                    // Remove the JSON block from displayed content
                    const textContent = content.replace(/```json\s*\{[\s\S]*?"type":\s*"chart"[\s\S]*?\}\s*```/, '').trim();
                    const messageText = messageElement.querySelector('.message-text');
                    messageText.innerHTML = this.formatMessage(textContent);
                    
                    // Render chart
                    this.renderChart(chartData, messageElement);
                }
            } catch (error) {
                console.error('Error parsing chart data:', error);
            }
        }
    }

    // Render chart using Chart.js
    renderChart(chartData, messageElement) {
        try {
            if (typeof Chart === 'undefined') {
                console.error('Chart.js not loaded');
                return;
            }

            const chartContainer = document.createElement('div');
            chartContainer.className = 'chart-container';
            
            if (chartData.chartType === 'table') {
                // Render table
                const table = this.dataAnalyzer.createTable(chartData.data);
                chartContainer.appendChild(table);
            } else {
                // Render chart
                const canvas = document.createElement('canvas');
                canvas.width = 400;
                canvas.height = 300;
                chartContainer.appendChild(canvas);

                // Add download button
                const downloadBtn = document.createElement('button');
                downloadBtn.className = 'download-chart-btn';
                downloadBtn.innerHTML = '⬇️';
                downloadBtn.title = 'ดาวน์โหลดกราฟ';
                downloadBtn.addEventListener('click', () => {
                    const link = document.createElement('a');
                    link.download = `${chartData.title || 'chart'}.png`;
                    link.href = canvas.toDataURL();
                    link.click();
                });
                chartContainer.appendChild(downloadBtn);

                // Create chart
                new Chart(canvas.getContext('2d'), {
                    type: chartData.chartType,
                    data: chartData.data,
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            title: {
                                display: !!chartData.title,
                                text: chartData.title,
                                color: '#00ffff'
                            },
                            legend: {
                                labels: {
                                    color: '#ffffff'
                                }
                            }
                        },
                        scales: chartData.chartType !== 'pie' && chartData.chartType !== 'doughnut' ? {
                            x: {
                                ticks: { color: '#ffffff' },
                                grid: { color: '#333333' }
                            },
                            y: {
                                ticks: { color: '#ffffff' },
                                grid: { color: '#333333' }
                            }
                        } : {}
                    }
                });
            }

            messageElement.querySelector('.message-content').appendChild(chartContainer);
            
        } catch (error) {
            console.error('Error rendering chart:', error);
            this.showError('ไม่สามารถสร้างกราฟได้: ' + error.message);
        }
    }

    // Handle file upload
    async handleFileUpload(files) {
        if (files.length === 0) return;

        const file = files[0];
        const maxSize = 10 * 1024 * 1024; // 10MB

        if (file.size > maxSize) {
            this.showError('ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 10MB)');
            return;
        }

        try {
            const content = await this.readFile(file);
            const analysis = this.dataAnalyzer.analyzeData(content);
            
            // Add file info message
            this.addMessage('user', `📁 อัปโหลดไฟล์: ${file.name}\n\nผลการวิเคราะห์:\n${analysis.summary}`);
            
            // Auto-suggest chart creation
            if (analysis.canCreateChart) {
                const suggestion = `สร้างกราฟ${analysis.suggestedChart}จากข้อมูลที่อัปโหลด`;
                setTimeout(() => {
                    this.messageInput.value = suggestion;
                    this.messageInput.focus();
                }, 1000);
            }
            
        } catch (error) {
            console.error('Error processing file:', error);
            this.showError('ไม่สามารถประมวลผลไฟล์ได้: ' + error.message);
        }
    }

    // Read file content
    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('ไม่สามารถอ่านไฟล์ได้'));
            reader.readAsText(file);
        });
    }

    // Clear chat
    clearChat() {
        if (confirm('ต้องการล้างการสนทนาทั้งหมดหรือไม่?')) {
            this.chatMessages.innerHTML = `
                <div class="message ai-message">
                    <div class="message-avatar">🤖</div>
                    <div class="message-content">
                        <div class="message-text">สวัสดี! ฉันคือ AI Assistant ที่พร้อมช่วยคุณในการแชท วิเคราะห์ข้อมูล และสร้างกราฟ/แผนภูมิ มีอะไรให้ช่วยไหม?</div>
                    </div>
                </div>
            `;
            this.aiApi.clearHistory();
        }
    }

    // Export conversation
    exportConversation() {
        try {
            const exportData = this.aiApi.exportHistory();
            const blob = new Blob([exportData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `ai-conversation-${new Date().toISOString().slice(0, 10)}.json`;
            link.click();
            
            URL.revokeObjectURL(url);
            
        } catch (error) {
            console.error('Error exporting conversation:', error);
            this.showError('ไม่สามารถส่งออกการสนทนาได้: ' + error.message);
        }
    }

    // Show/hide loading indicator
    showLoading(show) {
        this.loadingIndicator.style.display = show ? 'flex' : 'none';
    }

    // Set send button state
    setSendButtonState(enabled) {
        this.sendButton.disabled = !enabled;
        this.sendButton.style.opacity = enabled ? '1' : '0.5';
    }

    // Show error message
    showError(message) {
        this.addMessage('ai', `❌ **ข้อผิดพลาด:** ${message}`);
    }

    // Scroll to bottom of chat
    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }
}

// Add CSS for API key modal
const modalCSS = `
.api-key-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
}

.api-key-modal .modal-content {
    background: var(--primary-bg);
    border: 1px solid var(--accent-color);
    border-radius: 8px;
    padding: 20px;
    max-width: 400px;
    width: 90%;
    text-align: center;
}

.api-key-modal h3 {
    color: var(--accent-color);
    margin-bottom: 10px;
}

.api-key-modal p {
    color: var(--text-color);
    margin-bottom: 15px;
}

.api-key-modal input {
    width: 100%;
    padding: 10px;
    background: var(--secondary-bg);
    border: 1px solid var(--accent-color);
    border-radius: 4px;
    color: var(--text-color);
    margin-bottom: 15px;
}

.api-key-modal .modal-actions {
    display: flex;
    gap: 10px;
    justify-content: center;
}

.api-key-modal button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
}

.api-key-modal .cancel-btn {
    background: #666;
    color: white;
}

.api-key-modal .submit-btn {
    background: var(--accent-color);
    color: var(--primary-bg);
}

.api-key-modal .api-key-note {
    font-size: 12px;
    color: #999;
    margin-top: 15px;
}

.api-key-modal .api-key-note a {
    color: var(--accent-color);
}
`;

// Add modal CSS to document
const style = document.createElement('style');
style.textContent = modalCSS;
document.head.appendChild(style);

// Directly initialize if script is loaded at the end of body
new AIAssistant();

