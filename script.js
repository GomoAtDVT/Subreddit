const startBtn = document.querySelector("#subreddit-prompt");
const PlusMinusBtn = document.querySelector(".add-btn");
const subredditInput = document.getElementById("subreddit-input");
const subredditListTitle = document.getElementById("subreddit-tab-title");
const menuBtn = document.getElementById("menu-btn-container");
const wrapper = document.querySelector(".wrapper");
const form = document.querySelector(".enter-subreddit-form");
const tabsContainer = document.getElementById("tabs-container");
const contentContainer = document.getElementById("subreddit-content-container");

// Track the current active tab
let activeTabId = null;
// Store subreddit data
const subreddits = [];


function simplify(){
  const direction = document.querySelector("#direction");
  direction.style.display = "none";
}

function displayModal() {
    startBtn.showModal();
    simplify();
}

function closeModal() {
  startBtn.close();
}

// Prevent closing modal when clicking inside form
form.addEventListener("click", function (e) {
  e.stopPropagation();
});

// Close modal when clicking outside the form
wrapper.addEventListener("click", function () {
  closeModal();
});

function openMenu() {
  menuBtn.classList.toggle("active");
}

// Create a unique ID for each tab
function generateTabId() {
  return 'tab-' + Date.now();
}

// Switch to a specific tab
function switchToTab(tabId) {
  // Remove active class from all tabs and content panels
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.remove('active');
  });
  
  document.querySelectorAll('.content-panel').forEach(panel => {
    panel.classList.remove('active');
  });
  
  // Add active class to selected tab and its content panel
  const selectedTab = document.getElementById(tabId);
  const selectedContent = document.getElementById(tabId + '-content');
  
  if (selectedTab && selectedContent) {
    selectedTab.classList.add('active');
    selectedContent.classList.add('active');
    activeTabId = tabId;
    
    // Update the tab title
    const subredditName = selectedTab.getAttribute('data-subreddit');
    subredditListTitle.innerHTML = `${subredditName}
      <button onclick="openMenu()" id="menu-btn" class="menu-btn"><i class="bi bi-three-dots-vertical"></i></button>`;
  }
}

// Refresh the current active tab
function refreshCurrentTab() {
  if (activeTabId) {
    const subredditName = document.getElementById(activeTabId).getAttribute('data-subreddit');
    fetchSubredditData(subredditName, activeTabId);
  }
  menuBtn.classList.remove("active");
}

// Delete the current active tab
function deleteCurrentTab() {
  if (activeTabId) {
    // Remove the tab and its content
    const tabToRemove = document.getElementById(activeTabId);
    const contentToRemove = document.getElementById(activeTabId + '-content');
    
    if (tabToRemove && contentToRemove) {
      // Find the index of the tab to remove
      const index = subreddits.findIndex(sr => sr.id === activeTabId);
      if (index !== -1) {
        subreddits.splice(index, 1);
      }
      
      tabToRemove.remove();
      contentToRemove.remove();
      
      // Switch to another tab if available
      if (subreddits.length > 0) {
        switchToTab(subreddits[0].id);
      } else {
        // No tabs left
        subredditListTitle.innerHTML = '';
        activeTabId = null;
      }
    }
  }
  menuBtn.classList.remove("active");
}

// Fetch data for a subreddit and update the UI
async function fetchSubredditData(subredditName, tabId) {
  const url = `https://www.reddit.com/r/${subredditName}.json`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    
    const json = await response.json();
    const contentPanel = document.getElementById(tabId + '-content');
    
    if (contentPanel) {
      contentPanel.innerHTML = `
        <div class="content-panel-inner">
          ${json.data.children.map(child => {
            return `<p class="title-holder">
              <span class="post-title">${child.data.title}</span><br><br>
              ${child.data.ups} Ups    
              <a href="${child.data.url}">${child.data.domain}</a>
            </p>`;
          }).join('')}
        </div>
      `;
    }
    
    // Update the tab title if this is the active tab
    if (tabId === activeTabId) {
      subredditListTitle.innerHTML = `${subredditName}
        <button onclick="openMenu()" id="menu-btn" class="menu-btn"><i class="bi bi-three-dots-vertical"></i></button>`;
    }
    
  } catch (error) {
    console.error(error.message);
    const contentPanel = document.getElementById(tabId + '-content');
    if (contentPanel) {
      contentPanel.innerHTML = `<p class="title-holder">Error loading r/${subredditName}: ${error.message}</p>`;
    }
  }
}



// Main function to search for a subreddit and create a new tab
async function searchChannel() {
  const subredditName = subredditInput.value.trim();
  
  if (!subredditName) {
    return;
  }
  
  // Check if this subreddit already has a tab
  const existingTab = subreddits.find(sr => sr.name.toLowerCase() === subredditName.toLowerCase());
  if (existingTab) {
    // Switch to the existing tab instead of creating a new one
    switchToTab(existingTab.id);
    closeModal();
    subredditInput.value = '';
    return;
  }
  
  // Create a new tab ID
  const tabId = generateTabId();
  
  // Create and add the new tab
  const tabElement = document.createElement('div');
  tabElement.id = tabId;
  tabElement.className = 'tab';
  tabElement.setAttribute('data-subreddit', subredditName);
  tabElement.textContent = subredditName;
  tabElement.addEventListener('click', () => switchToTab(tabId));
  tabsContainer.appendChild(tabElement);
  
  // Create and add the content panel
  const contentPanel = document.createElement('div');
  contentPanel.id = tabId + '-content';
  contentPanel.className = 'content-panel';
  contentPanel.innerHTML = '<p class="title-holder">Loading...</p>';
  contentContainer.appendChild(contentPanel);
  
  // Add to subreddits array
  subreddits.push({
    id: tabId,
    name: subredditName
  });
  
  // Switch to the new tab
  switchToTab(tabId);
  
  // Fetch the data for this subreddit
  await fetchSubredditData(subredditName, tabId);
  
  // Clear the input and close the modal
  subredditInput.value = '';
  closeModal();
}
