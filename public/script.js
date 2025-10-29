// --- 1. SELECTORS ---
let prompt = document.querySelector("#prompt");
let chatContainer = document.querySelector(".chat-container");
let imagebtn = document.querySelector("#image");
let imageinput = document.querySelector("#image input");
let submitButton = document.querySelector("#submit"); // <-- 1. ADDED THIS

// --- 2. GLOBAL USER OBJECT ---
let user = {
    message: null,
    file: {
        mime_type: null,
        data: null
    }
};

// --- 3. HELPER FUNCTION (Arrow Function) ---
const createChatBox = (html, classes) => {
    let div = document.createElement("div");
    div.innerHTML = html;
    div.classList.add(classes);
    return div;
};

// --- 4. GENERATE RESPONSE (Arrow Function) ---
const generateResponse = async (aiChatBox) => {
    let text = aiChatBox.querySelector(".ai-chat-area");

    // 1. Create the parts array with the text message first
    let partsArray = [
        {
            "text": user.message
        }
    ];

    // 2. If a file exists, push the image object into the array
    if (user.file.data) {
        partsArray.push({
            "inline_data": {
                "mime_type": user.file.mime_type,
                "data": user.file.data
            }
        });
        
        // 3. Clear the file so it doesn't get sent again
        user.file = { mime_type: null, data: null };
    }

    // 4. Create the final 'contents' object to send
    const contents = [
        {
            "parts": partsArray
        }
    ];

    // 5. Create the RequestOption for your server
    let RequestOption = {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        // Send the 'contents' object in the body
        body: JSON.stringify({ contents: contents })
    };

    try {
        // 6. Call your server's API endpoint
        let response = await fetch('/api/generate', RequestOption);
        
        let data = await response.json(); // This fails if 'response' is empty

        // 8. Add error checking for API errors
        if (data.error) {
            console.log("API Error:", data.error.message);
            text.innerHTML = `Error from API: ${data.error.message}`;
            return;
        }

        let apiResponse = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1").trim();
        text.innerHTML = apiResponse;

    } catch (error) {
        // This catches the 'Unexpected end of JSON' error
        console.log(error); 
        text.innerHTML = "Error: The server sent an empty response. Check the server's terminal (running `node server.js`) for the real error message.";
    } finally {
        chatContainer.scrollTo({ top: chatContainer.scrollHeight, behaviour: "smooth" });
    }
};

// --- 5. HANDLE CHAT (Arrow Function) ---
const handlechatResponse = (userMessage) => {
    user.message = userMessage; // Save the message
    
    // Use user.message (lowercase 'm')
    let html = `<img src="user.svg" alt="" id="userImage" width="50">
    <div class="user-chat-area">
    ${user.message}
    </div>`;
    
    prompt.value = ""; // Clear the input
    let userChatBox = createChatBox(html, "user-chat-box");
    chatContainer.appendChild(userChatBox);
    chatContainer.scrollTo({ top: chatContainer.scrollHeight, behaviour: "smooth" });

    // Show AI loading and call the API
    setTimeout(() => {
        let html = `<img src="ai.png" alt="" id="aiImage" width="50">
<div class="ai-chat-area">
<img src="loading.svg" alt="" class="loading"  width="50px">
</div>`;
        let aiChatBox = createChatBox(html, "ai-chat-box");
        chatContainer.appendChild(aiChatBox);
        chatContainer.scrollTo({ top: chatContainer.scrollHeight, behaviour: "smooth" });
        generateResponse(aiChatBox);
    }, 500);
};

// --- 6. NEW HELPER FUNCTION TO SEND MESSAGE ---
const sendMessage = () => {
    const message = prompt.value.trim(); // Get clean message
    if (message) { // Only send if not empty
        handlechatResponse(message);
    }
};

// --- 7. "ENTER" KEY LISTENER (UPDATED) ---
prompt.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault(); // Stops page reload
        sendMessage(); // Call the helper function
    }
});

// --- 8. SUBMIT BUTTON CLICK LISTENER (NEW) ---
submitButton.addEventListener("click", () => {
    sendMessage(); // Call the same helper function
});

// --- 9. IMAGE INPUT LISTENER (FIXED) ---
imageinput.addEventListener("change", () => {
    const file = imageinput.files[0];
    if (!file) return;
    
    let reader = new FileReader();
    reader.onload = (e) => {
        let base64string = e.target.result.split(",")[1];
        user.file = {
            mime_type: file.type,
            data: base64string // <-- FIX: Save the data, not 'null'
        };
    };
    reader.readAsDataURL(file);
});

// --- 10. IMAGE BUTTON CLICK LISTENER (FIXED) ---
imagebtn.addEventListener("click", () => { 
    imageinput.click(); 
});