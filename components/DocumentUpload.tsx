"use client";

import { useState, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Loader2 } from "lucide-react";
import mammoth from "mammoth";

interface DocumentUploadProps {
  onUploadComplete?: () => void;
}

export function DocumentUpload({ onUploadComplete }: DocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const { toast } = useToast();

  const generateUploadUrl = useMutation(api.documents.generateUploadUrl);
  const uploadDocument = useMutation(api.documents.uploadDocument);

  // Extract text content from different file types
  const extractContent = useCallback(async (file: File): Promise<string> => {
    const mimeType = file.type;
    const fileName = file.name.toLowerCase();

    // PDF files
    if (mimeType === "application/pdf" || fileName.endsWith(".pdf")) {
      return `File: ${file.name}\nType: PDF Document\nSize: ${file.size} bytes\n\nPDF content extraction not yet supported. Please use a PDF parsing library like pdf-parse for full text extraction.`;
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
        return result.value;
      } catch (error) {
        return `File: ${file.name}\nType: Word Document\nSize: ${file.size} bytes\n\nError extracting DOCX content: ${error}`;
      }
    }

    // Markdown files
    if (mimeType === "text/markdown" || fileName.endsWith(".md")) {
      try {
        const content = await file.text();
        return content;
      } catch (error) {
        return `File: ${file.name}\nType: Markdown Document\nSize: ${file.size} bytes\n\nError reading markdown content: ${error}`;
      }
    }

    // Plain text files (for compatibility)
    if (mimeType === "text/plain" || fileName.endsWith(".txt")) {
      try {
        const content = await file.text();
        return content;
      } catch (error) {
        return `File: ${file.name}\nType: Text Document\nSize: ${file.size} bytes\n\nError reading text content: ${error}`;
      }
    }

    // Reject all other file types
    throw new Error(
      "File type not supported. Only PDF, Word (.docx), Markdown (.md), and text (.txt) files are allowed."
    );
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
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

      if (!isValidType) {
        toast({
          title: "Invalid File Type",
          description:
            "Only PDF, Word (.docx), Markdown (.md), and text (.txt) files are allowed.",
          variant: "destructive",
        });
        // Clear the input
        event.target.value = "";
        return;
      }

      setSelectedFile(file);
      if (!title) {
        // Auto-generate title from filename
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        setTitle(nameWithoutExt);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !title.trim()) {
      toast({
        title: "Error",
        description: "Please select a file and enter a title",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Generate upload URL
      const uploadUrl = await generateUploadUrl();

      // Upload file to Convex storage
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": selectedFile.type },
        body: selectedFile,
      });

      if (!result.ok) {
        throw new Error("Failed to upload file");
      }

      const { storageId } = await result.json();

      // Extract content from the file
      let content: string;
      try {
        content = await extractContent(selectedFile);
      } catch (extractError) {
        // Delete the uploaded file since extraction failed
        await fetch(
          `${process.env.NEXT_PUBLIC_CONVEX_URL}/api/storage/${storageId}`,
          {
            method: "DELETE",
          }
        ).catch(() => {}); // Ignore deletion errors

        throw extractError;
      }

      // Save document record
      await uploadDocument({
        title: title.trim(),
        filename: selectedFile.name,
        fileSize: selectedFile.size,
        mimeType: selectedFile.type,
        content,
        storageId,
      });

      toast({
        title: "Success",
        description: "Document uploaded and processed successfully",
      });

      // Reset form
      setSelectedFile(null);
      setTitle("");
      const fileInput = document.getElementById(
        "file-upload"
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      onUploadComplete?.();
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Document
        </CardTitle>
        <CardDescription>
          Upload and extract content from your documents. Supports PDF, Word
          (.docx), Markdown (.md), and text (.txt) files.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Document Title</Label>
          <Input
            id="title"
            placeholder="Enter document title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isUploading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="file-upload">Select File</Label>
          <Input
            id="file-upload"
            type="file"
            onChange={handleFileSelect}
            disabled={isUploading}
            accept=".pdf,.docx,.md,.txt"
          />
        </div>

        {selectedFile && (
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <FileText className="h-4 w-4" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024).toFixed(1)} KB •{" "}
                {selectedFile.type || "Unknown type"}
              </p>
            </div>
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={!selectedFile || !title.trim() || isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
