import { baseUrl } from "../config/api";
import { getToken } from "./token";

/**
 * Exports all comments for a project as an SRT subtitle file
 * @param projectId - The ID of the project
 * @param projectName - Optional project name for the filename
 */
export const exportCommentsToSrt = async (
  projectId: string,
  projectName?: string
): Promise<void> => {
  try {
    const token = getToken();

    const response = await fetch(`${baseUrl}/projects/${projectId}/export/srt`, {
      method: "GET",
      headers: {
        ...(token ? { Authorization: token } : {}),
      },
    });

    if (!response.ok) {
      // Check if it's a JSON error response
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to export comments");
      } else {
        throw new Error(`Failed to export comments: ${response.statusText}`);
      }
    }

    // Get the SRT content as text
    const srtContent = await response.text();

    // Create a blob from the content
    const blob = new Blob([srtContent], { type: "text/plain;charset=utf-8" });

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;

    // Set filename from header or use projectName or default
    const contentDisposition = response.headers.get("content-disposition");
    let filename = "comments.srt";

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    } else if (projectName) {
      const safeName = projectName.replace(/[^a-z0-9]/gi, "_").toLowerCase();
      filename = `${safeName}_comments.srt`;
    }

    link.download = filename;

    // Trigger download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error exporting SRT file:", error);
    throw error;
  }
};
