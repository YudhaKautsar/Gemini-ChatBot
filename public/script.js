const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  appendMessage('user', userMessage);
  input.value = '';

  // Disable form while waiting for response
  const sendButton = form.querySelector('button');
  input.disabled = true;
  sendButton.disabled = true;

  // Create a placeholder for the bot's response and show "Thinking..."
  const botMessageElement = document.createElement('div');
  botMessageElement.classList.add('message', 'bot');
  botMessageElement.textContent = 'Gemini still thinking...';
  chatBox.appendChild(botMessageElement);
  chatBox.scrollTop = chatBox.scrollHeight;

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: userMessage }),
    });

    // We expect a JSON response for both success and error cases
    const data = await response.json();

    if (!response.ok) {
      // The backend provides a 'reply' field for errors, use it.
      throw new Error(data.reply || `Request failed with status ${response.status}`);
    }
    // Update the placeholder with the actual response
    botMessageElement.textContent = data.reply;
  } catch (error) {
    console.error('Fetch error:', error);
    // Update the placeholder with the error message
    botMessageElement.textContent = `Sorry, I ran into an error: ${error.message}`;
    botMessageElement.classList.add('error'); // Optional: for styling error messages
  } finally {
    // Re-enable form
    input.disabled = false;
    sendButton.disabled = false;
    input.focus();
    // Scroll again in case the new message is long
    chatBox.scrollTop = chatBox.scrollHeight;
  }
});

function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}
