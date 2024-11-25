document.addEventListener("DOMContentLoaded", () => {
    const downloadUrl = document.getElementById("download-url");
    const fileName = document.getElementById("file-name");
    const fileSize = document.getElementById("file-size");
    const fileLocation = document.getElementById("file-location");

    const warningSection = document.getElementById("warning-section");
    const redirectBtn = document.getElementById("redirect-btn");
    const downloadAnywayBtn = document.getElementById("download-anyway-btn");
    
    // Close button functionality
    document.getElementById("close-btn").onclick = function() {
        // Optionally, you can alert the user that they need to click a button
        alert("Please click one of the buttons to proceed.");
    };

    // Mock Data for Testing (can be removed in production)
    const mockFileMetadata = {
        url: "http://example.com/sample-file.txt",
        fileName: "sample-file.txt",
        fileSize: 12345678, // in bytes
        duplicates: [
            {
                directory: "C:/Downloads/sample-file.txt",
            },
        ],
        isDuplicate: true, // Change to false to simulate a new file scenario
    };

    // Listen for messages from the service worker
    chrome.runtime.onMessage.addListener((message) => {
        const metadata = message.fileMetadata || mockFileMetadata;

        // Clear previous content
        downloadUrl.textContent = metadata.url;
        fileName.textContent = metadata.fileName;
        fileSize.textContent = formatFileSize(metadata.fileSize);
        
        // Check if the file is a duplicate
        if (message && (message.duplicate || metadata.isDuplicate)) {
            fileLocation.textContent = metadata.duplicates[0]?.directory || "Unknown";

            // Show warning section and buttons for duplicates
            warningSection.classList.remove("hidden");
            redirectBtn.classList.remove("hidden");
            downloadAnywayBtn.classList.remove("hidden");

            // Redirect to duplicate file
            redirectBtn.onclick = () => {
                chrome.tabs.create({
                    url: `file://${metadata.duplicates[0]?.directory || ""}`,
                });
                window.close(); // Close the popup after redirection
            };

            // Download Anyway button
            downloadAnywayBtn.onclick = () => {
                chrome.runtime.sendMessage({
                    action: "resumeDownload",
                    downloadId: message.downloadId || "mockDownloadId",
                });
                window.close(); // Close the popup after initiating the download
            };
        } else {
            // File is new
            fileLocation.textContent = "Not found in system";

            // Hide warning section and buttons for new files
            warningSection.classList.add("hidden"); // Hide warning section
            redirectBtn.classList.add("hidden"); // Hide redirect button
            downloadAnywayBtn.classList.add("hidden"); // Hide download anyway button
        }
    });

    // Mock Testing - Trigger Duplicate Check (Can be removed in production)
    setTimeout(() => {
        chrome.runtime.onMessage.dispatch({
            duplicate: mockFileMetadata.isDuplicate,
            fileMetadata: mockFileMetadata,
        });
    }, 1000); // Simulate receiving a message
});

// Format file size for display
function formatFileSize(size) {
    if (size < 1024) return `${size} bytes`;
    if (size < 1048576) return `${(size / 1024).toFixed(2)} KB`;
    return `${(size / 1048576).toFixed(2)} MB`;
}