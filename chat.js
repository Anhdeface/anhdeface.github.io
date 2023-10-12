
// Tạo một mảng để lưu trữ các tin nhắn
let messages = [];

// Lấy DOM elements
const output = document.getElementById('output');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');

// Gửi tin nhắn khi nhấn nút "Gửi"
sendButton.addEventListener('click', function() {
  sendMessage();
});

// Gửi tin nhắn khi nhấn Enter trong input
messageInput.addEventListener('keypress', function(event) {
  if (event.key === 'Enter') {
    sendMessage();
  }
});

function sendMessage() {
  const message = messageInput.value;
  
  // Kiểm tra xem người dùng có nhập tin nhắn hay không
  if (message.trim()) {
    // Lưu tin nhắn vào mảng
    messages.push(message);
    
    // Hiển thị tin nhắn lên giao diện
    output.innerHTML += '<p>' + message + '</p>';
    
    // Reset input
    messageInput.value = '';
  }
}