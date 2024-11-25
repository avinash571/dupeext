chrome.downloads.onCreated.addListener(async (downloadItem) => {
    try {
      // Pause the download
      chrome.downloads.pause(downloadItem.id);
  
      // Extract metadata
      const fileMetadata = {
        fileName: downloadItem.filename || "Unknown",
        fileSize: downloadItem.fileSize || 0,
        url: downloadItem.url || "Unknown",
        timestamp: new Date().toISOString(),
      };
  
      // Call backend to check for duplicates
      const duplicateResponse = await checkForDuplicate(fileMetadata);
  
      if (duplicateResponse.isDuplicate) {
        // Send duplicate information to popup
        chrome.runtime.sendMessage({
          duplicate: true,
          fileMetadata,
          duplicates: duplicateResponse.duplicates,
        });
      } else {
        // Send new file information to popup
        chrome.runtime.sendMessage({
          duplicate: false,
          fileMetadata,
        });
      }
    } catch (error) {
      console.error("Error handling download:", error);
    }
  });
  
  // Backend API call to check duplicates
  async function checkForDuplicate(fileMetadata) {
    try {
      const response = await fetch("https://your-backend-api/checkDuplicate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fileMetadata),
      });
  
      // Ensure the response is valid
      if (!response.ok) {
        throw new Error("Failed to check for duplicates");
      }
  
      return await response.json(); // Expected response: { isDuplicate: true, duplicates: [...] }
    } catch (error) {
      console.error("Error checking for duplicates:", error);
      return { isDuplicate: false, duplicates: [] };
    }
  }
  
  // Handle messages from popup buttons
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "resumeDownload" && message.downloadId) {
      chrome.downloads.resume(message.downloadId);
      sendResponse({ status: "Download resumed" });
    }
  });
  