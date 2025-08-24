let lastPageVisited = "";
const deleteIcon = chrome.runtime.getURL("/assets/delete.png");

const observer = new MutationObserver(() => {
    handleContentChange();
});
observer.observe(document.body, { childList: true, subtree: true });
handleContentChange();

function handleContentChange() {
    if (isPageChange()) handlePageChange();
}
function isPageChange() {
    const current = window.location.pathname;
    if (current !== lastPageVisited) { lastPageVisited = current; return true; }
    else return false;
}



function handlePageChange() {
    if (isCurrentPageIsTarget()) {
        cleanUpPage();
        addInjectScript();
        addHelpButton();

    }
}

function isCurrentPageIsTarget() {
    const path = window.location.pathname;
    if (path.startsWith("/problems/") && ((path.length) > ("/problems/".length))) return true;
    else return false;
}


function cleanUpPage() {
    const aihelpButton = document.getElementById("help-button");
    if (aihelpButton) aihelpButton.remove();
    const chatboxCon = document.getElementById("chat-box-container");
    if (chatboxCon) chatboxCon.remove();
}



addInjectScript();
const problemDataMap = new Map();

window.addEventListener("xhrDataFetched", (event) => {
    const data = event.detail;
    // so checking with the our wanted network call if it matches with our required network call
    // lets say our data and all things under some n/w cll then go to headers of it and see te url
    // when the our inject files matches with that url then we do store that data
    if (data.url && data.url.match(/^https:\/\/api2\.maang\.in\/problems\/user\/\d+/)) {
        const idMatch = data.url.match(/\/(\d+)(?=\?|$)/);
        if (idMatch) {
            const id = idMatch[1];
            problemDataMap.set(id, data.response);
            console.log("Data is fetched ", id, data.response);
        }
    }
})
// now we got the data of any problem and its details 



function makeAvatar(type) {
    const wrap = document.createElement("div");
    wrap.style.width = "40px";
    wrap.style.height = "40px";
    wrap.style.minWidth = "40px";
    wrap.style.borderRadius = "50%";
    wrap.style.display = "flex";
    wrap.style.alignItems = "center";
    wrap.style.justifyContent = "center";
    wrap.style.fontSize = "18px";
    wrap.style.boxShadow = "0 4px 8px rgba(2,6,23,0.08)";
    if (type === "user") {
        wrap.style.background = "#06b6d4";
        wrap.style.color = "#ffffff";
        wrap.textContent = "👤";
    } else {
        wrap.style.background = "#f1f5f9";
        wrap.style.color = "#0f1724";
        wrap.textContent = "🤖";
    }
    return wrap;
}


function makeMessageRow(type, text) {
    //if (type === "bot") console.log(text);
    if (type === "user") document.getElementById("inp").value = "";
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.alignItems = "flex-start";
    row.style.gap = "10px";

    const avatar = makeAvatar(type);
    const msg = document.createElement("div");
    msg.textContent = text;
    msg.style.padding = "8px 12px";
    msg.style.borderRadius = "12px";
    msg.style.margin = "6px 0";
    msg.style.maxWidth = "80%";
    msg.style.wordWrap = "break-word";

    if (type === "user") {
        msg.style.background = "#007bff";
        msg.style.color = "white";
        msg.style.alignSelf = "flex-end";
        row.style.justifyContent = "flex-end";

        row.appendChild(msg);
        row.appendChild(avatar);
    } else {
        msg.style.background = "#f1f5f9";
        msg.style.color = "#0f1724";
        msg.style.alignSelf = "flex-start";
        row.style.justifyContent = "flex-start";

        row.appendChild(avatar);
        row.appendChild(msg);
    }

    const messagesArea = document.getElementById("chat-messages");
    messagesArea.appendChild(row);


}




let chatHistory = []; // keeps track of chat history


