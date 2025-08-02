"use client";

import { useState, useCallback } from "react";
// Removed Convex imports - we're only extracting text locally
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// Removed Input import - using custom drag-and-drop area instead
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { FileText, Loader2, File, FileIcon } from "lucide-react";
import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist";

// Configure PDF.js worker
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

interface DocumentUploadProps {
  onTextExtracted?: (extractedText: string, fileName: string) => void;
}

export function DocumentUpload({ onTextExtracted }: DocumentUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentlyProcessing, setCurrentlyProcessing] = useState<string>("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [processedFiles, setProcessedFiles] = useState<
    Array<{ name: string; type: string; extractedAt: Date }>
  >([]);
  const { toast } = useToast();

  // Get appropriate icon for file type
  const getFileIcon = (fileName: string) => {
    const extension = fileName.toLowerCase().split(".").pop();
    const iconProps = { className: "h-4 w-4" };

    switch (extension) {
      case "pdf":
        return <File {...iconProps} className="h-4 w-4 text-red-500" />;
      case "docx":
        return <FileText {...iconProps} className="h-4 w-4 text-blue-500" />;
      case "md":
        return <FileIcon {...iconProps} className="h-4 w-4 text-purple-500" />;
      case "txt":
        return <FileText {...iconProps} className="h-4 w-4 text-gray-500" />;
      default:
        return <File {...iconProps} />;
    }
  };

  // Removed Convex mutations - we're only extracting text locally

  // Extract text content from different file types
  const extractContent = useCallback(async (file: File): Promise<string> => {
    const mimeType = file.type;
    const fileName = file.name.toLowerCase();

    // PDF files
    if (mimeType === "application/pdf" || fileName.endsWith(".pdf")) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = "";

        // Extract text from each page
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item) => ("str" in item ? item.str : ""))
            .join(" ");
          fullText += `${pageText}\n\n`;
        }

        if (!fullText.trim()) {
          throw new Error("No text content found in the PDF file");
        }

        return fullText.trim();
      } catch (error) {
        console.error("PDF extraction error:", error);
        throw new Error(
          `Failed to extract PDF content: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }

    // Word documents (.docx)
    if (
      mimeType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      fileName.endsWith(".docx")
    ) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });

        if (!result.value || result.value.trim().length === 0) {
          throw new Error("No text content found in the DOCX file");
        }

        return result.value;
      } catch (error) {
        console.error("DOCX extraction error:", error);
        throw new Error(
          `Failed to extract DOCX content: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }

    // Markdown files
    if (mimeType === "text/markdown" || fileName.endsWith(".md")) {
      try {
        const content = await file.text();
        if (!content || content.trim().length === 0) {
          throw new Error("No content found in the markdown file");
        }
        return content;
      } catch (error) {
        console.error("Markdown extraction error:", error);
        throw new Error(
          `Failed to extract markdown content: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }

    // Plain text files (for compatibility)
    if (mimeType === "text/plain" || fileName.endsWith(".txt")) {
      try {
        const content = await file.text();
        if (!content || content.trim().length === 0) {
          throw new Error("No content found in the text file");
        }
        return content;
      } catch (error) {
        console.error("Text extraction error:", error);
        throw new Error(
          `Failed to extract text content: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }

    // Reject all other file types
    throw new Error(
      "File type not supported. Only PDF, Word (.docx), Markdown (.md), and text (.txt) files are allowed."
    );
  }, []);

  const validateAndAddFiles = (newFiles: FileList | File[]) => {
    const filesToAdd: File[] = [];
    const invalidFiles: string[] = [];

    Array.from(newFiles).forEach((file) => {
      const fileName = file.name.toLowerCase();
      const mimeType = file.type;

      // Validate file type
      const isValidType =
        mimeType === "application/pdf" ||
        fileName.endsWith(".pdf") ||
        mimeType ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        fileName.endsWith(".docx") ||
        mimeType === "text/markdown" ||
        fileName.endsWith(".md") ||
        mimeType === "text/plain" ||
        fileName.endsWith(".txt");

      if (isValidType) {
        // Check if file is already selected (by name and size)
        const isDuplicate = selectedFiles.some(
          (existingFile) =>
            existingFile.name === file.name &&
            existingFile.size === file.size &&
            existingFile.lastModified === file.lastModified
        );
        if (!isDuplicate) {
          filesToAdd.push(file);
        }
      } else {
        invalidFiles.push(file.name);
      }
    });

    if (invalidFiles.length > 0) {
      toast({
        title: "Invalid File Types",
        description: `${invalidFiles.length} file(s) skipped. Only PDF, Word (.docx), Markdown (.md), and text (.txt) files are allowed.`,
        variant: "destructive",
      });
    }

    if (filesToAdd.length > 0) {
      setSelectedFiles((prev) => [...prev, ...filesToAdd]);
      return true;
    }

    // Check if there were duplicates
    const duplicateCount =
      Array.from(newFiles).length - invalidFiles.length - filesToAdd.length;
    if (duplicateCount > 0) {
      toast({
        title: "Duplicate Files",
        description: `${duplicateCount} file(s) already selected`,
        variant: "destructive",
      });
    }

    return false;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      validateAndAddFiles(files);
      // Clear the input to allow re-selecting the same files
      event.target.value = "";
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      validateAndAddFiles(files);
    }
  };

  const resetForm = () => {
    setSelectedFiles([]);
    const fileInput = document.getElementById(
      "file-upload"
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const removeFile = (indexToRemove: number) => {
    setSelectedFiles((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleExtractText = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one file",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    let successCount = 0;
    let failCount = 0;

    try {
      // Process all files
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        setCurrentlyProcessing(
          `${file.name} (${i + 1}/${selectedFiles.length})`
        );

        try {
          // Extract content from the file
          const content = await extractContent(file);

          // Add to processed files list
          setProcessedFiles((prev) => [
            ...prev,
            {
              name: file.name,
              type: file.type,
              extractedAt: new Date(),
            },
          ]);

          // Call the callback with extracted text
          onTextExtracted?.(content, file.name);
          successCount++;
        } catch (error) {
          console.error(`Text extraction error for ${file.name}:`, error);
          failCount++;

          // Show individual file error toast for better user feedback
          toast({
            title: `Failed: ${file.name}`,
            description:
              error instanceof Error ? error.message : "Unknown error occurred",
            variant: "destructive",
          });
        }
      }

      // Show summary toast
      if (successCount > 0 && failCount === 0) {
        toast({
          title: "Success",
          description: `Text extracted successfully from ${successCount} document(s)`,
        });
      } else if (successCount > 0 && failCount > 0) {
        toast({
          title: "Partial Success",
          description: `${successCount} succeeded, ${failCount} failed`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Extraction Failed",
          description: `Failed to extract text from ${failCount} document(s)`,
          variant: "destructive",
        });
      }

      // Clear selected files after processing
      resetForm();
    } finally {
      setIsProcessing(false);
      setCurrentlyProcessing("");
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Extract Text from Document
        </CardTitle>
        <CardDescription>
          Extract text content from multiple documents for further processing.
          Supports PDF, Word (.docx), Markdown (.md), and text (.txt) files. You
          can select and process multiple files at once.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="file-upload">Select or Drop Files</Label>

          {/* Drag and Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
              ${
                isDragOver
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50"
              }
              ${isProcessing ? "opacity-50 pointer-events-none" : "cursor-pointer"}
            `}
            onClick={() => {
              const fileInput = document.getElementById(
                "file-upload"
              ) as HTMLInputElement;
              fileInput?.click();
            }}
          >
            <div className="flex flex-col items-center space-y-4">
              <div
                className={`
                p-4 rounded-full 
                ${isDragOver ? "bg-primary/10" : "bg-muted"}
              `}
              >
                <FileText
                  className={`
                  h-8 w-8 
                  ${isDragOver ? "text-primary" : "text-muted-foreground"}
                `}
                />
              </div>

              <div className="space-y-2">
                <p className="text-lg font-medium">
                  {selectedFiles.length > 0
                    ? `${selectedFiles.length} file(s) ready for extraction`
                    : isDragOver
                      ? "Drop your files here"
                      : "Drop files here or click to browse"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedFiles.length > 0
                    ? "Click 'Extract Text' below, or add more files"
                    : "Supports PDF, Word (.docx), Markdown (.md), and text (.txt) files. You can select multiple files."}
                </p>
              </div>
            </div>

            {/* Hidden file input */}
            <input
              id="file-upload"
              type="file"
              multiple
              onChange={handleFileSelect}
              disabled={isProcessing}
              accept=".pdf,.docx,.md,.txt"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>

        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">
                Selected Files ({selectedFiles.length})
              </h4>
              <Button
                onClick={resetForm}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                Clear All
              </Button>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-3 bg-muted rounded-lg"
                >
                  {getFileIcon(file.name)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB •{" "}
                      {file.type || "Unknown type"}
                    </p>
                  </div>
                  <Button
                    onClick={() => removeFile(index)}
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ✕
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button
          onClick={handleExtractText}
          disabled={selectedFiles.length === 0 || isProcessing}
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {currentlyProcessing
                ? `Processing: ${currentlyProcessing}`
                : `Extracting Text from ${selectedFiles.length} file(s)...`}
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              Extract Text{" "}
              {selectedFiles.length > 0 && `(${selectedFiles.length} files)`}
            </>
          )}
        </Button>

        {processedFiles.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-muted-foreground">
                Recently Processed
              </h4>
              <Button
                onClick={() => setProcessedFiles([])}
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear All
              </Button>
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {processedFiles
                .slice(-5)
                .reverse()
                .map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950/20 rounded-md border border-green-200 dark:border-green-800"
                  >
                    {getFileIcon(file.name)}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate text-green-700 dark:text-green-300">
                        {file.name}
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400">
                        Extracted {file.extractedAt.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