async function sendMessageToAPI(value) {

    const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
    const API_KEY = "AIzaSyCr45yUpPYl5SiPBTLXx-k1H3ijNqkt9Y4";

    // Adds the user message with role as "user" describing it is user message

    chatHistory.push({
        role: "user",
        parts: [
            { text: value }
        ]
    });

    try {
        const payload = {
            contents: chatHistory
        }
        const response = await fetch(`${API_URL}?key=${API_KEY}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)

        });
        if (response.ok === false) {
            throw new Error(`Error Occured`);
        }
        const data = await response.json();
        const aiResponse = data.candidates[0].content.parts[0].text;

        chatHistory.push({
            role: "model",
            parts: [
                { text: aiResponse }
            ]
        })
        try {
            return aiResponse;
        }
        catch (err) {
            return "Unable to fetch text";
        }

    }
    catch (err) {
        console.log(err);
    }


}


function addChatBoxConainer() {
    if (document.getElementById("chat-box-container")) return;

    const outerContainer = document.createElement("div");
    outerContainer.id = "chat-box-container";
    outerContainer.style.position = "fixed";
    outerContainer.style.bottom = "24px";
    outerContainer.style.left = "24px";
    outerContainer.style.width = "520px";
    outerContainer.style.maxWidth = "calc(100% - 48px)";
    outerContainer.style.height = "520px";
    outerContainer.style.background = "#ffffff";
    outerContainer.style.border = "1px solid rgba(15,23,36,0.06)";
    outerContainer.style.borderRadius = "14px";
    outerContainer.style.boxShadow = "0 20px 40px rgba(2,6,23,0.18)";
    outerContainer.style.display = "flex";
    outerContainer.style.flexDirection = "column";
    outerContainer.style.zIndex = "99999";
    outerContainer.style.fontFamily = "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial";
    outerContainer.style.resize = "both";
    outerContainer.style.overflow = "auto";
    outerContainer.style.minWidth = "320px";
    outerContainer.style.minHeight = "320px";
    outerContainer.style.resize = "both";
    outerContainer.style.overflow = "auto";
    outerContainer.style.minWidth = "320px";
    outerContainer.style.minHeight = "320px";

    const header = document.createElement("div");
    header.textContent = "AI Assistant";
    header.style.background = "linear-gradient(90deg, #0f1724 0%, #0b3b3b 100%)";
    header.style.color = "#E6F0FF";
    header.style.padding = "16px 20px";
    header.style.fontWeight = "700";
    header.style.fontSize = "18px";
    header.style.display = "flex";
    header.style.alignItems = "center";
    header.style.justifyContent = "flex-start";
    header.style.gap = "12px";
    header.style.borderTopLeftRadius = "14px";
    header.style.borderTopRightRadius = "14px";
    header.style.boxShadow = "0 4px 12px rgba(15,23,36,0.2)";

    const statusDot = document.createElement("span");
    statusDot.style.width = "10px";
    statusDot.style.height = "10px";
    statusDot.style.borderRadius = "50%";
    statusDot.style.background = "#06b6d4";
    header.insertAdjacentElement("afterbegin", statusDot);


    const deleteIcon = document.createElement("img");
    deleteIcon.src = chrome.runtime.getURL("/assets/delete.png");
    deleteIcon.style.width = "16px";
    deleteIcon.style.height = "16px";
    deleteIcon.style.cursor = "pointer";
    deleteIcon.style.marginLeft = "auto";
    deleteIcon.addEventListener("click", () => {
        outerContainer.remove();
    });
    header.appendChild(deleteIcon);


    const messagesArea = document.createElement("div");
    messagesArea.id = "chat-messages";
    messagesArea.style.flex = "1";
    messagesArea.style.padding = "18px";
    messagesArea.style.overflowY = "auto";
    messagesArea.style.fontSize = "14px";
    messagesArea.style.display = "flex";
    messagesArea.style.flexDirection = "column";
    messagesArea.style.gap = "12px";
    messagesArea.style.background = "linear-gradient(180deg, #ffffff 0%, #fbfdff 100%)";



    const inputArea = document.createElement("div");
    inputArea.style.display = "flex";
    inputArea.style.borderTop = "1px solid rgba(15,23,36,0.04)";
    inputArea.style.padding = "12px";
    inputArea.style.gap = "10px";
    inputArea.style.alignItems = "center";
    inputArea.style.background = "#ffffff";

    const input = document.createElement("input");
    input.type = "text";
    input.id = "inp";
    input.placeholder = "Ask about the problem, or paste code snippet...";
    input.style.flex = "1";
    input.style.padding = "12px 14px";
    input.style.border = "1px solid rgba(15,23,36,0.06)";
    input.style.borderRadius = "12px";
    input.style.fontSize = "14px";
    input.style.outline = "none";
    input.autocomplete = "off";

    const sendButton = document.createElement("button");
    sendButton.id = "send-btn";
    sendButton.textContent = "Send";
    sendButton.style.padding = "10px 16px";
    sendButton.style.background = "#ff6b6b";
    sendButton.style.color = "#ffffff";
    sendButton.style.border = "none";
    sendButton.style.borderRadius = "10px";
    sendButton.style.cursor = "pointer";
    sendButton.style.fontWeight = "600";


    const thinking = document.createElement("h3");
    thinking.id = "thinking-text";
    thinking.textContent = "Thinking...";
    thinking.style.margin = "0";
    thinking.style.padding = "8px 12px";
    thinking.style.borderRadius = "12px";
    thinking.style.background = "#f1f5f9";
    thinking.style.color = "#0f1724";
    thinking.style.fontSize = "14px";
    thinking.style.fontWeight = "500";
    thinking.style.fontStyle = "italic";
    thinking.style.display = "inline-block";
    thinking.style.alignSelf = "flex-start";
    thinking.style.boxShadow = "0 2px 6px rgba(0,0,0,0.1)";


    input.addEventListener("keydown", async (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const inputValue = document.getElementById("inp").value;
            makeMessageRow("user", inputValue);
            console.log(inputValue);
            document.getElementById("chat-messages").appendChild(thinking)
            const data = await sendMessageToAPI(inputValue);
            thinking.remove();
            makeMessageRow("bot", data);
        }
    });

    sendButton.addEventListener("click", async (e) => {
        e.preventDefault();
        const inputValue = document.getElementById("inp").value;
        makeMessageRow("user", inputValue);
        document.getElementById("chat-messages").appendChild(thinking)
        const data = await sendMessageToAPI(inputValue);
        thinking.remove();
        makeMessageRow("bot", data);

    });






    inputArea.appendChild(input);
    inputArea.appendChild(sendButton);
    outerContainer.appendChild(header);
    outerContainer.appendChild(messagesArea);
    outerContainer.appendChild(inputArea);

    const parentOnFronted = document.getElementsByClassName("coding_nav_bg__HRkIn")[0];
    parentOnFronted.insertAdjacentElement("beforebegin", outerContainer);
}



function addHelpButton() {
    if (document.getElementById("help-button")) return;

    const helpButton = document.createElement("button");
    helpButton.id = "help-button";
    helpButton.textContent = "AI HELP";
    helpButton.style.width = "110px";
    helpButton.style.height = "40px";
    helpButton.style.backgroundColor = "#0f1724";
    helpButton.style.color = "#E6F0FF";
    helpButton.style.fontWeight = "700";
    helpButton.style.fontSize = "14px";
    helpButton.style.border = "1px solid rgba(230,240,255,0.06)";
    helpButton.style.borderRadius = "10px";
    helpButton.style.cursor = "pointer";
    helpButton.style.boxShadow = "0 6px 18px rgba(15,23,36,0.32)";

    helpButton.addEventListener("mouseover", () => {
        helpButton.style.transform = "translateY(-1px)";
    });
    helpButton.addEventListener("mouseout", () => {
        helpButton.style.transform = "translateY(0)";
    });

    const askDoubtButton = document.getElementsByClassName("coding_problem_info_heading__G9ueL")[0];
    askDoubtButton.insertAdjacentElement("beforebegin", helpButton);

    helpButton.addEventListener("click", () => {
        addChatBoxConainer();
    });
}



// -----------------------------------------  code context -------------------------------------

function getProblemId() {
    const url = window.location.pathname
    const parts = url.split('/');
    let lastPart = parts[parts.length - 1];

    let id = '';
    for (let i = lastPart.length - 1; i >= 0; i--) {
        if (isNaN(lastPart[i])) {
            break;
        }
        id = lastPart[i] + id;
    }

    return id;
}

function getLang() {
    const lang = localStorage.getItem("editor-language");
    return lang;
}

function getLocalStoragecodeById() {
    const id = getProblemId();
    let lang = getLang();
    lang = lang.slice(1, -1);
    let key = `course_27758_${id}_${lang}`;
    const data = localStorage.getItem(key);
    if (data === null) console.log(`problem with corresponding key ${id} is not found`);
    return data;
}


//-------------------------- inject script file to DOM and overriding fetch to get data--------------------------

function addInjectScript() {    // defined to inject a javascript file into this inorder to override xhr request
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL("inject.js");
    script.onload = () => {
        script.remove();   // used bcoz when script is fully loaded and executed and got data then remove it 
    }
    document.documentElement.appendChild(script); //inserted into dom
}


function getProblemDataById(id) {
    if (id && problemDataMap.has(id)) {
        return problemDataMap.get(id);
    }
    else return null;
}

//Note: we may think why not to do fetch() from content.js to problem url . but here problem is it is not public api
// everyone cant accesse it it has authorization so we injected a script into dom inorder to overide the xhr() and got data and bearer token is changed overtime on every refresh it gets some random

//  Interactive chat

// until now we implemented a chatbot but when we send prompts and lets say prompt1:hi and then 
// second prompt is : what is my first message . then it doesnt give the answer it gives other text
// means it doesnt save the history or doesnt have the history of our prompts then what is the use of it
// bcoz in 2nd prompt if we asked a question related to 1st prompt then it doesnt give response according to previous prompts it takes it as new message and no history and gives new response.

// Every prompt is taken as new prompt ans gives new response . doesnt give response according to previous chats
// Basically it doesnt have the memory

// Every API call is a new conversation . For a new api call it doesnt have data of prvious api calls and the responses

// so now add the interactive chat so to make it interactive we have to have storage or data of previous chats 

// we can go to gemini api and see the interactive chat session for it so maintain a chatHistory variable for it 
// see the gemini interactive chat documentation and we have to maintain it like that to make it interactive